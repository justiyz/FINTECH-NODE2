import loanQueries from '../queries/queries.loan';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import LoanPayload from '../../lib/payloads/lib.payload.loan';
import { personalLoanApplicationEligibilityCheck } from '../services/service.seedfiUnderwriting';
import { generateLoanRepaymentSchedule } from '../../lib/utils/lib.util.helpers';

/**
 * check if user is eligible for loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanController
 */
export const checkUserLoanEligibility = async(req, res, next) => {
  try {
    const { user, body } = req;
    const userDefaultAccountDetails = await processAnyData(loanQueries.fetchUserDefaultBankAccount, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user default bank account details from the db checkUserLoanEligibility.controllers.loan.js`);
    if (userDefaultAccountDetails.length < 1) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not set default account in the db checkUserLoanEligibility.controllers.loan.js`);
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
      return ApiResponse.error(res, enums.UNDERWRITING_SERVICE_NOT_AVAILABLE, enums.HTTP_SERVICE_UNAVAILABLE, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }
    const { data } = result;
    if (data.final_decision === 'DECLINED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status shows user is not eligible for loan checkUserLoanEligibility.controllers.loan.js`);
      const declinedDecisionPayload = LoanPayload.processDeclinedLoanDecisionUpdatePayload(data);
      await processOneOrNoneData(loanQueries.updateUserDeclinedDecisionLoanApplication, declinedDecisionPayload);
      return ApiResponse.success(res, enums.LOAN_APPLICATION_DECLINED_DECISION, enums.HTTP_OK, { user_id: user.user_id, loan_id: data.loan_application_id, decline_reason: 'User has bad credit bureaus records' }); // decline reason to be changed to what underwriting service returns
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
      const returnData = await LoanPayload.loanApplicationApprovalDecisionResponse(data, totalRepaymentAmount, totalInterestAmount, user, 'pending', 'MANUAL');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_MANUAL_DECISION, enums.HTTP_OK, returnData);
    }
    if (data.final_decision === 'APPROVED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status passes and user is eligible for automatic loan approval checkUserLoanEligibility.controllers.loan.js`);
      const approvedDecisionPayload = LoanPayload.processApprovedLoanDecisionUpdatePayload(data, totalRepaymentAmount, totalInterestAmount);
      await processOneOrNoneData(loanQueries.updateUserManualOrApprovedDecisionLoanApplication, approvedDecisionPayload);
      const returnData = await LoanPayload.loanApplicationApprovalDecisionResponse(data, totalRepaymentAmount, totalInterestAmount, user, 'approved', 'APPROVED');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_APPROVED_DECISION, enums.HTTP_OK, returnData);
    }
  } catch (error) {
    error.label = enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER;
    logger.error(`checking user loan application eligibility failed::${enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update activated loan application details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
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
    const [ updatedLoanDetails  ] = await Promise.all([
      processOneOrNoneData(loanQueries.updateActivatedLoanDetails, [ loan_id ]),
      processOneOrNoneData(loanQueries.updateUserLoanStatus, [ user.user_id ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user default bank account details from the db checkUserLoanEligibility.controllers.loan.js`);
    return ApiResponse.success(res, enums.LOAN_APPLICATION_DISBURSEMENT_SUCCESSFUL, enums.HTTP_OK, updatedLoanDetails);
  } catch (error) {
    error.label = enums.UPDATE_ACTIVATED_LOAN_APPLICATION_DETAILS_CONTROLLER;
    logger.error(`updating activated loan application details failed::${enums.UPDATE_ACTIVATED_LOAN_APPLICATION_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};
