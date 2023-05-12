import loanQueries from '../queries/queries.loan';
import userQueries from '../queries/queries.user';
import loanPayload from '../../lib/payloads/lib.payload.loans';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import enums from '../../../users/lib/enums';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import MailService from '../services/services.email';
import { sendPushNotification } from '../services/services.firebase';
import * as PushNotifications from '../../../admins/lib/templates/pushNotification';
import { adminActivityTracking } from '../../lib/monitor';
import { loanOrrScoreBreakdown } from '../services/services.seedfiUnderwriting';
import * as descriptions from '../../lib/monitor/lib.monitor.description';

/**
 * approve loan applications manually by admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminUserController
 */
export const approveLoanApplication = async(req, res, next) => {
  try {
    const { admin, body: { decision }, params: { loan_id }, loanApplication } = req;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched approveLoanApplication.admin.controllers.loan.js`);
    const updatedLoanApplication = await processOneOrNoneData(loanQueries.updateLoanStatus, [ loan_id, 'approved', null ]);
    await processOneOrNoneData(loanQueries.updateAdminLoanApprovalTrail, [ loan_id, loanApplication.user_id, decision, admin.admin_id  ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan status updated and admin approval recorded approveLoanApplication.admin.controllers.loan.js`);
    await MailService('Loan application approved', 'approvedLoan', { ...loanApplicant, requested_amount: loanApplication.amount_requested });
    await sendPushNotification(loanApplicant.user_id, PushNotifications.userLoanApplicationApproval(), loanApplicant.fcm_token);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: notification sent to loan applicant approveLoanApplication.admin.controllers.loan.js`);
    adminActivityTracking(req.admin.admin_id, 21, 'success', descriptions.manually_loan_approval(admin.first_name));
    return  ApiResponse.success(res, enums.LOAN_APPLICATION_DECISION('approved'), enums.HTTP_OK, updatedLoanApplication);
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 21, 'fail', descriptions.manually_loan_approval(req.admin.first_name));
    error.label = enums.APPROVE_LOAN_APPLICATION_CONTROLLER;
    logger.error(`approving a loan application manually failed:::${enums.APPROVE_LOAN_APPLICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * decline loan applications manually by admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminUserController
 */
export const declineLoanApplication = async(req, res, next) => {
  try {
    const { admin, body: { decision, rejection_reason }, params: { loan_id }, loanApplication } = req;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched declineLoanApplication.admin.controllers.loan.js`);
    const updatedLoanApplication = await processOneOrNoneData(loanQueries.updateLoanStatus, [ loan_id, 'declined', rejection_reason.trim().toLowerCase() ]);
    await processOneOrNoneData(loanQueries.updateAdminLoanApprovalTrail, [ loan_id, loanApplication.user_id, decision, admin.admin_id  ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan status updated and admin rejection recorded declineLoanApplication.admin.controllers.loan.js`);
    await MailService('Loan application declined', 'declinedLoan', { ...loanApplicant, requested_amount: loanApplication.amount_requested });
    await sendPushNotification(loanApplicant.user_id, PushNotifications.userLoanApplicationDisapproval(), loanApplicant.fcm_token);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: notification sent to loan applicant declineLoanApplication.admin.controllers.loan.js`);
    adminActivityTracking(req.admin.admin_id, 22, 'success', descriptions.manually_loan_approval(req.admin.first_name));
    return  ApiResponse.success(res, enums.LOAN_APPLICATION_DECISION('declined'), enums.HTTP_OK, updatedLoanApplication);
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 22, 'fail', descriptions.manually_loan_approval(req.admin.first_name));
    error.label = enums.DECLINE_LOAN_APPLICATION_CONTROLLER;
    logger.error(`declining a loan application manually failed:::${enums.DECLINE_LOAN_APPLICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * details of a single loan Application
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminUserController
 */
export const loanApplicationDetails = async(req, res, next) => {
  try {
    const { admin, params: { loan_id }, loanApplication } = req;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched loanApplicationDetails.admin.controllers.loan.js`);
    const result = loanApplication.percentage_orr_score === null ? {  } : await loanOrrScoreBreakdown(loanApplication.user_id, loan_id);
    const orrScoreBreakdown = (result.status === 200) && (result.data.customer_id === loanApplication.user_id) ? result.data : {};
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan application ORR score fetched loanApplicationDetails.admin.controllers.loan.js`);
    const loanRepaymentBreakdown = (loanApplication.status === 'completed' || loanApplication.status === 'ongoing' || loanApplication.status === 'over due') ?
      await processAnyData(loanQueries.fetchLoanRepaymentBreakdown, [ loan_id ]) : [  ];
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan repayment breakdown fetched loanApplicationDetails.admin.controllers.loan.js`);
    const data = {
      loan_id,
      loan_applicant: { 
        name: `${loanApplicant.first_name} ${loanApplicant.last_name}`,
        status: loanApplicant.status,
        tier: loanApplicant.tier,
        image_url: loanApplicant.image_url 
      },
      loan_details: loanApplication,
      orr_break_down: orrScoreBreakdown,
      loan_repayments: loanRepaymentBreakdown || []
    };
    return  ApiResponse.success(res, enums.LOAN_APPLICATION_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.LOAN_APPLICATION_DETAILS_CONTROLLER;
    logger.error(`fetching loan application details failed:::${enums.LOAN_APPLICATION_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches loans on the platform
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminUserController
 */

export const fetchLoans = async(req, res, next) => {
  try {
    const { query, admin } = req;
    if (query.export) {
      const payload = loanPayload.fetchAllLoans(query);
      const loans = await processAnyData(loanQueries.fetchAllLoans, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched loans from the DB
       fetchLoans.admin.controllers.loan.js`);
      const data = {
        total_count: loans.length,
        loans
      };
      return ApiResponse.success(res, enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
      
    }
    const payload = loanPayload.fetchLoans(query);
    const [ loans, [ loansCount ] ] = await Promise.all([
      processAnyData(loanQueries.fetchLoans, payload),
      processAnyData(loanQueries.getLoansCount, payload)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched loans from the DB 
    fetchLoans.admin.controllers.roles.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(loansCount.total_count),
      total_pages: Helpers.calculatePages(Number(loansCount.total_count), Number(req.query.per_page) || 10),
      loans 
    };
    return ApiResponse.success(res, enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_LOAN_APPLICATIONS_CONTROLLER;
    logger.error(`fetching loan applications failed:::${enums.FETCH_LOAN_APPLICATIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches reapaid loans on the platform
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminUserController
 */

export const fetchRepaidLoans = async(req, res, next) => {
  try {
    const { query, admin } = req;
    if (query.export) {
      const payload = loanPayload.fetchAllRepaidLoans(query);
      const repaidLoans = await processAnyData(loanQueries.fetchAllRepaidLoans, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched repaid loans from the DB
      fetchRepaidLoans.admin.controllers.loan.js`);
      const data = {
        total_count: repaidLoans.length,
        repaidLoans
      };
      return ApiResponse.success(res, enums.REPAID_LOANS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
    }
    const payload = loanPayload.fetchRepaidLoans(query);
    const [ repaidLoans, [ repaidLoansCount ] ] = await Promise.all([
      processAnyData(loanQueries.fetchRepaidLoans, payload),
      processAnyData(loanQueries.getRepaidLoansCount, payload)
    ]);
    
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched repaid loans from the DB 
    fetchRepaidLoans.admin.controllers.roles.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(repaidLoansCount.total_count),
      total_pages: Helpers.calculatePages(Number(repaidLoansCount.total_count), Number(req.query.per_page) || 10),
      repaidLoans 
    };
    return ApiResponse.success(res, enums.REPAID_LOANS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);

  } catch (error) {
    error.label = enums.REPAID_LOANS_CONTROLLER;
    logger.error(`fetching repaid loans failed:::${enums.REPAID_LOANS_CONTROLLER}`, error.message);
    return next(error);
  }
};

