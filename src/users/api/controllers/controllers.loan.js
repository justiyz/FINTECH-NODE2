import loanQueries from '../queries/queries.loan';
import { processAnyData, processOneOrNoneData, processNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import LoanPayload from '../../lib/payloads/lib.payload.loan';
import { personalLoanApplicationEligibilityCheck } from '../services/service.seedfiUnderwriting';
import { generateLoanRepaymentSchedule } from '../../lib/utils/lib.util.helpers';
import { userActivityTracking } from '../../lib/monitor';

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
    const userDefaultAccountDetails = await processAnyData(loanQueries.fetchUserDefaultBankAccount, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user default bank account details from the db checkUserLoanEligibility.controllers.loan.js`);
    if (userDefaultAccountDetails.length < 1) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not set default account in the db checkUserLoanEligibility.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.NO_DEFAULT_BANK_ACCOUNT, enums.HTTP_FORBIDDEN, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has set default account in the db checkUserLoanEligibility.controllers.loan.js`);
    const userBvn = await processOneOrNoneData(loanQueries.fetchUserBvn, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user bvn from the db checkUserLoanEligibility.controllers.loan.js`);
    const loanApplicationDetails = await processOneOrNoneData(loanQueries.initiatePersonalLoanApplication, [ user.user_id, parseFloat(body.amount), body.loan_reason, body.duration_in_months ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: initiated loan application in the db checkUserLoanEligibility.controllers.loan.js`);
    const payload = await LoanPayload.checkUserEligibility(user, body, userDefaultAccountDetails[0], loanApplicationDetails, userBvn);
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status shows user is not eligible for loan checkUserLoanEligibility.controllers.loan.js`);
      const declinedDecisionPayload = LoanPayload.processDeclinedLoanDecisionUpdatePayload(data);
      await processOneOrNoneData(loanQueries.updateUserDeclinedDecisionLoanApplication, declinedDecisionPayload);
      userActivityTracking(req.user.user_id, 37, 'fail');
      userActivityTracking(req.user.user_id, 40, 'success');
      const returnData = await LoanPayload.loanApplicationDeclinedDecisionResponse(user, data, 'declined', 'DECLINED');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_DECLINED_DECISION, enums.HTTP_OK, returnData);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status shows user is eligible for loan checkUserLoanEligibility.controllers.loan.js`);
    const totalFees = (parseFloat(data.fees.processing_fee) + parseFloat(data.fees.insurance_fee) + parseFloat(data.fees.advisory_fee));
    const totalMonthlyRepayment = (parseFloat(data.monthly_repayment) * Number(data.loan_duration_in_month));
    const totalInterestAmount = parseFloat(totalMonthlyRepayment) - parseFloat(data.loan_amount);
    const totalAmountRepayable = parseFloat(totalMonthlyRepayment) + parseFloat(totalFees);
    if (data.final_decision === 'MANUAL') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status should be subjected to manual approval checkUserLoanEligibility.controllers.loan.js`);
      const manualDecisionPayload = LoanPayload.processLoanDecisionUpdatePayload(data, totalAmountRepayable, totalInterestAmount, 'pending');
      await processOneOrNoneData(loanQueries.updateUserManualOrApprovedDecisionLoanApplication, manualDecisionPayload);
      const returnData = await LoanPayload.loanApplicationApprovalDecisionResponse(data, totalAmountRepayable, totalInterestAmount, user, 'pending', 'MANUAL');
      userActivityTracking(req.user.user_id, 37, 'success');
      userActivityTracking(req.user.user_id, 38, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_MANUAL_DECISION, enums.HTTP_OK, returnData);
    }
    if (data.final_decision === 'APPROVED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status passes and user is eligible for automatic loan approval checkUserLoanEligibility.controllers.loan.js`);
      const approvedDecisionPayload = LoanPayload.processLoanDecisionUpdatePayload(data, totalAmountRepayable, totalInterestAmount, 'approved');
      await processOneOrNoneData(loanQueries.updateUserManualOrApprovedDecisionLoanApplication, approvedDecisionPayload);
      const returnData = await LoanPayload.loanApplicationApprovalDecisionResponse(data, totalAmountRepayable, totalInterestAmount, user, 'approved', 'APPROVED');
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
export const updateActivatedLoanApplicationDetails = async(req, res, next) => {
  try {
    const { user, params: { loan_id }, existingLoanApplication } = req;
    const repaymentSchedule = await generateLoanRepaymentSchedule(existingLoanApplication, user);
    repaymentSchedule.forEach(async(schedule) => {
      await processOneOrNoneData(loanQueries.updateDisbursedLoanRepaymentSchedule, [
        schedule.loan_id, schedule.user_id, schedule.repayment_order, schedule.principal_payment, schedule.interest_payment,
        schedule.fees, schedule.total_payment_amount, schedule.pre_payment_outstanding_amount, 
        schedule.post_payment_outstanding_amount, schedule.proposed_payment_date
      ]);
      return schedule;
    });
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment schedule update successfully in the DB updateActivatedLoanApplicationDetails.controllers.loan.js`);
    const [ updatedLoanDetails  ] = await Promise.all([
      processOneOrNoneData(loanQueries.updateActivatedLoanDetails, [ loan_id ]),
      processOneOrNoneData(loanQueries.updateUserLoanStatus, [ user.user_id ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan details and user loan details updated in the DB updateActivatedLoanApplicationDetails.controllers.loan.js`);
    userActivityTracking(req.user.user_id, 42, 'success');
    return ApiResponse.success(res, enums.LOAN_APPLICATION_DISBURSEMENT_SUCCESSFUL, enums.HTTP_OK, updatedLoanDetails);
  } catch (error) {
    userActivityTracking(req.user.user_id, 42, 'fail');
    error.label = enums.UPDATE_ACTIVATED_LOAN_APPLICATION_DETAILS_CONTROLLER;
    logger.error(`updating activated loan application details failed::${enums.UPDATE_ACTIVATED_LOAN_APPLICATION_DETAILS_CONTROLLER}`, error.message);
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
    const { user, params: { loan_id } } = req;
    const loanDetails = await processOneOrNoneData(loanQueries.fetchUserLoanDetailsByLoanId, [ loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan details fetched fetchPersonalLoanDetails.controllers.loan.js`);
    const loanRepaymentDetails = await processAnyData(loanQueries.fetchLoanRepaymentSchedule, [ loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan repayment details fetched fetchPersonalLoanDetails.controllers.loan.js`);
    const data = {
      loanDetails,
      loanRepaymentDetails
    };
    return ApiResponse.success(res, enums.USER_LOAN_DETAILS_FETCHED_SUCCESSFUL('personal'), enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_PERSONAL_LOAN_DETAILS_CONTROLLER;
    logger.error(`fetching details of a personal loan failed::${enums.FETCH_PERSONAL_LOAN_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};
