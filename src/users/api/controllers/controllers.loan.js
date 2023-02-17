import loanQueries from '../queries/queries.loan';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import LoanPayload from '../../lib/payloads/lib.payload.loan';
import { personalLoanApplicationEligibilityCheck } from '../services/service.seedfiUnderwriting';

/**
 * check if user is eligible for loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkUserLoanEligibility = async(req, res, next) => {
  try {
    const { user, body } = req;
    const userDefaultAccountDetails = await processAnyData(loanQueries.fetchUserDefaultBankAccount, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: fetched user default bank account details from the db checkUserLoanEligibility.controllers.loan.js`);
    const userBvn = await processOneOrNoneData(loanQueries.fetchUserBvn, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: fetched user bvn from the db checkUserLoanEligibility.controllers.loan.js`);
    const loanApplicationDetails = await processOneOrNoneData(loanQueries.initiatePersonalLoanApplication, [ user.user_id, parseFloat(body.amount), body.loan_reason, body.duration_in_months ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: initiated loan application in the db checkUserLoanEligibility.controllers.loan.js`);
    const payload = await LoanPayload.checkUserEligibility(user, body, userDefaultAccountDetails[0], loanApplicationDetails, userBvn);
    const result = await personalLoanApplicationEligibilityCheck(payload);
    if (result.status !== 200) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status check failed checkUserLoanEligibility.controllers.loan.js`);
      return ApiResponse.error(res, result.response.data.message, result.response.status, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }
    const { data } = result;
    if (data.final_decision === 'DECLINED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status shows user is not eligible for loan checkUserLoanEligibility.controllers.loan.js`);
      const declinedDecisionPayload = LoanPayload.processDeclinedLoanDecisionUpdatePayload(data);
      await processOneOrNoneData(loanQueries.updateUserDeclinedDecisionLoanApplication, declinedDecisionPayload);
      return ApiResponse.success(res, enums.LOAN_APPLICATION_DECLINED_DECISION, enums.HTTP_OK, { loan_id: data.loan_application_id, decline_reason: 'User has bad credit bureaus records' }); // decline reason to be changed to what underwriting service returns
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status shows user is eligible for loan checkUserLoanEligibility.controllers.loan.js`);
    const totalFees = (parseFloat(data.fees.processing_fee) + parseFloat(data.fees.insurance_fee) + parseFloat(data.fees.advisory_fee));
    const totalMonthlyRepayment = (parseFloat(data.monthly_repayment) * Number(data.loan_duration_in_month));
    const totalRepaymentAmount = parseFloat(totalMonthlyRepayment) + parseFloat(totalFees);
    const totalInterestAmount = parseFloat(totalMonthlyRepayment) - parseFloat(data.loan_amount);
    if (data.final_decision === 'MANUAL') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status should be subjected to manual approval checkUserLoanEligibility.controllers.loan.js`);
      const manualDecisionPayload = LoanPayload.processManualLoanDecisionUpdatePayload(data, totalRepaymentAmount, totalInterestAmount);
      await processOneOrNoneData(loanQueries.updateUserManualOrApprovedDecisionLoanApplication, manualDecisionPayload);
      const returnData = await LoanPayload.loanApplicationManualDecisionResponse(data, totalRepaymentAmount, totalInterestAmount);
      return ApiResponse.success(res, enums.LOAN_APPLICATION_MANUAL_DECISION, enums.HTTP_OK, returnData);
    }
    if (data.final_decision === 'APPROVED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status passes and user is eligible for automatic loan approval checkUserLoanEligibility.controllers.loan.js`);
      const approvedDecisionPayload = LoanPayload.processApprovedLoanDecisionUpdatePayload(data, totalRepaymentAmount, totalInterestAmount);
      await processOneOrNoneData(loanQueries.updateUserManualOrApprovedDecisionLoanApplication, approvedDecisionPayload);
      const returnData = await LoanPayload.loanApplicationApprovedDecisionResponse(data, totalRepaymentAmount, totalInterestAmount);
      return ApiResponse.success(res, enums.LOAN_APPLICATION_APPROVED_DECISION, enums.HTTP_OK, returnData);
    }
  } catch (error) {
    error.label = enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER;
    logger.error(`checking user loan application eligibility failed::${enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER}`, error.message);
    return next(error);
  }
};
