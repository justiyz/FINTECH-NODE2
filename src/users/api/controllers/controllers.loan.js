import { v4 as uuidv4 } from 'uuid';
import loanQueries from '../queries/queries.loan';
import { processAnyData, processOneOrNoneData, processNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import config from '../../config';
import AdminMailService from '../../../admins/api/services/services.email';
import LoanPayload from '../../lib/payloads/lib.payload.loan';
import { personalLoanApplicationEligibilityCheck } from '../services/service.seedfiUnderwriting';
import { userActivityTracking } from '../../lib/monitor';
import { initiateTransfer, initializeCardPayment, initializeBankAccountChargeForLoanRepayment, 
  initializeDebitCarAuthChargeForLoanRepayment, submitPaymentOtpWithReference 
} from '../services/service.paystack';
import { generateOfferLetterPDF } from '../../lib/utils/lib.util.helpers';

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
    const { user, body } = req;
    const [ userDefaultAccountDetails ] = await processAnyData(loanQueries.fetchUserDefaultBankAccount, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user default bank account details from the db checkUserLoanEligibility.controllers.loan.js`);
    if (!userDefaultAccountDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not set default account in the db checkUserLoanEligibility.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.NO_DEFAULT_BANK_ACCOUNT, enums.HTTP_FORBIDDEN, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }
    const [ userDefaultDebitCardDetails ] = await processAnyData(loanQueries.fetchUserDefaultDebitCard, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user default debit card details from the db checkUserLoanEligibility.controllers.loan.js`);
    if (!userDefaultDebitCardDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not set default debit card in the db checkUserLoanEligibility.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.NO_DEFAULT_DEBIT_CARD, enums.HTTP_FORBIDDEN, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }
    const userBvn = await processOneOrNoneData(loanQueries.fetchUserBvn, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user bvn from the db checkUserLoanEligibility.controllers.loan.js`);
    const loanApplicationDetails = await processOneOrNoneData(loanQueries.initiatePersonalLoanApplication, 
      [ user.user_id, parseFloat(body.amount), body.loan_reason, body.duration_in_months ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: initiated loan application in the db checkUserLoanEligibility.controllers.loan.js`);
    const payload = await LoanPayload.checkUserEligibilityPayload(user, body, userDefaultAccountDetails, loanApplicationDetails, userBvn);
    const result = await personalLoanApplicationEligibilityCheck(payload);
    if (result.status !== 200) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status check failed checkUserLoanEligibility.controllers.loan.js`);
      await processNoneData(loanQueries.deleteInitiatedLoanApplication, [ loanApplicationDetails.loan_id, user.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user just initiated loan application deleted checkUserLoanEligibility.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.UNDERWRITING_SERVICE_NOT_AVAILABLE, enums.HTTP_SERVICE_UNAVAILABLE, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
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
    const totalInterestAmount = parseFloat(totalMonthlyRepayment) - parseFloat(data.loan_amount);
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
    const currentClusterLoans = [ ]; // to later implement query when cluster loan gets implemented
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
    const clusterLoanPayments = [ ]; // to later implement query when cluster loan gets implemented
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
    const { user, params: { loan_id }, existingLoanApplication, query: { payment_type } } = req;
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
        'user repays out of or all of existing personal loan facility', loan_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment reference and amount saved in the DB initiateManualLoanRepayment.controllers.loan.js`);
      const result = await initializeCardPayment(user, paystackAmountFormatting, reference);
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
