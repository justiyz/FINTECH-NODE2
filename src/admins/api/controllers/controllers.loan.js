import loanQueries from '../queries/queries.loan';
import * as loanService from '../services/services.db';
import userLoanQueries from '../../../users/api/queries/queries.loan';
import userQueries from '../queries/queries.user';
import clusterQueries from '../queries/queries.cluster';
import loanPayload from '../../lib/payloads/lib.payload.loans';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import enums from '../../../users/lib/enums';
import { processAnyData, processNoneData, processOneOrNoneData } from '../services/services.db';
import MailService from '../services/services.email';
import { sendClusterNotification, sendMulticastPushNotification, sendPushNotification, sendUserPersonalNotification } from '../services/services.firebase';
import * as PushNotifications from '../../../admins/lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates/personalNotification';
import { adminActivityTracking } from '../../lib/monitor';
import { loanOrrScoreBreakdown } from '../services/services.seedfiUnderwriting';
import * as descriptions from '../../lib/monitor/lib.monitor.description';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import loanMandateQueries from '../../../users/api/queries/queries.recova';
import * as Hash from '../../lib/utils/lib.util.hash';
import { parsePhoneNumber } from 'awesome-phonenumber';

import { initializeDebitCarAuthChargeForLoanRepayment } from '../services/service.paystack';
import * as recovaService from '../../../users/api/services/services.recova';

import {
  generateLoanRepaymentScheduleForShop,
  generateLoanRepaymentScheduleV2,
  generateLoanRepaymentScheduleForManualCreation
} from '../../../users/lib/utils/lib.util.helpers';
import { userActivityTracking } from '../../../users/lib/monitor';
import config from '../../../users/config';
import * as helpers from '../../lib/utils/lib.util.helpers';

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
    const {
      admin,
      body: { decision },
      params: { loan_id },
      loanApplication
    } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched approveLoanApplication.admin.controllers.loan.js`);
    const updatedLoanApplication = await processOneOrNoneData(loanQueries.updateLoanStatus, [ loan_id, 'approved', null ]);
    await processOneOrNoneData(loanQueries.updateAdminLoanApprovalTrail, [ loan_id, loanApplication.user_id, decision, admin.admin_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan status updated and admin approval recorded approveLoanApplication.admin.controllers.loan.js`);
    await MailService('Loan application approved', 'approvedLoan', { ...loanApplicant, requested_amount: loanApplication.amount_requested });
    await sendPushNotification(loanApplicant.user_id, PushNotifications.userLoanApplicationApproval('individual'), loanApplicant.fcm_token);
    sendUserPersonalNotification(
      loanApplicant,
      'Approved loan application',
      PersonalNotifications.approvedLoanApplicationNotification({ requested_amount: loanApplication.amount_requested }),
      'approved-loan',
      { ...loanApplication }
    );
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: notification sent to loan applicant approveLoanApplication.admin.controllers.loan.js`);
    await adminActivityTracking(req.admin.admin_id, 21, 'success', descriptions.manually_loan_approval(adminName, 'individual'));
    return ApiResponse.success(res, enums.LOAN_APPLICATION_DECISION('approved'), enums.HTTP_OK, updatedLoanApplication);
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
    const {
      admin,
      params: { member_loan_id },
      body: { decision },
      loanApplication
    } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    const [ cluster ] = await processAnyData(clusterQueries.checkIfClusterExists, [ loanApplication.cluster_id ]);
    const clusterMembers = await processAnyData(clusterQueries.fetchActiveClusterMembers, [ cluster.cluster_id ]);
    const clusterMembersToken = await Helpers.collateUsersFcmTokensExceptConcernedUser(clusterMembers, loanApplicant.user_id);
    const isClusterAdmin = loanApplication.is_loan_initiator ? true : false;
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched approveClusterMemberLoanApplication.admin.controllers.loan.js`);
    const updatedLoanApplication = await processOneOrNoneData(loanQueries.updateClusterMemberLoanStatus, [ member_loan_id, 'approved', null ]);
    await processOneOrNoneData(loanQueries.updateAdminClusterLoanApprovalTrail, [ loanApplication.loan_id, member_loan_id, loanApplication.user_id, decision, admin.admin_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: cluster loan status updated and admin approval recorded
    approveClusterMemberLoanApplication.admin.controllers.loan.js`);
    const outstandingLoanDecision = await processAnyData(clusterQueries.checkForOutstandingClusterLoanDecision, [ loanApplication.loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: checked if loan can be disbursed by cluster admin
    approveClusterMemberLoanApplication.admin.controllers.loan.js`);
    if (outstandingLoanDecision.length <= 0) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan can now be disbursed by cluster admin
      approveClusterMemberLoanApplication.admin.controllers.loan.js`);
      await processOneOrNoneData(clusterQueries.updateGeneralLoanApplicationCanDisburseLoan, [ loanApplication.loan_id ]);
      sendClusterNotification(
        loanApplicant,
        cluster,
        { is_admin: isClusterAdmin },
        'Cluster loan decisions concluded, admin can proceed to disburse loan',
        'loan-application-can-disburse',
        {}
      );
      sendMulticastPushNotification('Cluster loan decisions concluded, admin can proceed to disburse loan', clusterMembersToken, 'conclude-cluster-loan');
    }
    await MailService('Loan application approved', 'approvedLoan', { ...loanApplicant, requested_amount: loanApplication.amount_requested });
    await sendPushNotification(loanApplicant.user_id, PushNotifications.userLoanApplicationApproval('cluster'), loanApplicant.fcm_token);
    sendUserPersonalNotification(
      loanApplicant,
      'Approved loan application',
      PersonalNotifications.approvedLoanApplicationNotification({ requested_amount: loanApplication.amount_requested }),
      'approved-loan',
      { ...loanApplication }
    );
    sendClusterNotification(
      loanApplicant,
      cluster,
      { is_admin: isClusterAdmin },
      `${loanApplicant.first_name} ${loanApplicant.last_name} cluster loan approved by admin`,
      'loan-application-approved',
      {}
    );
    sendMulticastPushNotification(`${loanApplicant.first_name} ${loanApplicant.last_name} cluster loan approved by admin`, clusterMembersToken, 'admin-cluster-loan-decision');
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: notification sent to loan applicant approveClusterMemberLoanApplication.admin.controllers.loan.js`);
    await adminActivityTracking(req.admin.admin_id, 21, 'success', descriptions.manually_loan_approval(adminName, 'cluster'));
    return ApiResponse.success(res, enums.LOAN_APPLICATION_DECISION('approved'), enums.HTTP_OK, updatedLoanApplication);
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
    const {
      admin,
      body: { decision, rejection_reason },
      params: { loan_id },
      loanApplication
    } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched declineLoanApplication.admin.controllers.loan.js`);
    const updatedLoanApplication = await processOneOrNoneData(loanQueries.updateLoanStatus, [ loan_id, 'declined', rejection_reason.trim().toLowerCase() ]);
    await processOneOrNoneData(loanQueries.updateAdminLoanApprovalTrail, [ loan_id, loanApplication.user_id, decision, admin.admin_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan status updated and admin rejection recorded declineLoanApplication.admin.controllers.loan.js`);
    await MailService('Loan application declined', 'declinedLoan', { ...loanApplicant, requested_amount: loanApplication.amount_requested });
    await sendPushNotification(loanApplicant.user_id, PushNotifications.userLoanApplicationDisapproval('individual'), loanApplicant.fcm_token);
    sendUserPersonalNotification(
      loanApplicant,
      'Declined loan application',
      PersonalNotifications.declinedLoanApplicationNotification({ requested_amount: loanApplication.amount_requested }),
      'declined-loan',
      { ...loanApplication }
    );
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: notification sent to loan applicant declineLoanApplication.admin.controllers.loan.js`);
    await adminActivityTracking(req.admin.admin_id, 22, 'success', descriptions.manually_loan_disapproval(adminName, 'individual'));
    return ApiResponse.success(res, enums.LOAN_APPLICATION_DECISION('declined'), enums.HTTP_OK, updatedLoanApplication);
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
    const {
      admin,
      body: { rejection_reason, decision },
      params: { member_loan_id },
      loanApplication
    } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    const [ cluster ] = await processAnyData(clusterQueries.checkIfClusterExists, [ loanApplication.cluster_id ]);
    const clusterMembers = await processAnyData(clusterQueries.fetchActiveClusterMembers, [ cluster.cluster_id ]);
    const clusterMembersToken = await Helpers.collateUsersFcmTokensExceptConcernedUser(clusterMembers, loanApplicant.user_id);
    const isClusterAdmin = loanApplication.is_loan_initiator ? true : false;
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched declineClusterMemberLoanApplication.admin.controllers.loan.js`);
    const updatedLoanApplication = await processOneOrNoneData(loanQueries.updateClusterMemberLoanStatus, [ member_loan_id, 'declined', rejection_reason.trim().toLowerCase() ]);
    await processOneOrNoneData(loanQueries.updateAdminClusterLoanApprovalTrail, [ loanApplication.loan_id, member_loan_id, loanApplication.user_id, decision, admin.admin_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: cluster loan status updated and admin rejection recorded
    declineClusterMemberLoanApplication.admin.controllers.loan.js`);
    await MailService('Loan application declined', 'declinedLoan', { ...loanApplicant, requested_amount: loanApplication.amount_requested });
    await sendPushNotification(loanApplicant.user_id, PushNotifications.userLoanApplicationDisapproval('cluster'), loanApplicant.fcm_token);
    sendUserPersonalNotification(
      loanApplicant,
      'Declined loan application',
      PersonalNotifications.declinedLoanApplicationNotification({ requested_amount: loanApplication.amount_requested }),
      'declined-loan',
      { ...loanApplication }
    );
    sendClusterNotification(
      loanApplicant,
      cluster,
      { is_admin: isClusterAdmin },
      `${loanApplicant.first_name} ${loanApplicant.last_name} cluster loan declined by admin`,
      'loan-application-declined',
      {}
    );
    sendMulticastPushNotification(`${loanApplicant.first_name} ${loanApplicant.last_name} cluster loan declined by admin`, clusterMembersToken, 'admin-cluster-loan-decision');
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: notification sent to loan applicant declineClusterMemberLoanApplication.admin.controllers.loan.js`);
    await adminActivityTracking(req.admin.admin_id, 22, 'success', descriptions.manually_loan_disapproval(adminName, 'cluster'));
    return ApiResponse.success(res, enums.LOAN_APPLICATION_DECISION('declined'), enums.HTTP_OK, updatedLoanApplication);
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
    const {
      admin,
      params: { loan_id },
      loanApplication
    } = req;
    const [ loanApplicant ] = await processAnyData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched loanApplicationDetails.admin.controllers.loan.js`);
    const result = loanApplication.percentage_orr_score === null ? {} : await loanOrrScoreBreakdown(loanApplication.user_id, loan_id);
    const orrScoreBreakdown = result.status === 200 && result.data.customer_id === loanApplication.user_id ? result.data : {};
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan application ORR score fetched loanApplicationDetails.admin.controllers.loan.js`);
    const loanRepaymentBreakdown =
      loanApplication.status === 'completed' || loanApplication.status === 'ongoing' || loanApplication.status === 'over due'
        ? await processAnyData(loanQueries.fetchLoanRepaymentBreakdown, [ loan_id ])
        : [];
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
    return ApiResponse.success(res, enums.LOAN_APPLICATION_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
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
    const [ loans, [ loansCount ] ] = await Promise.all([ processAnyData(loanQueries.fetchLoans, payload), processAnyData(loanQueries.getLoansCount, payload) ]);
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
    const {
      params: { loan_id },
      admin
    } = req;
    const [ [ userRescheduledDetails ], newRepaymentBreakdown ] = await Promise.all([
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
    const {
      params: { loan_id, cluster_id },
      admin
    } = req;
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
    const {
      admin,
      params: { member_loan_id }
    } = req;
    const memberDetails = await processOneOrNoneData(loanQueries.fetchMembersDetailsOfAClusterLoanByMemberId, [ member_loan_id ]);
    const loanDetails = await processOneOrNoneData(loanQueries.fetchClusterLoanDetailsOfEachUser, [ member_loan_id ]);
    const memberLoanId = loanDetails.member_loan_id;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched details a particular member of a cluster loan from the DB
      fetchSingleMemberClusterLoanDetails.admin.controllers.loan.js`);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan applicant details fetched loanApplicationDetails.admin.controllers.loan.js`);
    const result = loanDetails.percentage_orr_score === null ? {} : await loanOrrScoreBreakdown(loanDetails.user_id, memberLoanId);
    const orrScoreBreakdown = result.status === 200 && result.data.customer_id === loanDetails.user_id ? result.data : {};
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan application ORR score fetched loanApplicationDetails.admin.controllers.loan.js`);
    const loanRepaymentBreakdown =
      loanDetails.status === 'completed' || loanDetails.status === 'ongoing' || loanDetails.status === 'over due'
        ? await processAnyData(loanQueries.fetchClusterLoanRepaymentBreakdown, [ member_loan_id ])
        : [];
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan repayment breakdown fetched loanApplicationDetails.admin.controllers.loan.js`);
    const data = {
      memberLoanId,
      memberDetails,
      loan_details: loanDetails,
      orr_break_down: orrScoreBreakdown,
      loan_repayments: loanRepaymentBreakdown || []
    };
    return ApiResponse.success(res, enums.LOAN_APPLICATION_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
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
    const {
      admin,
      params: { member_loan_id }
    } = req;
    const clusterDetails = await processOneOrNoneData(loanQueries.fetchClusterLoanDetails, [ member_loan_id ]);
    const loanDetails = await processOneOrNoneData(loanQueries.fetchClusterLoanDetailsOfEachUser, [ member_loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched details a particular member of a cluster loan from the DB
    fetchSingleMemberInReviewLoanDetails.admin.controllers.loan.js`);
    const memberLoanId = loanDetails.member_loan_id;
    const result = loanDetails.percentage_orr_score === null ? {} : await loanOrrScoreBreakdown(loanDetails.user_id, memberLoanId);
    const orrScoreBreakdown = result.status === 200 && result.data.customer_id === loanDetails.user_id ? result.data : {};
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: loan application ORR score fetched fetchSingleMemberInReviewLoanDetails.admin.controllers.loan.js`);
    const data = {
      memberLoanId,
      loanDetails,
      clusterDetails,
      orr_break_down: orrScoreBreakdown
    };
    return ApiResponse.success(res, enums.LOAN_APPLICATION_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
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
    const {
      params: { member_loan_id },
      admin
    } = req;
    const clusterLoanDetails = await processOneOrNoneData(loanQueries.fetchClusterLoanRepaymentDetailsOfAUser, member_loan_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}  ${admin.admin_id}:::Info: successfully fetched cluster loan details of a user successfully
     fetchUserClusterLoanRepaymentDetails.admin.controllers.loan.js`);
    const loanDetails = await processOneOrNoneData(loanQueries.fetchClusterLoanDetailsOfEachUser, [ member_loan_id ]);
    const memberLoanId = loanDetails.member_loan_id;
    const result = loanDetails.percentage_orr_score === null ? {} : await loanOrrScoreBreakdown(loanDetails.user_id, memberLoanId);
    const orrScoreBreakdown = result.status === 200 && result.data.customer_id === loanDetails.user_id ? result.data : {};
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
    const {
      params: { member_loan_id },
      admin
    } = req;
    const [ clusterDetails, [ memberRescheduledDetails ], newRepaymentBreakdown ] = await Promise.all([
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
 * fetches current loans of a single member on the platform
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */

export const adminFetchUserCurrentLoans = async(req, res, next) => {
  try {
    const {
      params: { user_id },
      admin
    } = req;
    const currentPersonalLoans = await processAnyData(loanQueries.fetchUserCurrentPersonalLoans, [ user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user current personal loan facilities fetched fetchUserCurrentLoans.admin.controllers.loan.js`);
    const currentClusterLoans = await processAnyData(loanQueries.fetchUserCurrentClusterLoans, [ user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user current cluster loan facilities fetched fetchUserCurrentLoans.admin.controllers.loan.js`);
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
 * fetches current loans of a single member on the platform
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminLoanController
 */

export const adminFetchUserLoanHistory = async(req, res, next) => {
  try {
    const {
      params: { user_id },
      admin
    } = req;
    const currentPersonalLoans = await processAnyData(loanQueries.fetchUserPersonalLoanHistory, [ user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user current personal loan facilities fetched adminFetchUserLoanHistory.admin.controllers.loan.js`);
    const currentClusterLoans = await processAnyData(loanQueries.fetchUserClusterLoanHistory, [ user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user current cluster loan facilities fetched adminFetchUserLoanHistory.admin.controllers.loan.js`);
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

export const adminFetchPersonalLoanDetails = async(req, res, next) => {
  try {
    const {
      admin,
      loanApplication,
      params: { loan_id }
    } = req;
    const [ nextRepaymentDetails ] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [ loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user next loan repayment details fetched fetchPersonalLoanDetails.controllers.loan.js`);
    const loanRepaymentDetails = await processAnyData(loanQueries.fetchLoanRepaymentSchedule, [ loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user loan repayment details fetched fetchPersonalLoanDetails.controllers.loan.js`);
    const selectedStatuses = [ 'ongoing', 'over due', 'completed' ];
    const next_repayment_date = !selectedStatuses.includes(loanApplication.status)
      ? dayjs().add(30, 'days').format('MMM DD, YYYY')
      : dayjs(nextRepaymentDetails.proposed_payment_date).format('MMM DD, YYYY');
    loanApplication.next_repayment_date = next_repayment_date;

    const [ loanMandateDetails ] = await processAnyData(loanQueries.fetchLoanMandateDetails, [ loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user loan repayment details fetched fetchPersonalLoanDetails.controllers.loan.js`);
    const data = {
      nextLoanRepaymentDetails: nextRepaymentDetails,
      loanDetails: loanApplication,
      loanRepaymentDetails,
      loanMandateDetails
    };
    return ApiResponse.success(res, enums.USER_LOAN_DETAILS_FETCHED_SUCCESSFUL('personal'), enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_PERSONAL_LOAN_DETAILS_CONTROLLER;
    logger.error(`fetching details of a personal loan failed::${enums.FETCH_PERSONAL_LOAN_DETAILS_CONTROLLER}`, error.message);
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
// function calculateTotalFees(processingFee, insuranceFee, advisoryFee) {
function calculateTotalFees(body) {
  const processingFee = (body.percentage_processing_fee / 100) * body.amount;
  const insuranceFee = (body.percentage_insurance_fee / 100) * body.amount;
  const advisoryFee = (body.percentage_advisory_fee / 100) * body.amount;

  return processingFee + insuranceFee + advisoryFee;
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

/**
 *
 * @param monthly_interest
 * @param loan_amount
 * @returns {number}
 */
function monthly_interest(monthly_interest, loan_amount) {
  return monthly_interest * loan_amount;
}

function figure_denominator(monthly_interest, loan_duration) {
  const bas_e = 1 - (1 + monthly_interest);
  return Math.pow(bas_e, -loan_duration);
}

/**
 *
 * @param all_in_pricing
 * @param period
 * @param loan_amount
 * @returns {number}
 */
export const monthly_repayment_numerator = (all_in_pricing, period, loan_amount) => {
  const monthly_interest_r_value = reducing_monthly_interest_function(all_in_pricing, period);
  return monthly_interest_r_value * loan_amount;
};

export const monthly_repayment_denominator = (monthly_interest, time_period) => {
  return 1 - Math.pow(1 + monthly_interest, -time_period);
};

/**
 *
 * @param all_in_pricing
 * @param period (year)
 * @returns {number}
 */
export const reducing_monthly_interest_function = (all_in_pricing, period) => {
  return all_in_pricing / period;
};

/**
 *
 * @param all_in_pricing
 * @param period
 * @param loan_amount
 * @param monthly_interest
 * @param loan_duration
 * @returns {number}
 */
export const monthly_repayment = (all_in_pricing, period, loan_amount, monthly_interest, loan_duration) => {
  return (monthly_repayment_numerator(all_in_pricing, period, loan_amount) / monthly_repayment_denominator(monthly_interest, loan_duration)).toFixed(2);
};

/**
 *
 * @param monthly_repayment
 * @param interest
 * @returns {number}
 */
export const principal_calculation = (monthly_repayment, interest) => {
  return monthly_repayment - interest;
};

/**
 *
 * @returns {number}
 */
function repayment_date() {
  const currentDate = new Date();
  return currentDate.getTime();
}

function principal_repayment_calculation(monthly_repayment_amount, reducing_monthly_interest, loan_amount) {
  return monthly_repayment_amount - reducing_monthly_interest * loan_amount;
}

function total_repayment_due_calculation(total_monthly_repayment, fees) {
  let sum = total_monthly_repayment + fees;
  return parseFloat(sum).toFixed(2);
}

function reducing_monthly_interest_calculation(reducing_monthly_interest, outstanding_loan_amount) {
  return reducing_monthly_interest * outstanding_loan_amount;
}

function outstanding_loan_amount_calculation(loan_amount, principal_payment) {
  return parseFloat(loan_amount - principal_payment).toFixed(2);
}

function principal_payment_calculation(monthly_repayment_amount, reducing_monthly_interest) {
  return monthly_repayment_amount - reducing_monthly_interest;
}

function new_total_payment_due(principal_payment, reducing_monthly_interest, fees) {
  return principal_payment + reducing_monthly_interest + fees;
}

function calcute_interest(reducing_monthly_interest, loan_amount) {
  return Number(reducing_monthly_interest * loan_amount).toFixed(2);
}

function churn_loan_amount(requested_loan_amount, outstanding_loan_amount) {
  return Number(requested_loan_amount - outstanding_loan_amount).toFixed(2);
}

/**
 *
 * @returns {boolean}
 * @param userDetails
 * @param body
 */
// export const repayment_information_churning_beta = (req, existingLoanApplication) => {
//   const { body } = req;
//   const loan_amount = body.amount;
//   let totalFee = calculateTotalFees(body)
//   let subsequentFee = 0;
//   // let preOutstandingLoanAmount = parseFloat(existingLoanApplication.amount_requested);
//   let preOutstandingLoanAmount = parseFloat(existingLoanApplication.total_outstanding_amount);
//   const all_in_pricing = 48/100;
//   const time_period = 12;
//   let reducing_monthly_interest = reducing_monthly_interest_function(all_in_pricing, time_period);
//   // let preOutstandingLoanAmount = parseFloat(existingLoanApplication.amount_requested);
//   let monthly_repayment_amount = monthly_repayment(all_in_pricing, time_period, loan_amount, reducing_monthly_interest, loan_duration);
//   // let monthlyRepayment = parseFloat(existingLoanApplication.monthly_repayment);
//   const loan_duration = body.duration_in_months;
//   let monthlyRepayment = monthly_repayment(all_in_pricing, time_period, loan_amount, reducing_monthly_interest, loan_duration);
//   // let monthlyInterest = parseFloat(existingLoanApplication.monthly_interest);
//   let monthlyInterest = reducing_monthly_interest_function(all_in_pricing, time_period);
//
//   let new_principal_payment = 0;
//   let pre_record_counter = 1;
//   console.log('Repayment Order: ', pre_record_counter);
//   console.log('Repayment Date: ', dayjs().format('YYYY-MM-DD'));
//   console.log('Principal: ', churn_loan_amount(loan_amount, 0))
//   console.log('Fees: ', totalFee)
//   console.log("Monthly Repayment: ", monthly_repayment_amount );
//   let principal_payment = principal_repayment_calculation(monthly_repayment_amount, reducing_monthly_interest, loan_amount);
//   console.log('Principal Payment: ', principal_payment);
//   console.log('Interest: ', calcute_interest(reducing_monthly_interest, loan_amount));
//   console.log('Total Payment Due: ', total_repayment_due_calculation(monthly_repayment_amount, totalFee));
//   let outstanding_loan_amount = churn_loan_amount(loan_amount, principal_payment); // loan_amount - principal_payment;
//   console.log('Outstanding Loan: ', outstanding_loan_amount);
//   console.log('.......................... ')
//   totalFee = 0;
//
//   let repaymentArray = [{
//     loan_id: existingLoanApplication.member_loan_id ? existingLoanApplication.member_loan_id : existingLoanApplication.loan_id,
//     user_id,
//     repayment_order: 1,
//     principal_payment: parseFloat(parseFloat(firstPrincipalPayment).toFixed(2)),
//     interest_payment: parseFloat(parseFloat(firstRepaymentInterest).toFixed(2)),
//     fees: parseFloat(parseFloat(totalFee).toFixed(2)),
//     total_payment_amount: parseFloat(parseFloat(firstRepaymentDue).toFixed(2)),
//     pre_payment_outstanding_amount: parseFloat(parseFloat(preOutstandingLoanAmount).toFixed(1)),
//     post_payment_outstanding_amount: parseFloat(parseFloat(postOutstandingLoanAmount).toFixed(1)),
//     proposed_payment_date: dayjs().add(30, 'days').format('YYYY-MM-DD')
//   }];
//
//   for (let record_counter = 1; record_counter < loan_duration; record_counter++) {
//     console.log('Repayment Order: ', pre_record_counter + record_counter);
//     console.log('Repayment Date: ', dayjs().add(30, 'days').format('YYYY-MM-DD'));
//     console.log('Principal: ', outstanding_loan_amount)
//     console.log('Fees: ', fees)
//     monthly_repayment_amount = monthly_repayment(all_in_pricing, time_period, loan_amount, reducing_monthly_interest, loan_duration);
//     console.log("Monthly Repayment: ", monthly_repayment_amount );
//     principal_payment = monthly_repayment_amount - calcute_interest(reducing_monthly_interest, outstanding_loan_amount);
//     console.log('Principal Payment: ', principal_payment);
//     console.log('Interest: ', calcute_interest(reducing_monthly_interest, outstanding_loan_amount));
//     new_principal_payment = principal_payment_calculation(monthly_repayment_amount, reducing_monthly_interest)
//     outstanding_loan_amount = outstanding_loan_amount_calculation(outstanding_loan_amount, principal_payment)
//     console.log('Total Payment Due: ', new_total_payment_due(new_principal_payment, reducing_monthly_interest, fees))
//     console.log('Outstanding Loan: ', outstanding_loan_amount);
//     console.log('.......................... ')
//   }
//   return true;
// }

async function createLoanApplication(userDetails, body) {
  const loan_amount = body.amount;
  const all_in_pricing = (body.monthly_interest * body.duration_in_months) / 100;
  const time_period = body.duration_in_months;
  const loan_duration = body.duration_in_months;
  let totalFees = calculateTotalFees(body);
  let reducing_monthly_interest = reducing_monthly_interest_function(all_in_pricing, time_period);
  let monthly_repayment_amount = monthly_repayment(all_in_pricing, time_period, loan_amount, reducing_monthly_interest, loan_duration);

  const totalMonthlyRepayment = calculateTotalMonthlyRepayment(monthly_repayment_amount, body.duration_in_months);
  const totalInterestAmount = calculateTotalInterestAmount(totalMonthlyRepayment, body.amount);
  const totalAmountRepayable = calculateTotalAmountRepayable(totalMonthlyRepayment, totalFees);
  return await processOneOrNoneData(loanQueries.manuallyInitiatePersonalLoanApplication, [
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
    (body.percentage_processing_fee / 100) * body.amount,
    (body.percentage_insurance_fee / 100) * body.amount,
    (body.percentage_advisory_fee / 100) * body.amount,
    monthly_repayment_amount,
    body.loan_decision,
    body.is_loan_disbursed,
    body.loan_disbursed_at,
    totalAmountRepayable,
    body.status,
    false,
    body.initial_amount_requested,
    body.initial_loan_tenor_in_months
  ]);
}

// Function to create repayment schedule
export async function createRepaymentSchedule(loanApplicationDetails, userDetails) {
  const repaymentSchedule = await generateLoanRepaymentScheduleV2(loanApplicationDetails, userDetails.user_id);
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

export async function createShopRepaymentSchedule(loanApplicationDetails, userDetails, activationCharge, monthly_installment) {
  const repaymentSchedule = await generateLoanRepaymentScheduleForShop(loanApplicationDetails, userDetails.user_id, activationCharge, monthly_installment);
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

// export const manuallyInitiatePersonalLoanApplication_exp = async (req, res, next) => {
//   const loan_period = 12;
//   try {
//     const { body } = req;
//     const [userDetails] = await processAnyData(userQueries.getUserByUserId, [req.body.user_id]);
//     // const loanApplicationDetails = await createLoanApplicationV2(userDetails, body, loan_period);
//     const loanApplicationDetails =  repayment_information_churning_beta(req, loan);
//     console.log(loanApplicationDetails);
//     return true;
//
//   } catch (error) {
//     error.label = enums.FAILED_TO_CREATE_MANUAL_LOAN_RECORD;
//     logger.error(`creating loan application record failed:::${enums.FAILED_TO_CREATE_MANUAL_LOAN_RECORD}`, error.message);
//     return next(error);
//   }
// };
// Main function
export const manuallyInitiatePersonalLoanApplication = async(req, res, next) => {
  try {
    const { body } = req;
    let repaymentSchedule = [];
    const [ userDetails ] = await processAnyData(userQueries.getUserByUserId, [ req.body.user_id ]);
    const loanApplicationDetails = await createLoanApplication(userDetails, body);
    if (body.status === 'ongoing') {
      repaymentSchedule = await createRepaymentSchedule(loanApplicationDetails, userDetails);
    }
    const totalMonthlyRepayment = calculateTotalMonthlyRepayment(body.monthly_repayment, body.duration_in_months);
    const totalAmountRepayable = calculateTotalAmountRepayable(loanApplicationDetails.totalMonthlyRepayment, calculateTotalFees(body));
    const totalInterestAmount = calculateTotalInterestAmount(loanApplicationDetails.totalMonthlyRepayment, body.amount);

    const responseData = prepareResponseData(loanApplicationDetails, body, totalMonthlyRepayment, totalAmountRepayable, totalInterestAmount, repaymentSchedule, userDetails);

    await userActivityTracking(userDetails.user_id, 37, 'success');
    await userActivityTracking(userDetails.user_id, 39, 'success');

    return ApiResponse.success(res, enums.MANUAL_LOAN_APPLICATION_MANUAL_BY_ADMIN, enums.HTTP_OK, responseData);
  } catch (error) {
    error.label = enums.FAILED_TO_CREATE_MANUAL_LOAN_RECORD;
    logger.error(`creating loan application record failed:::${enums.FAILED_TO_CREATE_MANUAL_LOAN_RECORD}`, error.message);
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
export const adminInitiateManualCardLoanRepayment = async(req, res, next) => {
  const {
    admin,
    loanApplication,
    params: { loan_id },
    query: { payment_type, custom_amount },
    userDebitCard
  } = req;
  const payment_channel = 'card';
  try {
    if (loanApplication.status === 'ongoing' || loanApplication.status === 'over due') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan has a status of ${loanApplication.status} so repayment is possible
      adminInitiateManualCardOrBankLoanRepayment.admin.controllers.loan.js`);
      const reference = uuidv4();
      const user = await processOneOrNoneData(userQueries.getUserByUserId, [ loanApplication.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: fetch loan user adminInitiateManualCardOrBankLoanRepayment.admin.controllers.loan.js`);
      const [ nextRepaymentDetails ] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [ loan_id, user.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan next repayment details fetched
       adminInitiateManualCardOrBankLoanRepayment.admin.controllers.loan.js`);

      if (nextRepaymentDetails.status !== 'over due') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan repayment is not over due
        adminInitiateManualCardOrBankLoanRepayment.admin.controllers.loan.js`);
        return ApiResponse.error(
          res,
          enums.LOAN_REPAYMENT_NOT_OVER_DUE(nextRepaymentDetails.status),
          enums.HTTP_BAD_REQUEST,
          enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER
        );
      }
      let paymentAmount =
        payment_type === 'full' ? parseFloat(loanApplication.total_outstanding_amount).toFixed(2) : parseFloat(nextRepaymentDetails.total_payment_amount).toFixed(2);

      paymentAmount = payment_type === 'part' && custom_amount ? parseFloat(custom_amount).toFixed(2) : paymentAmount;

      if (custom_amount && custom_amount * 100 > nextRepaymentDetails.post_payment_outstanding_amount * 100) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: custom amount is greater than repayment amount
        adminInitiateManualCardOrBankLoanRepayment.admin.controllers.loan.js`);
        return ApiResponse.error(res, enums.CUSTOM_AMOUNT_GREATER_THAN_REPAYMENT_AMOUNT, enums.HTTP_BAD_REQUEST, enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER);
      }

      const paystackAmountFormatting = parseFloat(paymentAmount) * 100; // Paystack requires amount to be in kobo for naira payment
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: payment amount properly formatted
      adminInitiateManualCardOrBankLoanRepayment.admin.controllers.loan.js`);
      await processAnyData(loanQueries.initializeBankTransferPayment, [
        user.user_id,
        parseFloat(paymentAmount),
        'paystack',
        reference,
        `${payment_type}_loan_repayment`,
        `user repays part of or all of existing personal loan facility via ${payment_channel}`,
        loan_id
      ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: payment reference and amount saved in the DB
      adminInitiateManualCardOrBankLoanRepayment.admin.controllers.loan.js`);
      const result = await initializeDebitCarAuthChargeForLoanRepayment(user, paystackAmountFormatting, reference, userDebitCard);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: payment initialize via paystack returns response
      adminInitiateManualCardOrBankLoanRepayment.admin.controllers.loan.js`);
      if (result.status === true && result.message.trim().toLowerCase() === 'charge attempted' && result.data.status === 'success') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan repayment via paystack initialized
         adminInitiateManualCardOrBankLoanRepayment.admin.controllers.loan.js`);
        // userActivityTracking(req.user.user_id, activityType, 'success');
        return ApiResponse.success(res, result.message, enums.HTTP_OK, {
          user_id: loanApplication.user_id,
          amount: parseFloat(paymentAmount).toFixed(2),
          payment_type,
          payment_channel,
          reference: result.data.reference,
          status: result.data.status,
          display_text: result.data.display_text || ''
        });
      }
      if (result.response && result.response.status === 400) {
        // userActivityTracking(req.user.user_id, activityType, 'fail');
        return ApiResponse.error(res, result.response.data.message, enums.HTTP_BAD_REQUEST, enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan repayment via paystack failed to be initialized
      adminInitiateManualCardOrBankLoanRepayment.admin.controllers.loan.js`);
      // userActivityTracking(req.user.user_id, activityType, 'fail');
      return ApiResponse.error(res, result.message, enums.HTTP_SERVICE_UNAVAILABLE, enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan has a status of ${loanApplication.status} and repayment is not possible
    adminInitiateManualCardOrBankLoanRepayment.admin.controllers.loan.js`);
    // userActivityTracking(req.user.user_id, activityType, 'fail');
    return ApiResponse.error(
      res,
      enums.LOAN_APPLICATION_STATUS_NOT_FOR_REPAYMENT(loanApplication.status),
      enums.HTTP_BAD_REQUEST,
      enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER
    );
  } catch (error) {
    // userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER;
    logger.error(`initiating loan repayment manually using saved card or bank account failed::${enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update user device fcm token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the users updated fcm token
 * @memberof RecovaController
 */

export const createMandateConsentRequest = async(req, res, next) => {
  const { admin, loanApplication: loanDetails } = req;

  try {
    const [ userDetails ] = await processAnyData(userQueries.fetchAllDetailsBelongingToUser, [ loanDetails.user_id ]);

    const loanRepaymentDetails = await processAnyData(loanQueries.fetchLoanRepaymentScheduleForMandate, [ loanDetails.loan_id, loanDetails.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user loan repayment details fetched createMandateConsentRequest.controllers.recova.js`);
    const [ accountDetails ] = await processAnyData(loanQueries.fetchBankAccountDetailsByUserIdForMandate, loanDetails.user_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user's default account details fetched successfully createMandateConsentRequest.controller.recova.js`);
    if (!accountDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user does not have a default account createMandateConsentRequest.controller.recova.js`);
      return ApiResponse.error(res, enums.NO_DEFAULT_ACCOUNT, enums.HTTP_BAD_REQUEST, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
    }
    if (accountDetails.bank_code.length > 3) {
      logger.info(
        `${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user bank account code ${accountDetails.bank_code} is not a commercial bank code createMandateConsentRequest.controller.recova.js`
      );
      return ApiResponse.error(res, enums.COMMERCIAL_BANK_REQUIRED, enums.HTTP_BAD_REQUEST, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
    }
    const collectionPaymentSchedules = loanRepaymentDetails.map(repayment => {
      return {
        repaymentDate: repayment.proposed_payment_date,
        repaymentAmountInNaira: parseFloat(repayment.total_payment_amount)
      };
    });
    const bvn = await Hash.decrypt(decodeURIComponent(userDetails.bvn));

    // const bvnData = await zeehService.zeehBVNVerificationCheck(bvn.trim(), {});

    // if (bvnData.status !== 'success') {
    //   logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's bvn verification failed createMandateConsentRequest.controller.recova.js`);

    //   return ApiResponse.error(res, 'Unable to process bvn', enums.HTTP_BAD_REQUEST, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
    // }
    const pn = parsePhoneNumber(userDetails.phone_number, { regionCode: 'NG' });
    if (!pn.valid) {
      logger.error(`${enums.CURRENT_TIME_STAMP}, Guest:::Info: user's  phone number is invalid  createMandateConsentRequest.controller.user.js`);
      return ApiResponse.error(res, 'Invalid phone number', enums.HTTP_BAD_REQUEST, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
    }

    // call recova service to create mandate
    const data = {
      bvn: bvn,
      businessRegistrationNumber: 'string',
      taxIdentificationNumber: 'string',
      loanReference: loanDetails.loan_id,
      customerID: userDetails.id,
      customerName: `${userDetails.first_name || ''} ${userDetails.middle_name || ''} ${userDetails.last_name || ''}`,
      customerEmail: userDetails.email,
      phoneNumber: pn.number.national.replace(/\s+/g, ''),
      loanAmount: loanDetails.amount_requested,
      totalRepaymentExpected: loanDetails.total_repayment_amount,
      loanTenure: loanDetails.loan_tenor_in_months,
      linkedAccountNumber: accountDetails.account_number,
      repaymentType: 'Collection',
      preferredRepaymentBankCBNCode: accountDetails.bank_code,
      preferredRepaymentAccount: accountDetails.account_number,
      collectionPaymentSchedules: collectionPaymentSchedules
    };

    const result = await recovaService.createConsentRequest(data);

    if (result.requestStatus.toLowerCase() === 'awaitingconfirmation') {
      const mandate = await processOneOrNoneData(loanMandateQueries.initiateLoanMandate, [
        loanDetails.loan_id,
        config.SEEDFI_RECOVA_INSTITUTION_CODE,
        result.requestStatus.toLowerCase(),
        result.consentConfirmationUrl
      ]);
      return ApiResponse.success(res, enums.CONSENT_REQUEST_INITIATED_SUCCESSFULLY, enums.HTTP_OK, mandate);
    }

    return ApiResponse.error(res, 'Unable to save initiated consent request', enums.HTTP_BAD_REQUEST, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
  } catch (error) {
    logger.error(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Error: ${error.message} createMandateConsentRequest.controller.recova.js`);
    return ApiResponse.error(res, 'Unable to initiate consent request', enums.HTTP_INTERNAL_SERVER_ERROR, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
  }
};

/**
 * fetches all users
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with all the users
 * @memberof RecovaController
 */
export const fetchUsers = async(req, res, next) => {
  try {
    const { query, admin } = req;
    const payload = query.search ? `%${query.search}%` : null;
    const users = await processAnyData(loanQueries.fetchUsers, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: users fetched successfully fetchUsers.admin.controllers.loan.js`);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: Additional log for verification fetchUsers.admin.controllers.loan.js`);

    return ApiResponse.success(res, enums.USER_FETCHED_SUCCESSFULLY, enums.HTTP_OK, users);
  } catch (error) {
    error.label = enums.FETCH_USER_CONTROLLER;
    logger.error(`fetching users failed:::${enums.FETCH_USER_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetches applicable loan period
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with all the users
 * @memberof RecovaController
 */
export const fetchLoanPeriod = async(req, res, next) => {
  try {
    const { params, admin } = req;
    const loanPeriod = await processOneOrNoneData(loanQueries.fetchLoanPeriod, params.loan_tenor);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan period fetched successfully fetchLoanPeriod.admin.controllers.loan.js`);
    return ApiResponse.success(res, enums.LOAN_PERIOD_FETCHED_SUCCESSFULLY, enums.HTTP_OK, loanPeriod);
  } catch (error) {
    error.label = enums.FETCH_LOAN_PERIOD_CONTROLLER;
    logger.error(`fetching loan period failed:::${enums.FETCH_LOAN_PERIOD_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * create manual loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - returns details of the created loan
 * @memberof RecovaController
 */
export const createManualLoan = async(req, res, next) => {
  try {
    const {body, admin, userDetails} = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const existingUser = await processOneOrNoneData(loanQueries.checkIfUserAlreadyHasOngoingLoan, body.user_id);
    if (existingUser) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully confirms user already has an ongoing loan createManualLoan.admin.controllers.loan.js`);
      return ApiResponse.error(res, enums.USER_HAS_ONGOING_LOAN, enums.HTTP_FORBIDDEN, enums.CREATE_MANUAL_LOAN_CONTROLLER);
    }

    const totalFees = helpers.calculateTotalFees(body);
    const monthlyInterest = helpers.calculateMonthlyInterestRate(body, 12); // 12 is the constant value for loan period
    const monthlyRepaymentNumerator = helpers.monthlyRepaymentNumerator(monthlyInterest, parseFloat(body.loan_amount));
    const monthlyRepaymentDenominator = helpers.monthlyRepaymentDenominator(monthlyInterest, parseFloat(body.loan_tenor));
    const monthlyRepayment = body.interest_rate === 0 ? body.loan_amount / body.loan_tenor : helpers.monthlyRepayment(monthlyRepaymentNumerator, monthlyRepaymentDenominator);
    const totalMonthlyRepayment = helpers.calculateTotalMonthlyRepayment(monthlyRepayment, parseFloat(body.loan_tenor));
    const totalOutstandingAmount = helpers.calculateTotalAmountRepayable(totalMonthlyRepayment, totalFees);
    const totalInterests = helpers.calculateTotalInterestAmount(totalMonthlyRepayment, parseFloat(body.loan_amount));
    const processingFee = helpers.processingFeeValue(parseFloat(body.processing_fee), parseFloat(body.loan_amount));
    const insuranceFee = helpers.insuranceFeeValue(parseFloat(body.insurance_fee), parseFloat(body.loan_amount));
    const advisoryFee = helpers.advisoryFeeValue(parseFloat(body.advisory_fee), parseFloat(body.loan_amount));

    if (body.loan_type === 'manual') {
      const payload = loanPayload.createManualLoan(
        body,
        totalOutstandingAmount,
        totalInterests,
        totalOutstandingAmount,
        monthlyInterest,
        processingFee,
        insuranceFee,
        advisoryFee,
        monthlyRepayment
      );
      const userLoan = await processOneOrNoneData(loanQueries.createManualLoan, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: manual loan created successfully createManualLoan.admin.controllers.loan.js`);

      const existingLoanApplication = await processOneOrNoneData(loanQueries.fetchLoanDetailsByLoanId, userLoan.loan_id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user loan details fetched successfully createManualLoan.admin.controllers.loan.js`);

      const repaymentSchedule = await generateLoanRepaymentScheduleForManualCreation(existingLoanApplication, body.user_id, body.loan_disbursement_date);
      repaymentSchedule.forEach(async schedule => {
        await Promise.all([
          processOneOrNoneData(userLoanQueries.updateDisbursedLoanRepaymentSchedule, [
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
          ])
        ]);
        return schedule;
      });
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${body.user_id}:::Info: loan repayment schedule updated successfully in the DB
          createManualLoan.controller.loan.js`);
      const paymentHistoryPayload = loanPayload.recordLoanDisbursementPaymentHistory(body, userLoan.loan_id);
      const loanDisbursementPaymentHistory = await processOneOrNoneData(loanQueries.recordLoanDisbursementPaymentHistory, paymentHistoryPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully recorded loan in paystack_payment_histories table
      createManualLoan.controller.loan.js`);

      const loanDisbursementPayload = loanPayload.recordPersonalLoanDisbursement(body, userLoan.loan_id, loanDisbursementPaymentHistory.id, userDetails.name);
      await processNoneData(userLoanQueries.updateLoanDisbursementTable, loanDisbursementPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully recorded loan in personal_loan_disbursements table
      createManualLoan.controller.loan.js`);
      if (body.loan_status === 'completed') {
        await processNoneData(loanQueries.updateRepaymentStatusToPaid, userLoan.loan_id);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: repayment status successfully set to paid in the DB
          createManualLoan.controller.loan.js`);
      }
      await userActivityTracking(body.user_id, 37, 'success');
      await userActivityTracking(body.user_id, 39, 'success');
      return ApiResponse.success(res, enums.LOAN_CREATED_SUCCESSFULLY, enums.HTTP_OK, userLoan);
    }
    const payload = loanPayload.createPreApprovedLoan(
      body,
      totalOutstandingAmount,
      totalInterests,
      totalOutstandingAmount,
      monthlyInterest,
      processingFee,
      insuranceFee,
      advisoryFee,
      monthlyRepayment
    );
    const userLoan = await processOneOrNoneData(loanQueries.createManualLoan, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: pre approved loan created successfully createManualLoan.admin.controllers.loan.js`);
    await adminActivityTracking(req.admin.admin_id, 72, 'success', descriptions.create_pre_approved_loan(adminName, userDetails.name));

    sendPushNotification(userDetails.user_id, PushNotifications.loanApproved(body.loan_amount), userDetails.fcm_token);
    return ApiResponse.success(res, enums.LOAN_CREATED_SUCCESSFULLY, enums.HTTP_OK, userLoan);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 71, 'fail', descriptions.create_manual_loan_failed(`${req.admin.first_name}, ${req.admin.last_name}`,
      req.userDetails.name));
    error.label = enums.CREATE_MANUAL_LOAN_CONTROLLER;
    logger.error(`creating manual loan failed:::${enums.CREATE_MANUAL_LOAN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch user loan outstanding amount
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the user outstanding amount
 * @memberof LoanController
 */
export const fetchUserOutstandingAmount = async(req, res, next) => {
  try {
    const { admin, loanApplication } = req;
    const outstandingAmount = loanApplication.total_outstanding_amount;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: fetched user loan details successfully
        fetchUserOutstandingAmount.admin.controller.loan.js`);
    return ApiResponse.success(res, enums.OUTSTANDING_AMOUNT_FETCHED_SUCCESSFULLY, enums.HTTP_OK, outstandingAmount);
  } catch (error) {
    error.label = enums.FETCH_OUTSTANDING_AMOUNT_CONTROLLER;
    logger.error(`fetching user outstanding amount failed::${enums.FETCH_OUTSTANDING_AMOUNT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * repays user loan manually
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the repayment details
 * @memberof LoanController
 */
export const updateUserPayment = async(req, res, next) => {
  try {
    const {
      params: { user_id, loan_id },
      body: { amount, payment_date },
      admin,
      loanApplication
    } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const user = await processOneOrNoneData(userQueries.getUserByUserId, user_id);
    const data = await loanService.updatePayment(user_id, loan_id, amount, payment_date, loanApplication);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan repaid successfully updateUserPayment.admin.controller.loan.js`);
    await adminActivityTracking(req.admin.admin_id, 73, 'success', descriptions.manual_loan_repayment(adminName, user.name));
    return ApiResponse.success(res, enums.LOAN_REPAID_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 73, 'fail', descriptions.manual_loan_repayment_failed(`${req.admin.first_name}, ${req.admin.last_name}`,
      req.user.name));
    error.label = enums.UPDATE_USER_PAYMENT_CONTROLLER;
    logger.error(`updating user's payment failed::${enums.UPDATE_USER_PAYMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * process the manual loan rescheduling
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a personal loan
 * @memberof LoanController
 */
export const processManualLoanRescheduling = async(req, res, next) => {
  try {
    const { params: { user_id }, admin, existingLoanApplication, body: { reschedule_tenor}, userDetails } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const userUnpaidRepayments = await processAnyData(userLoanQueries.fetchUserUnpaidRepayments, [ existingLoanApplication.loan_id, user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user's unpaid repayments fetched processManualLoanRescheduling.controllers.loan.js`);
    const [ nextRepayment ] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [ existingLoanApplication.loan_id, user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user's next loan repayment details fetched successfully
     processManualLoanRescheduling.controllers.loan.js`);
    const totalExtensionDays = userUnpaidRepayments.length * Number(reschedule_tenor);
    const newLoanDuration = `${existingLoanApplication.loan_tenor_in_months} month(s), ${totalExtensionDays} day(s)`;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: updated total loan tenor fetched processManualLoanRescheduling.controllers.loan.js`);
    await Promise.all([
      userUnpaidRepayments.map((repayment) => {
        processOneOrNoneData(userLoanQueries.updateNewRepaymentDate,
          [ repayment.id, dayjs(repayment.proposed_payment_date).add(Number(reschedule_tenor), 'days') ]);
        return repayment;
      }),
      processOneOrNoneData(userLoanQueries.updateLoanWithRescheduleDetails, [ existingLoanApplication.loan_id, Number(reschedule_tenor),
        parseFloat((existingLoanApplication.reschedule_count || 0) + 1), newLoanDuration, totalExtensionDays ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan rescheduling details updated successfully processManualLoanRescheduling.controllers.loan.js`);
    const data = {
      loan_id: existingLoanApplication.loan_id,
      user_id: userDetails.user_id,
      email: userDetails.email,
      first_name: userDetails.first_name,
      loan_reason: existingLoanApplication.loan_reason,
      amount_requested: existingLoanApplication.amount_requested,
      monthly_repayment: existingLoanApplication.monthly_repayment,
      initial_loan_duration: existingLoanApplication.loan_tenor_in_months,
      current_loan_duration: newLoanDuration,
      next_repayment_date: dayjs(nextRepayment.proposed_payment_date).add(Number(reschedule_tenor), 'days').format('MMM DD, YYYY'),
      status: existingLoanApplication.status,
      reschedule_extension_days: Number(reschedule_tenor),
      total_loan_extension_days: parseFloat(totalExtensionDays),
      is_reschedule: true
    };
    await adminActivityTracking(req.admin.admin_id, 74, 'success', descriptions.reschedule_manual_loan(adminName, userDetails.name));
    return ApiResponse.success(res, enums.LOAN_RESCHEDULING_PROCESSED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 74, 'fail', descriptions.reschedule_manual_loan_failed(`${req.admin.first_name}, ${req.admin.last_name}`,
      req.userDetails.name));
    error.label = enums.PROCESS_MANUAL_LOAN_RESCHEDULING_CONTROLLER;
    logger.error(`processing loan rescheduling loan failed::${enums.PROCESS_MANUAL_LOAN_RESCHEDULING_CONTROLLER}`, error.message);
    return next(error);
  }
};
