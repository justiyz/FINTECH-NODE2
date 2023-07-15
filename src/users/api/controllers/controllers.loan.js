import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import loanQueries from '../queries/queries.loan';
import notificationQueries from '../queries/queries.notification';
import clusterQueries from '../queries/queries.cluster';
import { processAnyData, processOneOrNoneData, processNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import config from '../../config';
import AdminMailService from '../../../admins/api/services/services.email';
import MailService from '../services/services.email';
import LoanPayload from '../../lib/payloads/lib.payload.loan';
import { sendNotificationToAdmin } from '../services/services.firebase';
import { loanApplicationEligibilityCheck, loanApplicationRenegotiation } from '../services/service.seedfiUnderwriting';
import { userActivityTracking } from '../../lib/monitor';
import { initiateTransfer, initializeCardPayment, initializeBankAccountChargeForLoanRepayment, 
  initializeDebitCarAuthChargeForLoanRepayment, submitPaymentOtpWithReference, initializeBankTransferPayment 
} from '../services/service.paystack';
import { generateOfferLetterPDF } from '../../lib/utils/lib.util.helpers';
import * as adminNotification from '../../lib/templates/adminNotification';

/**
 * check if user is eligible for loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns summary of loan based on loan decision
 * @memberof LoanController
 */
export const checkUserLoanEligibility = async(req, res, next) => {
  try {
    const { user, body, userEmploymentDetails, userLoanDiscount, userDefaultAccountDetails, cluster_type, user_allowable_amount, previous_loan_count } = req;
    const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'loan application' ]);
    const userMonoId = userDefaultAccountDetails.mono_account_id === null ? '' : userDefaultAccountDetails.mono_account_id;
    const userBvn = await processOneOrNoneData(loanQueries.fetchUserBvn, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user bvn from the db checkUserLoanEligibility.controllers.loan.js`);
    const [ userPreviouslyDefaulted ] = await processAnyData(loanQueries.checkIfUserHasPreviouslyDefaultedInLoanRepayment, [ user.user_id ]);
    const previouslyDefaulted = userPreviouslyDefaulted ? true : false;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user previously defaulted in loan repayment checkUserLoanEligibility.controllers.loan.js`);
    const loanApplicationDetails = await processOneOrNoneData(loanQueries.initiatePersonalLoanApplication, 
      [ user.user_id, parseFloat(body.amount), parseFloat(body.amount), body.loan_reason, body.duration_in_months, body.duration_in_months ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: initiated loan application in the db checkUserLoanEligibility.controllers.loan.js`);
    const payload = await LoanPayload.checkUserEligibilityPayload(user, body, userDefaultAccountDetails, loanApplicationDetails, 
      userEmploymentDetails, userBvn, userMonoId, userLoanDiscount, cluster_type, user_allowable_amount, previous_loan_count, previouslyDefaulted);
    const result = await loanApplicationEligibilityCheck(payload);
    if (result.status !== 200) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status check failed checkUserLoanEligibility.controllers.loan.js`);
      await processNoneData(loanQueries.deleteInitiatedLoanApplication, [ loanApplicationDetails.loan_id, user.user_id ]);
      if (result.status >= 500) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: returned response from underwriting is of a 500 plus status 
        checkUserLoanEligibility.controllers.loan.js`);
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Failed Loan Application', adminNotification.loanApplicationDownTime(), 
            [ `${user.first_name} ${user.last_name}` ], 'failed-loan-application');
        });
        userActivityTracking(req.user.user_id, 37, 'fail');
        return ApiResponse.error(res, enums.UNDERWRITING_SERVICE_NOT_AVAILABLE, enums.HTTP_SERVICE_UNAVAILABLE, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
      }
      if (result.response.data?.message === 'Service unavailable loan application can\'t be completed. Please try again later.') {
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Failed Loan Application', adminNotification.loanApplicationDownTime(), 
            [ `${user.first_name} ${user.last_name}` ], 'failed-loan-application');
        });
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user just initiated loan application deleted checkUserLoanEligibility.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, result.response.data.message, result.response.status, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }
    const { data } = result;
    if (data.final_decision === 'DECLINED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status shows user is not eligible for loan 
      checkUserLoanEligibility.controllers.loan.js`);
      const declinedDecisionPayload = LoanPayload.processDeclinedLoanDecisionUpdatePayload(data);
      const updatedLoanDetails = await processOneOrNoneData(loanQueries.updateUserDeclinedDecisionLoanApplication, declinedDecisionPayload);
      userActivityTracking(req.user.user_id, 37, 'fail');
      userActivityTracking(req.user.user_id, 40, 'success');
      const returnData = await LoanPayload.loanApplicationDeclinedDecisionResponse(user, data, updatedLoanDetails.status, 'DECLINED');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_DECLINED_DECISION, enums.HTTP_OK, returnData);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status shows user is eligible for loan 
    checkUserLoanEligibility.controllers.loan.js`);
    const totalFees = (parseFloat(data.fees.processing_fee) + parseFloat(data.fees.insurance_fee) + parseFloat(data.fees.advisory_fee));
    const totalMonthlyRepayment = (parseFloat(data.monthly_repayment) * Number(data.loan_duration_in_month));
    const totalInterestAmount = data.max_approval === null ? parseFloat(totalMonthlyRepayment) - parseFloat(data.loan_amount) :
      parseFloat(totalMonthlyRepayment) - parseFloat(data.max_approval);
    const totalAmountRepayable = parseFloat(totalMonthlyRepayment) + parseFloat(totalFees);
    if (data.final_decision === 'MANUAL') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status should be subjected to manual approval 
      checkUserLoanEligibility.controllers.loan.js`);
      const manualDecisionPayload = LoanPayload.processLoanDecisionUpdatePayload(data, totalAmountRepayable, totalInterestAmount, 'in review');
      const updatedLoanDetails = await processOneOrNoneData(loanQueries.updateUserManualOrApprovedDecisionLoanApplication, manualDecisionPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: latest loan details updated checkUserLoanEligibility.controllers.loan.js`);
      const offerLetterData = await generateOfferLetterPDF(user, updatedLoanDetails);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan offer letter generated checkUserLoanEligibility.controllers.loan.js`);
      await processNoneData(loanQueries.updateOfferLetter, [ loanApplicationDetails.loan_id, user.user_id, offerLetterData.Location.trim() ]);
      const returnData = await LoanPayload.loanApplicationApprovalDecisionResponse(data, totalAmountRepayable, totalInterestAmount, user, 
        updatedLoanDetails.status, 'MANUAL', offerLetterData.Location.trim());
        
      admins.map((admin) => {
        sendNotificationToAdmin(admin.admin_id, ' Manual Approval Required', adminNotification.loanApplicationApproval(), 
          [ `${user.first_name} ${user.last_name}` ], 'manual-approval');
      });
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: Notification sent to admin successfully checkUserLoanEligibility.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'success');
      userActivityTracking(req.user.user_id, 38, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_MANUAL_DECISION, enums.HTTP_OK, returnData);
    }
    if (data.final_decision === 'APPROVED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status passes and user is eligible for automatic loan approval 
      checkUserLoanEligibility.controllers.loan.js`);
      const approvedDecisionPayload = LoanPayload.processLoanDecisionUpdatePayload(data, totalAmountRepayable, totalInterestAmount, 'approved');
      const updatedLoanDetails = await processOneOrNoneData(loanQueries.updateUserManualOrApprovedDecisionLoanApplication, approvedDecisionPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: latest loan details updated checkUserLoanEligibility.controllers.loan.js`);
      const offerLetterData = await generateOfferLetterPDF(user, updatedLoanDetails);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan offer letter generated checkUserLoanEligibility.controllers.loan.js`);
      await processNoneData(loanQueries.updateOfferLetter, [ loanApplicationDetails.loan_id, user.user_id, offerLetterData.Location.trim() ]);
      const returnData = await LoanPayload.loanApplicationApprovalDecisionResponse(data, totalAmountRepayable, totalInterestAmount, user, 
        updatedLoanDetails.status, 'APPROVED', offerLetterData.Location.trim());
      userActivityTracking(req.user.user_id, 37, 'success');
      userActivityTracking(req.user.user_id, 39, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_APPROVED_DECISION, enums.HTTP_OK, returnData);
    }
  } catch (error) {
    userActivityTracking(req.user.user_id, 37, 'fail');
    error.label = enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER;
    logger.error(`checking user loan application eligibility failed::${enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * user renegotiates requesting loan amount and or tenor
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of cancelled loan
 * @memberof LoanController
 */
export const processLoanRenegotiation = async(req, res, next) => {
  try {
    const { user, existingLoanApplication, body } = req;
    const result = await loanApplicationRenegotiation(body, user, existingLoanApplication);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan renegotiation processing result returned processLoanRenegotiation.controllers.loan.js`);
    if (result.status !== 200) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan renegotiation processing does not return success response from underwriting service 
      processLoanRenegotiation.controllers.loan.js`);
      if (result.status >= 500) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: returned response from underwriting is of a 500 plus status 
        processLoanRenegotiation.controllers.loan.js`);
        userActivityTracking(req.user.user_id, 74, 'fail');
        return ApiResponse.error(res, enums.UNDERWRITING_SERVICE_NOT_AVAILABLE, enums.HTTP_SERVICE_UNAVAILABLE, enums.PROCESS_LOAN_RENEGOTIATION_CONTROLLER);
      }
      userActivityTracking(req.user.user_id, 74, 'fail');
      return ApiResponse.error(res, result.response.data.message, result.response.status, enums.PROCESS_LOAN_RENEGOTIATION_CONTROLLER);
    }
    const { data } = result;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan renegotiation processing returns success response from underwriting service
    processLoanRenegotiation.controllers.loan.js`);
    const totalFees = (parseFloat(data.fees.processing_fee) + parseFloat(data.fees.insurance_fee) + parseFloat(data.fees.advisory_fee));
    const totalMonthlyRepayment = (parseFloat(data.monthly_repayment) * Number(body.new_loan_duration_in_month));
    const totalInterestAmount = parseFloat(totalMonthlyRepayment) - parseFloat(body.new_loan_amount);
    const totalAmountRepayable = parseFloat(totalMonthlyRepayment) + parseFloat(totalFees);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: total interest amount and total amount repayable calculated 
    processLoanRenegotiation.controllers.loan.js`);
    const renegotiationPayload = await LoanPayload.loanRenegotiationPayload(user, body, existingLoanApplication, data);
    const updateRenegotiationPayload = await LoanPayload.loanApplicationRenegotiationPayload(data, totalAmountRepayable, totalInterestAmount, body, existingLoanApplication);
    const [ , updatedLoanDetails ] = await Promise.all([
      processOneOrNoneData(loanQueries.createRenegotiationDetails, renegotiationPayload),
      processOneOrNoneData(loanQueries.updateLoanApplicationWithRenegotiation, updateRenegotiationPayload)
    ]);
    const offerLetterData = await generateOfferLetterPDF(user, updatedLoanDetails);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan offer letter generated processLoanRenegotiation.controllers.loan.js`);
    await processNoneData(loanQueries.updateOfferLetter, [ existingLoanApplication.loan_id, user.user_id, offerLetterData.Location.trim() ]);
    const returningData = await LoanPayload.loanApplicationRenegotiationResponse(data, totalAmountRepayable, totalInterestAmount, user, 
      updatedLoanDetails, offerLetterData.Location.trim(), body);
    userActivityTracking(user.user_id, 74, 'success');
    return ApiResponse.success(res, enums.LOAN_RENEGOTIATION_SUCCESSFUL_SUCCESSFULLY, enums.HTTP_OK, returningData);
  } catch (error) {
    userActivityTracking(req.user.user_id, 74, 'fail');
    error.label = enums.PROCESS_LOAN_RENEGOTIATION_CONTROLLER;
    logger.error(`processing loan renegotiation failed::${enums.PROCESS_LOAN_RENEGOTIATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * cancel loan application process
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of cancelled loan
 * @memberof LoanController
 */
export const cancelLoanApplication = async(req, res, next) => {
  try {
    const { user, params: { loan_id } } = req;
    const cancelLoanProcess = await processOneOrNoneData(loanQueries.cancelUserLoanApplication, [ loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application process cancelled successfully the db cancelLoanApplication.controllers.loan.js`);
    userActivityTracking(req.user.user_id, 43, 'success');
    return ApiResponse.success(res, enums.LOAN_APPLICATION_CANCELLING_SUCCESSFUL, enums.HTTP_OK, cancelLoanProcess);
  } catch (error) {
    userActivityTracking(req.user.user_id, 43, 'fail');
    error.label = enums.CANCEL_LOAN_APPLICATION_CONTROLLER;
    logger.error(`cancelling loan application process failed::${enums.CANCEL_LOAN_APPLICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update activated loan application details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of newly activated ongoing loan
 * @memberof LoanController
 */
export const initiateLoanDisbursement = async(req, res, next) => {
  try {
    const { user, params: { loan_id }, userTransferRecipient, existingLoanApplication } = req;
    const reference = uuidv4();
    await processAnyData(loanQueries.initializeBankTransferPayment, [ user.user_id, existingLoanApplication.amount_requested, 'paystack', reference, 
      'personal_loan_disbursement', 'requested personal loan facility disbursement', loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan payment initialized in the DB initiateLoanDisbursement.controllers.loan.js`);
    const result = await initiateTransfer(userTransferRecipient, existingLoanApplication, reference);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: transfer initiate via paystack returns response initiateLoanDisbursement.controllers.loan.js`);
    if (result.status === true && result.message === 'Transfer has been queued') {
      const updatedLoanDetails = await processOneOrNoneData(loanQueries.updateProcessingLoanDetails, [ loan_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan details status set to processing in the DB initiateLoanDisbursement.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 44, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_DISBURSEMENT_INITIATION_SUCCESSFUL, enums.HTTP_OK, { ...updatedLoanDetails , reference });
    }
    if (result.response.status === 400 && result.response.data.message === 'Your balance is not enough to fulfil this request') {
      const data = {
        email: config.SEEDFI_ADMIN_EMAIL_ADDRESS,
        currentBalance: 'Kindly login to confirm'
      };
      await AdminMailService('Insufficient Paystack Balance', 'insufficientBalance', { ...data });
    }
    if (result.response.data.message !== 'Your balance is not enough to fulfil this request') {
      userActivityTracking(user.user_id, 44, 'fail');
      return ApiResponse.error(res, result.response.data.message, enums.HTTP_BAD_REQUEST, enums.INITIATE_LOAN_DISBURSEMENT_CONTROLLER);
    }
    userActivityTracking(req.user.user_id, 44, 'fail');
    return ApiResponse.error(res, enums.USER_PAYSTACK_LOAN_DISBURSEMENT_ISSUES, enums.HTTP_SERVICE_UNAVAILABLE, enums.INITIATE_LOAN_DISBURSEMENT_CONTROLLER);
  } catch (error) {
    userActivityTracking(req.user.user_id, 44, 'fail');
    error.label = enums.INITIATE_LOAN_DISBURSEMENT_CONTROLLER;
    logger.error(`updating activated loan application details failed::${enums.INITIATE_LOAN_DISBURSEMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch personal loan details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a personal loan
 * @memberof LoanController
 */
export const fetchPersonalLoanDetails = async(req, res, next) => {
  try {
    const { user, existingLoanApplication,  params: { loan_id } } = req;
    const [ nextRepaymentDetails ] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [ loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user next loan repayment details fetched fetchPersonalLoanDetails.controllers.loan.js`);
    const loanRepaymentDetails = await processAnyData(loanQueries.fetchLoanRepaymentSchedule, [ loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan repayment details fetched fetchPersonalLoanDetails.controllers.loan.js`);
    const data = {
      nextLoanRepaymentDetails: nextRepaymentDetails,
      loanDetails: existingLoanApplication,
      loanRepaymentDetails
    };
    return ApiResponse.success(res, enums.USER_LOAN_DETAILS_FETCHED_SUCCESSFUL('personal'), enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_PERSONAL_LOAN_DETAILS_CONTROLLER;
    logger.error(`fetching details of a personal loan failed::${enums.FETCH_PERSONAL_LOAN_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch personal loan payment details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a personal loan payment details 
 * @memberof LoanController
 */
export const fetchPersonalLoanPaymentDetails = async(req, res, next) => {
  try {
    const { user, existingLoanPayment } = req;
    const loanDetails = await processOneOrNoneData(loanQueries.fetchUserLoanDetailsByLoanId, [ existingLoanPayment.loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan details fetched fetchPersonalLoanPaymentDetails.controllers.loan.js`);
    const loanRepaymentDetails = await processAnyData(loanQueries.fetchLoanRepaymentSchedule, [ existingLoanPayment.loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan repayment details fetched fetchPersonalLoanPaymentDetails.controllers.loan.js`);
    const data = {
      loanPaymentDetails: existingLoanPayment,
      loanDetails,
      loanRepaymentDetails
    };
    return ApiResponse.success(res, enums.USER_LOAN_PAYMENT_DETAILS_FETCHED_SUCCESSFUL('personal'), enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_PERSONAL_LOAN_PAYMENT_DETAILS_CONTROLLER;
    logger.error(`fetching details of a personal loan payment failed::${enums.FETCH_PERSONAL_LOAN_PAYMENT_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch cluster loan payment details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a personal loan payment details 
 * @memberof LoanController
 */
export const fetchClusterLoanPaymentDetails = async(req, res, next) => {
  try {
    const { user, existingLoanPayment } = req;
    const clusterLoanDetails = await processOneOrNoneData(clusterQueries.fetchClusterMemberLoanDetailsByLoanId, [ existingLoanPayment.member_loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user cluster loan details fetched fetchClusterLoanPaymentDetails.controllers.loan.js`);
    const clusterLoanRepaymentDetails = await processAnyData(clusterQueries.fetchClusterLoanRepaymentSchedule, [ existingLoanPayment.member_loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan repayment details fetched fetchClusterLoanPaymentDetails.controllers.loan.js`);
    const data = {
      clusterLoanPaymentDetails: existingLoanPayment,
      clusterLoanDetails,
      clusterLoanRepaymentDetails
    };
    return ApiResponse.success(res, enums.USER_LOAN_PAYMENT_DETAILS_FETCHED_SUCCESSFUL('cluster'), enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_CLUSTER_LOAN_PAYMENT_DETAILS_CONTROLLER;
    logger.error(`fetching details of a cluster loan payment failed::${enums.FETCH_CLUSTER_LOAN_PAYMENT_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch user current loans
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a personal loan
 * @memberof LoanController
 */
export const fetchUserCurrentLoans = async(req, res, next) => {
  try {
    const { user } = req;
    const currentPersonalLoans = await processAnyData(loanQueries.fetchUserCurrentPersonalLoans, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user current personal loan facilities fetched fetchUserCurrentLoans.controllers.loan.js`);
    const currentClusterLoans = await processAnyData(loanQueries.fetchUserCurrentClusterLoans, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user current cluster loan facilities fetched fetchUserCurrentLoans.controllers.loan.js`);
    const data = {
      currentPersonalLoans,
      currentClusterLoans
    };
    return ApiResponse.success(res, enums.USER_CURRENT_LOANS_FETCHED_SUCCESSFUL, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_USER_CURRENT_LOANS_CONTROLLER;
    logger.error(`fetching current loan facilities failed::${enums.FETCH_USER_CURRENT_LOANS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch user loan payment transactions
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of either cluster or personal loan payments
 * @memberof LoanController
 */
export const fetchUserLoanPaymentTransactions = async(req, res, next) => {
  try {
    const { user, query: { type } } = req;
    if (type === 'personal') {
      const personalLoanPayments = await processAnyData(loanQueries.fetchUserPersonalLoanPayments, [ user.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user personal loan payments fetched fetchUserLoanPaymentTransactions.controllers.loan.js`);
      return ApiResponse.success(res, enums.USER_LOAN_PAYMENTS_FETCHED_SUCCESSFUL('personal'), enums.HTTP_OK, personalLoanPayments);
    }
    const clusterLoanPayments = await processAnyData(loanQueries.fetchUserClusterLoanPayments, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user cluster loan payments fetched fetchUserLoanPaymentTransactions.controllers.loan.js`);
    return ApiResponse.success(res, enums.USER_LOAN_PAYMENTS_FETCHED_SUCCESSFUL('cluster'), enums.HTTP_OK, clusterLoanPayments);
  } catch (error) {
    error.label = enums.FETCH_USER_LOAN_PAYMENT_TRANSACTIONS_CONTROLLER;
    logger.error(`fetching loan payments failed::${enums.FETCH_USER_LOAN_PAYMENT_TRANSACTIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * initiate manual loan repayment
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of an initiate paystack payment
 * @memberof LoanController
 */
export const initiateManualLoanRepayment = async(req, res, next) => {
  try {
    const { user, params: { loan_id }, existingLoanApplication, query: { payment_type, payment_channel } } = req;
    if (existingLoanApplication.status === 'ongoing' || existingLoanApplication.status === 'over due') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan has a status of ${existingLoanApplication.status} so repayment is possible 
      initiateManualLoanRepayment.controllers.loan.js`);
      const reference = uuidv4();
      const [ nextRepaymentDetails ] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [ loan_id, user.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan next repayment details fetched initiateManualLoanRepayment.controllers.loan.js`);
      const paymentAmount = payment_type === 'full' ? parseFloat(existingLoanApplication.total_outstanding_amount) : parseFloat(nextRepaymentDetails.total_payment_amount);
      const paystackAmountFormatting = parseFloat(paymentAmount) * 100; // Paystack requires amount to be in kobo for naira payment
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment amount properly formatted initiateManualLoanRepayment.controllers.loan.js`);
      await processAnyData(loanQueries.initializeBankTransferPayment, [ user.user_id, parseFloat(paymentAmount), 'paystack', reference, `${payment_type}_loan_repayment`, 
        `user repays out of or all of existing personal loan facility via ${payment_channel}`, loan_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment reference and amount saved in the DB initiateManualLoanRepayment.controllers.loan.js`);
      const result = payment_channel === 'card' ? await initializeCardPayment(user, paystackAmountFormatting, reference) : 
        await initializeBankTransferPayment(user, paystackAmountFormatting, reference);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment initialize via paystack returns response initiateManualLoanRepayment.controllers.loan.js`);
      if (result.status === true && result.message.trim().toLowerCase() === 'authorization url created') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack initialized initiateManualLoanRepayment.controllers.loan.js`);
        userActivityTracking(req.user.user_id, 71, 'success');
        return ApiResponse.success(res, result.message, enums.HTTP_OK, result.data);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack failed to be initialized initiateManualLoanRepayment.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 71, 'fail');
      return ApiResponse.error(res, result.message, enums.HTTP_SERVICE_UNAVAILABLE, enums.INITIATE_MANUAL_LOAN_REPAYMENT_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan has a status of ${existingLoanApplication.status} and repayment is not possible 
    initiateManualLoanRepayment.controllers.loan.js`);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_STATUS_NOT_FOR_REPAYMENT(existingLoanApplication.status), 
      enums.HTTP_BAD_REQUEST, enums.INITIATE_MANUAL_LOAN_REPAYMENT_CONTROLLER);
  } catch (error) {
    userActivityTracking(req.user.user_id, 71, 'fail');
    error.label = enums.INITIATE_MANUAL_LOAN_REPAYMENT_CONTROLLER;
    logger.error(`initiating loan repayment failed::${enums.INITIATE_MANUAL_LOAN_REPAYMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * initiate manual loan repayment via existing card or bank account
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of an initiate paystack payment
 * @memberof LoanController
 */
export const initiateManualCardOrBankLoanRepayment = async(req, res, next) => {
  const { user, params: { loan_id }, existingLoanApplication, query: { payment_type, payment_channel }, userDebitCard, accountDetails } = req;
  const activityType = payment_channel === 'card' ? 71: 73;
  try {
    if (existingLoanApplication.status === 'ongoing' || existingLoanApplication.status === 'over due') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan has a status of ${existingLoanApplication.status} so repayment is possible 
      initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
      const reference = uuidv4();
      const [ nextRepaymentDetails ] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [ loan_id, user.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan next repayment details fetched initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
      const paymentAmount = payment_type === 'full' ? parseFloat(existingLoanApplication.total_outstanding_amount) : parseFloat(nextRepaymentDetails.total_payment_amount);
      const paystackAmountFormatting = parseFloat(paymentAmount) * 100; // Paystack requires amount to be in kobo for naira payment
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment amount properly formatted initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
      await processAnyData(loanQueries.initializeBankTransferPayment, [ user.user_id, parseFloat(paymentAmount), 'paystack', reference, `${payment_type}_loan_repayment`, 
        `user repays part of or all of existing personal loan facility via ${payment_channel}`, loan_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment reference and amount saved in the DB 
      initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
      const result = payment_channel === 'card' ? await initializeDebitCarAuthChargeForLoanRepayment(user, paystackAmountFormatting, reference, userDebitCard) : 
        await initializeBankAccountChargeForLoanRepayment(user, paystackAmountFormatting, reference, accountDetails);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment initialize via paystack returns response 
      initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
      if (result.status === true && result.message.trim().toLowerCase() === 'charge attempted' && (result.data.status === 'success' || result.data.status === 'send_otp')) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack initialized initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
        userActivityTracking(req.user.user_id, activityType, 'success');
        return ApiResponse.success(res, result.message, enums.HTTP_OK, { 
          user_id: user.user_id, 
          amount: parseFloat(paymentAmount).toFixed(2), 
          payment_type, 
          payment_channel,
          reference: result.data.reference,
          status: result.data.status,
          display_text: result.data.display_text || ''
        });
      }
      if (result.response && result.response.status === 400) {
        userActivityTracking(req.user.user_id, activityType, 'fail');
        return ApiResponse.error(res, result.response.data.message, enums.HTTP_BAD_REQUEST, enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack failed to be initialized 
      initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
      userActivityTracking(req.user.user_id, activityType, 'fail');
      return ApiResponse.error(res, result.message, enums.HTTP_SERVICE_UNAVAILABLE, enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan has a status of ${existingLoanApplication.status} and repayment is not possible 
    initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
    userActivityTracking(req.user.user_id, activityType, 'fail');
    return ApiResponse.error(res, enums.LOAN_APPLICATION_STATUS_NOT_FOR_REPAYMENT(existingLoanApplication.status), 
      enums.HTTP_BAD_REQUEST, enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER);
  } catch (error) {
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER;
    logger.error(`initiating loan repayment manually using saved card or bank account failed::${enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * submit user payment otp
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of the successful payment
 * @memberof LoanController
 */
export const submitPaymentOtp = async(req, res, next) => {
  try {
    const { user, params: { reference_id }, body } = req;
    const result = await submitPaymentOtpWithReference(body, reference_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: otp submitted to paystack submitPaymentOtp.controllers.loan.js`);
    if (result.status === true && result.message.trim().toLowerCase() === 'charge attempted' && result.data.status === 'send_otp') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: otp submitted again to paystack submitPaymentOtp.controllers.loan.js`);
      return submitPaymentOtp(req, res, next);
    }
    if (result.status === true && result.message.trim().toLowerCase() === 'charge attempted' && result.data.status === 'success') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: otp verified, payment completed submitPaymentOtp.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 77, 'success');
      return ApiResponse.success(res, enums.PAYMENT_OTP_ACCEPTED, enums.HTTP_OK, { reference: reference_id });
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: an error occurred submitPaymentOtp.controllers.loan.js`);
    userActivityTracking(req.user.user_id, 77, 'fail');
    if (result.response && result.response.status === 400) {
      return ApiResponse.error(res, enums.PAYMENT_OTP_REJECTED, enums.HTTP_BAD_REQUEST, enums.SUBMIT_PAYMENT_OTP_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack failed to be initialized 
    initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
    userActivityTracking(req.user.user_id, 77, 'fail');
    return ApiResponse.error(res, result.message, enums.HTTP_SERVICE_UNAVAILABLE, enums.SUBMIT_PAYMENT_OTP_CONTROLLER);
  } catch (error) {
    userActivityTracking(req.user.user_id, 77, 'fail');
    error.label = enums.SUBMIT_PAYMENT_OTP_CONTROLLER;
    logger.error(`submitting payment confirmation otp failed::${enums.SUBMIT_PAYMENT_OTP_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch system loan rescheduling durations in days
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a personal loan
 * @memberof LoanController
 */
export const individualLoanReschedulingDurations = async(req, res, next) => {
  try {
    const { user } = req;
    const data = await processAnyData(loanQueries.fetchIndividualLoanReschedulingDurations, []);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: individual loan rescheduling extension days fetched 
    individualLoanReschedulingDurations.controllers.loan.js`);
    return ApiResponse.success(res, enums.LOAN_RESCHEDULING_EXTENSION_DURATIONS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.INDIVIDUAL_LOAN_RESCHEDULING_DURATIONS_CONTROLLER;
    logger.error(`fetching extension days for loan rescheduling failed::${enums.INDIVIDUAL_LOAN_RESCHEDULING_DURATIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * process the summary of rescheduled loan and return
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a personal loan
 * @memberof LoanController
 */
export const loanReschedulingSummary = async(req, res, next) => {
  try {
    const { user, existingLoanApplication, loanRescheduleExtensionDetails } = req;
    const allowableRescheduleCount = await processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'allowable_personal_loan_rescheduling_count' ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan rescheduling allowable count fetched loanReschedulingSummary.controllers.loan.js`);
    if (Number(existingLoanApplication.reschedule_count >= Number(allowableRescheduleCount.value))) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's rescheduling count equals or exceeds system allowable rescheduling count 
      loanReschedulingSummary.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 94, 'fail');
      return ApiResponse.error(res, enums.LOAN_RESCHEDULING_NOT_ALLOWED(Number(existingLoanApplication.reschedule_count)), enums.HTTP_FORBIDDEN, 
        enums.LOAN_RESCHEDULING_SUMMARY_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's rescheduling count is less than system allowable rescheduling count 
      loanReschedulingSummary.controllers.loan.js`);
    const [ nextRepayment ] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [ existingLoanApplication.loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's next loan repayment details fetched loanReschedulingSummary.controllers.loan.js`);
    const returnData = await LoanPayload.loanReschedulingRequestSummaryResponse(existingLoanApplication, user, loanRescheduleExtensionDetails, nextRepayment);
    const rescheduleRequest = await processOneOrNoneData(loanQueries.createRescheduleRequest, 
      [ existingLoanApplication.loan_id, user.user_id, loanRescheduleExtensionDetails.extension_in_days ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan reschedule request saved in the DB loanReschedulingSummary.controllers.loan.js`);
    userActivityTracking(req.user.user_id, 94, 'success');
    return ApiResponse.success(res, enums.LOAN_RESCHEDULING_SUMMARY_RETURNED_SUCCESSFULLY, enums.HTTP_OK, { ...returnData, reschedule_id: rescheduleRequest.reschedule_id });
  } catch (error) {
    userActivityTracking(req.user.user_id, 94, 'fail');
    error.label = enums.LOAN_RESCHEDULING_SUMMARY_CONTROLLER;
    logger.error(`fetching loan rescheduling summary failed::${enums.LOAN_RESCHEDULING_SUMMARY_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * process the loan rescheduling request
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a personal loan
 * @memberof LoanController
 */
export const processLoanRescheduling = async(req, res, next) => {
  try {
    const { user, existingLoanApplication, loanRescheduleRequest } = req;
    const allowableRescheduleCount = await processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'allowable_personal_loan_rescheduling_count' ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan rescheduling allowable count fetched processLoanRescheduling.controllers.loan.js`);
    if (Number(existingLoanApplication.reschedule_count >= Number(allowableRescheduleCount.value))) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's rescheduling count equals or exceeds system allowable rescheduling count 
      processLoanRescheduling.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 75, 'fail');
      return ApiResponse.error(res, enums.LOAN_RESCHEDULING_NOT_ALLOWED(Number(existingLoanApplication.reschedule_count)), enums.HTTP_FORBIDDEN, 
        enums.PROCESS_LOAN_RESCHEDULING_CONTROLLER);
    }
    const userUnpaidRepayments = await processAnyData(loanQueries.fetchUserUnpaidRepayments, [ existingLoanApplication.loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's unpaid repayments fetched processLoanRescheduling.controllers.loan.js`);
    const [ nextRepayment ] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [ existingLoanApplication.loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's next loan repayment details fetched processLoanRescheduling.controllers.loan.js`);
    const totalExtensionDays = userUnpaidRepayments.length * Number(loanRescheduleRequest.extension_in_days);
    const newLoanDuration = `${existingLoanApplication.loan_tenor_in_months} month(s), ${totalExtensionDays} day(s)`;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: updated total loan tenor fetched processLoanRescheduling.controllers.loan.js`);
    await Promise.all([
      userUnpaidRepayments.map((repayment) => {
        processOneOrNoneData(loanQueries.updateNewRepaymentDate, 
          [ repayment.id, dayjs(repayment.proposed_payment_date).add(Number(loanRescheduleRequest.extension_in_days), 'days') ]);
        return repayment;
      }),
      processOneOrNoneData(loanQueries.updateLoanWithRescheduleDetails, [ existingLoanApplication.loan_id, Number(loanRescheduleRequest.extension_in_days), 
        parseFloat((existingLoanApplication.reschedule_count || 0) + 1), newLoanDuration, totalExtensionDays ]),
      processOneOrNoneData(loanQueries.updateRescheduleRequestAccepted, [ loanRescheduleRequest.reschedule_id ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan rescheduling details updated successfully processLoanRescheduling.controllers.loan.js`);
    const data = {
      loan_id: existingLoanApplication.loan_id, 
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      loan_reason: existingLoanApplication.loan_reason,
      amount_requested: existingLoanApplication.amount_requested,
      monthly_repayment: existingLoanApplication.monthly_repayment,
      initial_loan_duration: existingLoanApplication.loan_tenor_in_months,
      current_loan_duration: newLoanDuration,
      next_repayment_date: dayjs(nextRepayment.proposed_payment_date).add(Number(loanRescheduleRequest.extension_in_days), 'days').format('MMM DD, YYYY'),
      status: existingLoanApplication.status,
      reschedule_extension_days: Number(loanRescheduleRequest.extension_in_days),
      total_loan_extension_days: parseFloat(totalExtensionDays),
      is_reschedule: true
    };
    await MailService('Loan Facility Rescheduled', 'loanRescheduled',  data);
    userActivityTracking(req.user.user_id, 75, 'success');
    return ApiResponse.success(res, enums.LOAN_RESCHEDULING_PROCESSED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    userActivityTracking(req.user.user_id, 75, 'fail');
    error.label = enums.PROCESS_LOAN_RESCHEDULING_CONTROLLER;
    logger.error(`processing loan rescheduling loan failed::${enums.PROCESS_LOAN_RESCHEDULING_CONTROLLER}`, error.message);
    return next(error);
  }
};
