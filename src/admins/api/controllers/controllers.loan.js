import loanQueries from '../queries/queries.loan';
import userQueries from '../queries/queries.user';
import clusterQueries from '../queries/queries.cluster';
import loanPayload from '../../lib/payloads/lib.payload.loans';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import enums from '../../../users/lib/enums';
import { processAnyData, processNoneData, processOneOrNoneData } from '../services/services.db';
import MailService from '../services/services.email';
import { sendPushNotification, sendUserPersonalNotification, sendClusterNotification, sendMulticastPushNotification } from '../services/services.firebase';
import * as PushNotifications from '../../../admins/lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates/personalNotification';
import { adminActivityTracking } from '../../lib/monitor';
import { loanOrrScoreBreakdown } from '../services/services.seedfiUnderwriting';
import * as descriptions from '../../lib/monitor/lib.monitor.description';
import { generateLoanRepaymentSchedule, generateOfferLetterPDF } from '../../../users/lib/utils/lib.util.helpers';
import { userActivityTracking } from '../../../users/lib/monitor';
import {
  FAILED_TO_CREATE_MANUAL_LOAN_RECORD,
  LOAN_APPLICATION_MANUAL_DECISION,
  MANUAL_LOAN_APPLICATION_MANUAL_BY_ADMIN
} from "../../../users/lib/enums/lib.enum.messages";
import moment from 'moment-timezone/moment-timezone-utils';
// import updateDisbursedLoanRepaymentSchedule from
/**
 * approve loan applications manually by admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */
export const approveLoanApplication = async(req, res, next) => {
  try {
    const { admin, body: { decision }, params: { loan_id }, loanApplication } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched approveLoanApplication.admin.controllers.loan.js`);
    const updatedLoanApplication = await processOneOrNoneData(loanQueries.updateLoanStatus, [ loan_id, 'approved', null ]);
    await processOneOrNoneData(loanQueries.updateAdminLoanApprovalTrail, [ loan_id, loanApplication.user_id, decision, admin.admin_id  ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan status updated and admin approval recorded approveLoanApplication.admin.controllers.loan.js`);
    await MailService('Loan application approved', 'approvedLoan', { ...loanApplicant, requested_amount: loanApplication.amount_requested });
    await sendPushNotification(loanApplicant.user_id, PushNotifications.userLoanApplicationApproval('individual'), loanApplicant.fcm_token);
    sendUserPersonalNotification(loanApplicant, 'Approved loan application',
      PersonalNotifications.approvedLoanApplicationNotification({ requested_amount: loanApplication.amount_requested }), 'approved-loan', { ...loanApplication });
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: notification sent to loan applicant approveLoanApplication.admin.controllers.loan.js`);
    await adminActivityTracking(req.admin.admin_id, 21, 'success', descriptions.manually_loan_approval(adminName, 'individual'));
    return  ApiResponse.success(res, enums.LOAN_APPLICATION_DECISION('approved'), enums.HTTP_OK, updatedLoanApplication);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 21, 'fail', descriptions.manually_loan_approval_failed(`${req.admin.first_name} ${req.admin.last_name}`, 'individual'));
    error.label = enums.APPROVE_LOAN_APPLICATION_CONTROLLER;
    logger.error(`approving a loan application manually failed:::${enums.APPROVE_LOAN_APPLICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * approve cluster member loan applications manually by admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */
export const approveClusterMemberLoanApplication = async(req, res, next) => {
  try {
    const { admin, params: { member_loan_id }, body: { decision }, loanApplication } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    const [ cluster ] = await processAnyData(clusterQueries.checkIfClusterExists, [ loanApplication.cluster_id ]);
    const clusterMembers = await processAnyData(clusterQueries.fetchActiveClusterMembers, [ cluster.cluster_id ]);
    const clusterMembersToken = await Helpers.collateUsersFcmTokensExceptConcernedUser(clusterMembers, loanApplicant.user_id);
    const isClusterAdmin = loanApplication.is_loan_initiator ? true : false;
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched approveClusterMemberLoanApplication.admin.controllers.loan.js`);
    const updatedLoanApplication = await processOneOrNoneData(loanQueries.updateClusterMemberLoanStatus, [ member_loan_id, 'approved', null ]);
    await processOneOrNoneData(loanQueries.updateAdminClusterLoanApprovalTrail,
      [ loanApplication.loan_id, member_loan_id, loanApplication.user_id, decision, admin.admin_id  ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: cluster loan status updated and admin approval recorded
    approveClusterMemberLoanApplication.admin.controllers.loan.js`);
    const outstandingLoanDecision = await processAnyData(clusterQueries.checkForOutstandingClusterLoanDecision, [ loanApplication.loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: checked if loan can be disbursed by cluster admin
    approveClusterMemberLoanApplication.admin.controllers.loan.js`);
    if (outstandingLoanDecision.length <= 0) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan can now be disbursed by cluster admin
      approveClusterMemberLoanApplication.admin.controllers.loan.js`);
      await processOneOrNoneData(clusterQueries.updateGeneralLoanApplicationCanDisburseLoan, [ loanApplication.loan_id ]);
      sendClusterNotification(loanApplicant, cluster, { is_admin: isClusterAdmin }, 'Cluster loan decisions concluded, admin can proceed to disburse loan',
        'loan-application-can-disburse', {});
      sendMulticastPushNotification('Cluster loan decisions concluded, admin can proceed to disburse loan', clusterMembersToken,
        'conclude-cluster-loan');
    }
    await MailService('Loan application approved', 'approvedLoan', { ...loanApplicant, requested_amount: loanApplication.amount_requested });
    await sendPushNotification(loanApplicant.user_id, PushNotifications.userLoanApplicationApproval('cluster'), loanApplicant.fcm_token);
    sendUserPersonalNotification(loanApplicant, 'Approved loan application',
      PersonalNotifications.approvedLoanApplicationNotification({ requested_amount: loanApplication.amount_requested }), 'approved-loan', { ...loanApplication });
    sendClusterNotification(loanApplicant, cluster, { is_admin: isClusterAdmin }, `${loanApplicant.first_name} ${loanApplicant.last_name} cluster loan approved by admin`,
      'loan-application-approved', {});
    sendMulticastPushNotification(`${loanApplicant.first_name} ${loanApplicant.last_name} cluster loan approved by admin`, clusterMembersToken,
      'admin-cluster-loan-decision');
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: notification sent to loan applicant approveClusterMemberLoanApplication.admin.controllers.loan.js`);
    await adminActivityTracking(req.admin.admin_id, 21, 'success', descriptions.manually_loan_approval(adminName, 'cluster'));
    return  ApiResponse.success(res, enums.LOAN_APPLICATION_DECISION('approved'), enums.HTTP_OK, updatedLoanApplication);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 21, 'fail', descriptions.manually_loan_approval_failed(`${req.admin.first_name} ${req.admin.last_name}`, 'cluster'));
    error.label = enums.APPROVE_CLUSTER_MEMBER_LOAN_APPLICATION_CONTROLLER;
    logger.error(`approving a cluster member loan application manually failed:::${enums.APPROVE_CLUSTER_MEMBER_LOAN_APPLICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * decline loan applications manually by admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */
export const declineLoanApplication = async(req, res, next) => {
  try {
    const { admin, body: { decision, rejection_reason }, params: { loan_id }, loanApplication } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched declineLoanApplication.admin.controllers.loan.js`);
    const updatedLoanApplication = await processOneOrNoneData(loanQueries.updateLoanStatus, [ loan_id, 'declined', rejection_reason.trim().toLowerCase() ]);
    await processOneOrNoneData(loanQueries.updateAdminLoanApprovalTrail, [ loan_id, loanApplication.user_id, decision, admin.admin_id  ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan status updated and admin rejection recorded declineLoanApplication.admin.controllers.loan.js`);
    await MailService('Loan application declined', 'declinedLoan', { ...loanApplicant, requested_amount: loanApplication.amount_requested });
    await sendPushNotification(loanApplicant.user_id, PushNotifications.userLoanApplicationDisapproval('individual'), loanApplicant.fcm_token);
    sendUserPersonalNotification(loanApplicant, 'Declined loan application',
      PersonalNotifications.declinedLoanApplicationNotification({ requested_amount: loanApplication.amount_requested }), 'declined-loan', { ...loanApplication });
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: notification sent to loan applicant declineLoanApplication.admin.controllers.loan.js`);
    await adminActivityTracking(req.admin.admin_id, 22, 'success', descriptions.manually_loan_disapproval(adminName, 'individual'));
    return  ApiResponse.success(res, enums.LOAN_APPLICATION_DECISION('declined'), enums.HTTP_OK, updatedLoanApplication);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 22, 'fail', descriptions.manually_loan_disapproval_failed(`${req.admin.first_name} ${req.admin.last_name}`, 'individual'));
    error.label = enums.DECLINE_LOAN_APPLICATION_CONTROLLER;
    logger.error(`declining a loan application manually failed:::${enums.DECLINE_LOAN_APPLICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * decline loan applications manually by admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */
export const declineClusterMemberLoanApplication = async(req, res, next) => {
  try {
    const { admin, body: { rejection_reason, decision }, params: { member_loan_id }, loanApplication } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    const [ cluster ] = await processAnyData(clusterQueries.checkIfClusterExists, [ loanApplication.cluster_id ]);
    const clusterMembers = await processAnyData(clusterQueries.fetchActiveClusterMembers, [ cluster.cluster_id ]);
    const clusterMembersToken = await Helpers.collateUsersFcmTokensExceptConcernedUser(clusterMembers, loanApplicant.user_id);
    const isClusterAdmin = loanApplication.is_loan_initiator ? true : false;
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched declineClusterMemberLoanApplication.admin.controllers.loan.js`);
    const updatedLoanApplication = await processOneOrNoneData(loanQueries.updateClusterMemberLoanStatus,
      [ member_loan_id, 'declined', rejection_reason.trim().toLowerCase() ]);
    await processOneOrNoneData(loanQueries.updateAdminClusterLoanApprovalTrail,
      [ loanApplication.loan_id, member_loan_id, loanApplication.user_id, decision, admin.admin_id  ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: cluster loan status updated and admin rejection recorded
    declineClusterMemberLoanApplication.admin.controllers.loan.js`);
    await MailService('Loan application declined', 'declinedLoan', { ...loanApplicant, requested_amount: loanApplication.amount_requested });
    await sendPushNotification(loanApplicant.user_id, PushNotifications.userLoanApplicationDisapproval('cluster'), loanApplicant.fcm_token);
    sendUserPersonalNotification(loanApplicant, 'Declined loan application',
      PersonalNotifications.declinedLoanApplicationNotification({ requested_amount: loanApplication.amount_requested }), 'declined-loan', { ...loanApplication });
    sendClusterNotification(loanApplicant, cluster, { is_admin: isClusterAdmin }, `${loanApplicant.first_name} ${loanApplicant.last_name} cluster loan declined by admin`,
      'loan-application-declined', {});
    sendMulticastPushNotification(`${loanApplicant.first_name} ${loanApplicant.last_name} cluster loan declined by admin`, clusterMembersToken,
      'admin-cluster-loan-decision');
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: notification sent to loan applicant declineClusterMemberLoanApplication.admin.controllers.loan.js`);
    await adminActivityTracking(req.admin.admin_id, 22, 'success', descriptions.manually_loan_disapproval(adminName, 'cluster'));
    return  ApiResponse.success(res, enums.LOAN_APPLICATION_DECISION('declined'), enums.HTTP_OK, updatedLoanApplication);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 22, 'fail', descriptions.manually_loan_disapproval_failed(`${req.admin.first_name} ${req.admin.last_name}`, 'cluster'));
    error.label = enums.DECLINE_CLUSTER_MEMBER_LOAN_APPLICATION_CONTROLLER;
    logger.error(`declining a cluster member loan application manually failed:::${enums.DECLINE_CLUSTER_MEMBER_LOAN_APPLICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * details of a single loan Application
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
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
 * @memberof AdminLoanController
 */

export const fetchLoans = async(req, res, next) => {
  try {
    const { query, admin } = req;
    const adminName = `${req.admin.first_name} ${req.admin.last_name}`;
    if (query.export) {
      const payload = loanPayload.fetchAllLoans(query);
      const loans = await processAnyData(loanQueries.fetchAllLoans, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched loans from the DB
       fetchLoans.admin.controllers.loan.js`);
      const data = {
        total_count: loans.length,
        loans
      };
      await adminActivityTracking(req.admin.admin_id, 41, 'success', descriptions.initiate_document_type_export(adminName, 'individual loan applications'));
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
 * @memberof AdminLoanController
 */

export const fetchRepaidLoans = async(req, res, next) => {
  try {
    const { query, admin } = req;
    const adminName = `${req.admin.first_name} ${req.admin.last_name}`;
    if (query.export) {
      const payload = loanPayload.fetchAllRepaidLoans(query);
      const repaidLoans = await processAnyData(loanQueries.fetchAllRepaidLoans, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched repaid loans from the DB
      fetchRepaidLoans.admin.controllers.loan.js`);
      const data = {
        total_count: repaidLoans.length,
        repaidLoans
      };
      await adminActivityTracking(req.admin.admin_id, 41, 'success', descriptions.initiate_document_type_export(adminName, 'repaid individual loans'));
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


/**
 * fetches rescheduled loans on the platform
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */
export const fetchRescheduledLoans = async(req, res, next) => {
  try {
    const { query, admin } = req;
    const adminName = `${req.admin.first_name} ${req.admin.last_name}`;
    if (query.export) {
      const payload = loanPayload.fetchAllRescheduledLoans(query);
      const rescheduledLoans = await processAnyData(loanQueries.fetchAllRescheduledLoans, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched repaid loans from the DB
      fetchRepaidLoans.admin.controllers.loan.js`);
      const data = {
        total_count: rescheduledLoans.length,
        rescheduledLoans
      };
      await adminActivityTracking(req.admin.admin_id, 41, 'success', descriptions.initiate_document_type_export(adminName, 'rescheduled individual loans'));
      return ApiResponse.success(res, enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
    }
    const payload = loanPayload.fetchRescheduledLoans(query);
    const [ rescheduledLoans, [ rescheduledLoansCount ] ] = await Promise.all([
      processAnyData(loanQueries.fetchRescheduledLoans, payload),
      processAnyData(loanQueries.fetchRescheduledLoansCount, payload)
    ]);

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched rescheduled loans from the DB
    fetchRescheduledLoans.admin.controllers.roles.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(rescheduledLoansCount.total_count),
      total_pages: Helpers.calculatePages(Number(rescheduledLoansCount.total_count), Number(req.query.per_page) || 10),
      rescheduledLoans
    };
    return ApiResponse.success(res, enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);

  } catch (error) {
    error.label = enums.RESCHEDULED_LOANS_CONTROLLER;
    logger.error(`fetching recheduled loans failed:::${enums.RESCHEDULED_LOANS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches rescheduled loan of a single user on the platform
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */

export const fetchSingleUserRescheduledLoan = async(req, res, next) => {
  try {
    const { params: {loan_id}, admin } = req;
    const [ [ userRescheduledDetails ],  newRepaymentBreakdown  ] = await Promise.all([
      processAnyData(loanQueries.fetchSingleRescheduledLoanDetails, loan_id),
      processAnyData(loanQueries.fetchNewRepaymentBreakdown, loan_id)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched rescheduled loan of a particular user from the DB
    fetchSingleUserRescheduledLoan.admin.controllers.loan.js`);
    const data = {
      userRescheduleDetails: userRescheduledDetails,
      newRepayment: newRepaymentBreakdown
    };
    return ApiResponse.success(res, enums.RESCHEDULED_LOAN_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.RESCHEDULED_LOAN_DETAILS_CONTROLLER;
    logger.error(`fetching recheduled loan details failed:::${enums.RESCHEDULED_LOAN_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches cluster loans on the platform
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */

export const fetchClusterLoans = async(req, res, next) => {
  try {
    const { query, admin } = req;
    const adminName = `${req.admin.first_name} ${req.admin.last_name}`;
    if (query.export) {
      const payload = loanPayload.fetchAllClusterLoans(query);
      const clusterLoans = await processAnyData(loanQueries.fetchAllClusterLoans, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched cluster loans from the DB
      fetchClusterLoans.admin.controllers.loan.js`);
      const data = {
        total_count: clusterLoans.length,
        clusterLoans
      };
      await adminActivityTracking(req.admin.admin_id, 41, 'success', descriptions.initiate_document_type_export(adminName, 'cluster loan applications'));
      return ApiResponse.success(res, enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);

    }
    const payload = loanPayload.fetchClusterLoans(query);
    const [ clusterLoans, [ clusterLoansCount ] ] = await Promise.all([
      processAnyData(loanQueries.fetchClusterLoans, payload),
      processAnyData(loanQueries.fetchClusterLoanCount, payload)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched cluster loans from the DB
    fetchClusterLoans.admin.controllers.loan.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(clusterLoansCount.total_count),
      total_pages: Helpers.calculatePages(Number(clusterLoansCount.total_count), Number(req.query.per_page) || 10),
      clusterLoans
    };
    return ApiResponse.success(res, enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_CLUSTER_LOAN_APPLICATIONS_CONTROLLER;
    logger.error(`fetching cluster loan applications failed:::${enums.FETCH_CLUSTER_LOAN_APPLICATIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches details of a cluster loan on the platform
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */

export const fetchAClusterLoanDetails = async(req, res, next) => {
  try {
    const {params: { loan_id, cluster_id}, admin} = req;
    const [ clusterLoanDetails, clusterMemberDetails ] = await Promise.all([
      processOneOrNoneData(loanQueries.fetchClusterLoanDetailsByLoanId, loan_id),
      processAnyData(loanQueries.fetchClusterLoanMembersDetails, [ loan_id, cluster_id ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched details of a cluster loan from the DB
    fetchAClusterLoanDetails.admin.controllers.loan.js`);
    const data = {
      clusterDetails: clusterLoanDetails,
      clusterMembers: clusterMemberDetails
    };
    return ApiResponse.success(res, enums.CLUSTER_LOAN_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_CLUSTER_LOAN_DETAILS_CONTROLLER;
    logger.error(`fetching cluster loan details failed:::${enums.FETCH_CLUSTER_LOAN_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches the cluster loan details of a particular member
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */

export const fetchSingleMemberClusterLoanDetails = async(req, res, next) => {
  try {
    const { admin, params: { member_loan_id } } = req;
    const memberDetails = await processOneOrNoneData(loanQueries.fetchMembersDetailsOfAClusterLoanByMemberId, [ member_loan_id ]);
    const loanDetails = await processOneOrNoneData(loanQueries.fetchClusterLoanDetailsOfEachUser, [ member_loan_id ]);
    const memberLoanId = loanDetails.member_loan_id;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched details a particular member of a cluster loan from the DB
      fetchSingleMemberClusterLoanDetails.admin.controllers.loan.js`);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched loanApplicationDetails.admin.controllers.loan.js`);
    const result = loanDetails.percentage_orr_score === null ? {  } : await loanOrrScoreBreakdown(loanDetails.user_id, memberLoanId);
    const orrScoreBreakdown = (result.status === 200) && (result.data.customer_id === loanDetails.user_id) ? result.data : {};
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan application ORR score fetched loanApplicationDetails.admin.controllers.loan.js`);
    const loanRepaymentBreakdown = (loanDetails.status === 'completed' || loanDetails.status === 'ongoing' ||
      loanDetails.status === 'over due') ?
      await processAnyData(loanQueries.fetchClusterLoanRepaymentBreakdown, [ member_loan_id ]) : [  ];
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan repayment breakdown fetched loanApplicationDetails.admin.controllers.loan.js`);
    const data = {
      memberLoanId,
      memberDetails,
      loan_details: loanDetails,
      orr_break_down: orrScoreBreakdown,
      loan_repayments: loanRepaymentBreakdown || []
    };
    return  ApiResponse.success(res, enums.LOAN_APPLICATION_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_DETAILS_OF_A_CLUSTER_MEMBER_CONTROLLER;
    logger.error(`fetching details of a cluster member failed:::${enums.FETCH_DETAILS_OF_A_CLUSTER_MEMBER_CONTROLLER}`, error.message);
    return next(error);
  }
};


/**
 * fetches in review cluster loans on the platform
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */

export const fetchInReviewClusterLoans = async(req, res, next) => {
  try {
    const { query, admin } = req;
    const adminName = `${req.admin.first_name} ${req.admin.last_name}`;
    if (query.export) {
      const payload = loanPayload.fetchAllInReviewClusterLoans(query);
      const inReviewClusterLoans = await processAnyData(loanQueries.fetchAllInReviewClusterLoans, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched in review cluster loans from the DB
      fetchInReviewClusterLoans.admin.controllers.loan.js`);
      const data = {
        total_count: inReviewClusterLoans.length,
        inReviewClusterLoans
      };
      await adminActivityTracking(req.admin.admin_id, 41, 'success', descriptions.initiate_document_type_export(adminName, 'in-review cluster loan applications'));
      return ApiResponse.success(res, enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);

    }
    const payload = loanPayload.fetchInReviewClusterLoans(query);
    const [ inReviewClusterLoans, [ inReviewClusterLoansCount ] ] = await Promise.all([
      processAnyData(loanQueries.fetchInReviewClusterLoans, payload),
      processAnyData(loanQueries.fetchInReviewClusterLoanCount, payload)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched cluster loans from the DB
    fetchInReviewClusterLoans.admin.controllers.loan.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(inReviewClusterLoansCount.total_count),
      total_pages: Helpers.calculatePages(Number(inReviewClusterLoansCount.total_count), Number(req.query.per_page) || 10),
      inReviewClusterLoans
    };
    return ApiResponse.success(res, enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_CONTROLLER;
    logger.error(`fetching in review cluster loan applications failed:::${enums.FETCH_IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches the in review cluster loan details of a particular member
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */

export const fetchSingleMemberInReviewLoanDetails = async(req, res, next) => {
  try {
    const { admin, params: { member_loan_id } } = req;
    const clusterDetails = await processOneOrNoneData(loanQueries.fetchClusterLoanDetails, [ member_loan_id ]);
    const loanDetails = await processOneOrNoneData(loanQueries.fetchClusterLoanDetailsOfEachUser, [ member_loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched details a particular member of a cluster loan from the DB
    fetchSingleMemberInReviewLoanDetails.admin.controllers.loan.js`);
    const memberLoanId = loanDetails.member_loan_id;
    const result = loanDetails.percentage_orr_score === null ? {  } : await loanOrrScoreBreakdown(loanDetails.user_id, memberLoanId);
    const orrScoreBreakdown = (result.status === 200) && (result.data.customer_id === loanDetails.user_id) ? result.data : {};
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan application ORR score fetched fetchSingleMemberInReviewLoanDetails.admin.controllers.loan.js`);
    const data = {
      memberLoanId,
      loanDetails,
      clusterDetails,
      orr_break_down: orrScoreBreakdown
    };
    return  ApiResponse.success(res, enums.LOAN_APPLICATION_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);

  } catch (error) {
    error.label = enums.FETCH_DETAILS_OF_A_CLUSTER_MEMBER_CONTROLLER;
    logger.error(`fetching details of a cluster member failed:::${enums.FETCH_DETAILS_OF_A_CLUSTER_MEMBER_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches cluster members cluster loan repayment
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */

export const fetchClusterMembersLoanRepayment = async(req, res, next) => {
  try {
    const { query, admin } = req;
    const adminName = `${req.admin.first_name} ${req.admin.last_name}`;
    if (query.export) {
      const payload = loanPayload.fetchAllRepaidClusterLoans(query);
      const repaidClusterLoans = await processAnyData(loanQueries.fetchAllClusterLoanRepayment, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched repaid loans from the DB
      fetchClusterMembersLoanRepayment.admin.controllers.loan.js`);
      const data = {
        total_count: repaidClusterLoans.length,
        repaidClusterLoans
      };
      await adminActivityTracking(req.admin.admin_id, 41, 'success', descriptions.initiate_document_type_export(adminName, 'repaid cluster loans'));
      return ApiResponse.success(res, enums.REPAID_LOANS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
    }
    const payload = loanPayload.fetchRepaidClusterLoans(query);
    const [ repaidClusterLoans, [ repaidClusterLoansCount ] ] = await Promise.all([
      processAnyData(loanQueries.fetchClusterLoanRepayments, payload),
      processAnyData(loanQueries.fetchClusterLoanRepaymentCount, payload)
    ]);

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched repaid loans from the DB
    fetchClusterMembersLoanRepayment.admin.controllers.roles.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(repaidClusterLoansCount.total_count),
      total_pages: Helpers.calculatePages(Number(repaidClusterLoansCount.total_count), Number(req.query.per_page) || 10),
      repaidClusterLoans
    };
    return ApiResponse.success(res, enums.REPAID_LOANS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);

  } catch (error) {
    error.label = enums.FETCH_CLUSTER_LOAN_REPAYMENT_CONTROLLER;
    logger.error(`fetching cluster loan repayment failed:::${enums.FETCH_CLUSTER_LOAN_REPAYMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches user's repayment details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */

export const fetchUserClusterLoanRepaymentDetails = async(req, res, next) => {
  try {
    const { params: { member_loan_id }, admin } = req;
    const clusterLoanDetails = await processOneOrNoneData(loanQueries.fetchClusterLoanRepaymentDetailsOfAUser, member_loan_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched cluster loan details of a user successfully
     fetchUserClusterLoanRepaymentDetails.admin.controllers.loan.js`);
    const loanDetails = await processOneOrNoneData(loanQueries.fetchClusterLoanDetailsOfEachUser, [ member_loan_id ]);
    const memberLoanId = loanDetails.member_loan_id;
    const result = loanDetails.percentage_orr_score === null ? {  } : await loanOrrScoreBreakdown(loanDetails.user_id, memberLoanId);
    const orrScoreBreakdown = (result.status === 200) && (result.data.customer_id === loanDetails.user_id) ? result.data : {};
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan application ORR score fetched fetchUserClusterLoanRepaymentDetails.admin.controllers.loan.js`);
    const repaymentHistory = await processAnyData(loanQueries.fetchMemberClusterLoanRepaymentHistory, member_loan_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched user repayment history
     fetchUserClusterLoanRepaymentDetails.admin.controllers.loan.js`);
    const data = {
      clusterDetails: clusterLoanDetails,
      loan_details: loanDetails,
      orr_break_down: orrScoreBreakdown,
      repaymentBreakdown: repaymentHistory
    };
    return ApiResponse.success(res, enums.LOAN_REPAYMENT_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_CLUSTER_LOAN_REPAYMENT_DETAILS_CONTROLLER;
    logger.error(`fetching cluster loan repayment details failed:::${enums.FETCH_CLUSTER_LOAN_REPAYMENT_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches rescheduled cluster loans on the platform
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */
export const fetchRescheduledClusterLoans = async(req, res, next) => {
  try {
    const { query, admin } = req;
    const adminName = `${req.admin.first_name} ${req.admin.last_name}`;
    if (query.export) {
      const payload = loanPayload.fetchAllRescheduledClusterLoans(query);
      const rescheduledClusterLoans = await processAnyData(loanQueries.fetchAllClusterRescheduledLoans, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched rescheduled loans from the DB
      fetchRescheduledClusterLoans.admin.controllers.loan.js`);
      const data = {
        total_count: rescheduledClusterLoans.length,
        rescheduledClusterLoans
      };
      await adminActivityTracking(req.admin.admin_id, 41, 'success', descriptions.initiate_document_type_export(adminName, 'rescheduled cluster loans'));
      return ApiResponse.success(res, enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
    }
    const payload = loanPayload.fetchRescheduledClusterLoans(query);
    const [ rescheduledClusterLoans, [ rescheduledClusterLoansCount ] ] = await Promise.all([
      processAnyData(loanQueries.fetchRescheduledClusterLoans, payload),
      processAnyData(loanQueries.rescheduledClusterLoansCount, payload)
    ]);

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched rescheduled loans from the DB
    fetchRescheduledClusterLoans.admin.controllers.roles.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(rescheduledClusterLoansCount.total_count),
      total_pages: Helpers.calculatePages(Number(rescheduledClusterLoansCount.total_count), Number(req.query.per_page) || 10),
      rescheduledClusterLoans
    };
    return ApiResponse.success(res, enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);

  } catch (error) {
    error.label = enums.FETCH_RESCHEDULED_CLUSTER_LOANS_CONTROLLER;
    logger.error(`fetching recheduled cluster loans failed:::${enums.FETCH_RESCHEDULED_CLUSTER_LOANS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches rescheduled cluster loan of a single member on the platform
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */

export const fetchSingleClusterMemberRescheduledLoan = async(req, res, next) => {
  try {
    const { params: {member_loan_id}, admin } = req;
    const [ clusterDetails, [ memberRescheduledDetails ],  newRepaymentBreakdown  ] = await Promise.all([
      processAnyData(loanQueries.fetchClusterLoanDetails, member_loan_id),
      processAnyData(loanQueries.fetchSingleRescheduledClusterLoanDetails, member_loan_id),
      processAnyData(loanQueries.fetchNewClusterRepaymentBreakdown, member_loan_id)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched rescheduled cluster loan of a particular member from the DB
    fetchSingleClusterMemberRescheduledLoan.admin.controllers.loan.js`);
    const data = {
      clusterLoanDetails: clusterDetails,
      userRescheduleDetails: memberRescheduledDetails,
      newRepayment: newRepaymentBreakdown
    };
    return ApiResponse.success(res, enums.RESCHEDULED_LOAN_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_SINGLE_RESCHEDULED_CLUSTER_LOANS_CONTROLLER;
    logger.error(`fetching single recheduled cluster loan details failed:::${enums.FETCH_SINGLE_RESCHEDULED_CLUSTER_LOANS_CONTROLLER}`, error.message);
    return next(error);
  }
};


/**
 * Manually create loan records for loans that have been issued offline
 *   Function Name: ManuallyInitiatePersonalLoanApplication
 *   Steps (1 -8)
 *   1. Get loan application details (user_id, amount, amount, loan_reason, duration_in_months, duration_in_months)
 *   2. Calculate totalFees (Processing Fee, Insurance Fee, and Advisory Fee)
 *   3. Calculate totalMonthlyRepayment ( Monthly_repayment * laon_duration_in_months
 *   4. Calculate totalInterestAmount ()
 *   5. Calculate totalAmountRepayable (totalmonthly repayment + total fees)
 *   6. Generate and process offer letter
 *   7. Approve loan
 *   8. Return success message
 */

// Function to calculate total fees
function calculateTotalFees(processingFee, insuranceFee, advisoryFee) {
  return parseFloat(processingFee) + parseFloat(insuranceFee) + parseFloat(advisoryFee);
}

// Function to calculate total monthly repayment
function calculateTotalMonthlyRepayment(monthlyRepayment, durationInMonths) {
  return parseFloat(monthlyRepayment) * Number(durationInMonths);
}

// Function to calculate total interest amount
function calculateTotalInterestAmount(totalMonthlyRepayment, loanAmount) {
  return parseFloat(totalMonthlyRepayment) - parseFloat(loanAmount);
}

// Function to calculate total amount repayable
function calculateTotalAmountRepayable(totalMonthlyRepayment, totalFees) {
  return parseFloat(totalMonthlyRepayment) + parseFloat(totalFees);
}

// Function to create loan application
async function createLoanApplication(userDetails, body) {
  const totalFees = calculateTotalFees(body.processing_fee, body.insurance_fee, body.advisory_fee);
  const totalMonthlyRepayment = calculateTotalMonthlyRepayment(body.monthly_repayment, body.duration_in_months);
  const totalInterestAmount = calculateTotalInterestAmount(totalMonthlyRepayment, body.amount);
  const totalAmountRepayable = calculateTotalAmountRepayable(totalMonthlyRepayment, totalFees);

  const loanApplicationDetails = await processOneOrNoneData(loanQueries.manuallyInitiatePersonalLoanApplication, [
    userDetails.user_id,
    parseFloat(body.amount),
    body.loan_reason,
    body.duration_in_months,
    totalAmountRepayable,
    totalInterestAmount,
    body.percentage_pricing_band,
    body.percentage_processing_fee,
    body.percentage_insurance_fee,
    body.percentage_advisory_fee,
    body.monthly_interest,
    body.processing_fee,
    body.insurance_fee,
    body.advisory_fee,
    body.monthly_repayment,
    body.loan_decision,
    body.is_loan_disbursed,
    body.loan_disbursed_at,
    body.total_outstanding_amount,
    body.status,
    false,
    body.initial_amount_requested,
    body.initial_loan_tenor_in_months
  ]);

  return loanApplicationDetails;
}

// Function to create repayment schedule
async function createRepaymentSchedule(loanApplicationDetails, userDetails) {
  const repaymentSchedule = await generateLoanRepaymentSchedule(loanApplicationDetails, userDetails.user_id);
  for (const schedule of repaymentSchedule) {
    await processOneOrNoneData(loanQueries.createDisbursedLoanRepaymentSchedule, [
      schedule.loan_id,
      schedule.user_id,
      schedule.repayment_order,
      schedule.principal_payment,
      schedule.interest_payment,
      schedule.fees,
      schedule.total_payment_amount,
      schedule.pre_payment_outstanding_amount,
      schedule.post_payment_outstanding_amount,
      schedule.proposed_payment_date,
      schedule.proposed_payment_date
    ]);
  }
  return repaymentSchedule;
}

// Function to prepare and return the response data
function prepareResponseData(loanApplicationDetails, body, totalMonthlyRepayment, totalAmountRepayable, totalInterestAmount, repaymentSchedule, userDetails) {
  return {
    loan_application_id: loanApplicationDetails.loan_id,
    loan_duration_in_month: body.duration_in_months,
    loan_amount: body.amount,
    fee: {
      processing_fee: body.processing_fee,
      insurance_fee: body.insurance_fee,
      advisory_fee: body.advisory_fee
    },
    monthly_repayment: totalMonthlyRepayment,
    total_amount_repayable: totalAmountRepayable,
    total_interest_amount: totalInterestAmount,
    repayment_data: repaymentSchedule
  };
}

// Main function
export const manuallyInitiatePersonalLoanApplication = async(req, res, next) => {
  try {
    const { body } = req;
    const [ userDetails ] = await processAnyData(
      userQueries.getUserByUserId, [ req.body.user_id ]);

    const loanApplicationDetails = await createLoanApplication(
      userDetails, body);
    const repaymentSchedule = await createRepaymentSchedule(
      loanApplicationDetails, userDetails
    );

    const totalMonthlyRepayment = calculateTotalMonthlyRepayment(
      body.monthly_repayment, body.duration_in_months);
    const totalAmountRepayable = calculateTotalAmountRepayable(
      loanApplicationDetails.totalMonthlyRepayment,
      calculateTotalFees(body.processing_fee, body.insurance_fee, body.advisory_fee));
    const totalInterestAmount = calculateTotalInterestAmount(
      loanApplicationDetails.totalMonthlyRepayment, body.amount);

    const responseData = prepareResponseData(
      loanApplicationDetails, body, totalMonthlyRepayment, totalAmountRepayable, totalInterestAmount, repaymentSchedule, userDetails);

    await userActivityTracking(userDetails.user_id, 37, 'success');
    await userActivityTracking(userDetails.user_id, 39, 'success');

    return ApiResponse.success(res, enums.MANUAL_LOAN_APPLICATION_MANUAL_BY_ADMIN, enums.HTTP_OK, responseData);
  } catch (error) {
    error.label = enums.FAILED_TO_CREATE_MANUAL_LOAN_RECORD;
    logger.error(`creating loan application record failed:::${enums.FAILED_TO_CREATE_MANUAL_LOAN_RECORD}`, error.message);
    return next(error);
  }
};


