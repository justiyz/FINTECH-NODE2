import dayjs from 'dayjs';
import adminQueries from '../queries/queries.admin';
import authQueries from '../queries/queries.auth';
import roleQueries from '../queries/queries.role';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import AdminPayload from '../../lib/payloads/lib.payload.admin';
import MailService from '../services/services.email';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import * as Hash from '../../lib/utils/lib.util.hash';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import enums from '../../../users/lib/enums';
import config from '../../../users/config/index';
import * as fetchAdminServices from '../services/services.admin';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';

const { SEEDFI_NODE_ENV } = config;

/** 
*  admin completes their profile for the first time
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response containing admin profile
 * @memberof AdminAdminController
 */
export const completeAdminProfile = async(req, res, next) => {
  try {
    const { admin, body } = req;
    if (admin.is_completed_profile) {
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin has previously completed profile completeAdminProfile.admin.controllers.admin.js`);
      return ApiResponse.error(res, enums.ADMIN_ALREADY_COMPLETED_PROFILE, enums.HTTP_BAD_REQUEST, enums.COMPLETE_ADMIN_PROFILE_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin has not previously completed profile completeAdminProfile.admin.controllers.amin.js`);
    const payload = AdminPayload.completeAdminProfile(admin, body);
    const [ updatedAdmin ] = await processAnyData(adminQueries.updateAdminProfile, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: admin profile completed successfully completeAdminProfile.admin.controllers.admin.js`);
    await adminActivityTracking(req.admin.admin_id, 7, 'success', descriptions.completes_profile());
    return ApiResponse.success(res, enums.ADMIN_COMPLETE_PROFILE_SUCCESSFUL, enums.HTTP_OK, updatedAdmin);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 7, 'fail', descriptions.completes_profile_failed());
    error.label = enums.COMPLETE_ADMIN_PROFILE_CONTROLLER;
    logger.error(`completing admin profile in the DB failed${enums.COMPLETE_ADMIN_PROFILE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/** 
*  fetch admin personal permissions
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response containing admin permissions details
 * @memberof AdminAdminController
 */
export const adminPermissions = async(req, res, next) => {
  try {
    const { admin, adminUser } = req;
    const [ adminRole ] = await processAnyData(roleQueries.fetchRole, [ adminUser.role_type ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}::: Info: fetched role type details adminPermissions.admin.controllers.amin.js`);
    const adminResources = await processAnyData(roleQueries.fetchAdminResources, [  ]);
    const [ rolePermissions, adminPermissions ] = await Promise.all([
      processAnyData(authQueries.fetchRolePermissions, adminUser.role_type),
      processAnyData(authQueries.fetchAdminPermissions, adminUser.admin_id)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}::: Info: fetched system resources and admin's role and personal permissions 
    adminPermissions.admin.controllers.amin.js`);
    const fullRoleBasedResources = await Helpers.processRoleBasedPermissions(adminUser.admin_id, adminResources, rolePermissions);
    const fullAdminBasedResources = await Helpers.processAdminBasedPermissions(adminUser.role_type, adminResources, adminPermissions);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}::: Info: admin role and personal permissions aggregated adminPermissions.admin.controllers.amin.js`);
    const data = {
      admin_id: admin.admin_id,
      role_type: adminUser.role_type,
      role_name: adminRole.name,
      fullRoleBasedResources,
      fullAdminBasedResources
    };
    return ApiResponse.success(res, enums.ADMIN_PERMISSIONS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.ADMIN_PERMISSIONS_CONTROLLER;
    logger.error(`fetching admin personal permissions failed${enums.ADMIN_PERMISSIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/** 
*  edit admin personal permissions
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response containing admin permissions details
 * @memberof AdminAdminController
 */
export const editAdminPermissions = async(req, res, next) => {
  try {
    const { admin, body, params: { admin_id } } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    if (body.role_code) {
      await processAnyData(adminQueries.updateUserRoleType, [ admin_id, body.role_code.trim().toUpperCase() ]);
    }
    if (body.permissions) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: role permissions is being edited editAdminPermissions.admin.controllers.admin.js`);
      const editAdminPermissions = await body.permissions.map(async(permission) => {
        const [ resourcePermissionExists ] = await processAnyData(adminQueries.checkIfResourcePermissionCreated, [ admin_id,  permission.resource_id ]);
        !resourcePermissionExists ? await processAnyData(adminQueries.createAdminUserPermissions, [ admin_id,  permission.resource_id, permission.user_permissions.join() ]) :
          await processAnyData(adminQueries.editAdminUserPermissions, [ admin_id,  permission.resource_id, permission.user_permissions.join() ]);
        return permission;
      });
      await Promise.all([ editAdminPermissions ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: admin permissions edited successfully editAdminPermissions.admin.controllers.admin.js`);
    }
    await adminActivityTracking(req.admin.admin_id, 8, 'success', descriptions.edit_permission(adminName));
    return ApiResponse.success(res, enums.EDIT_ADMIN_PERMISSIONS_SUCCESSFUL, enums.HTTP_OK, { admin_id, ...body });
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 8, 'fail', descriptions.edit_permission_failed(`${req.admin.first_name} ${req.admin.last_name}`));
    error.label = enums.EDIT_ADMIN_PERMISSIONS_CONTROLLER;
    logger.error(`editing admin permissions failed:::${enums.EDIT_ADMIN_PERMISSIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * add new admin request
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns admin details.
 * @memberof AdminAdminController
 */
export const inviteAdmin = async(req, res, next) => {
  try {
    const password = Hash.generateRandomString(4);
    const hash = Hash.hashData(password);
    const payload = AdminPayload.addAdmin(req.body, hash);
    const [ newAdmin ] = await processAnyData(adminQueries.inviteAdmin, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: admin successfully created inviteAdmin.controllers.admin.admin.js`);
    const data = {
      firstName: newAdmin.first_name,
      email: newAdmin.email,
      password
    };
    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.ADMIN_SUCCESSFULLY_INVITED, enums.HTTP_OK,  { newAdmin, password });
    }
    await MailService('Admin Invite', 'adminInviteMail', { ...data });
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: invite admin mail successfully sent. inviteAdmin.controllers.admin.admin.js`);
    await adminActivityTracking(req.admin.admin_id, 6, 'success', 
      descriptions.invite_admin(`${req.admin.first_name} ${req.admin.last_name}`, `${req.body.first_name} ${req.body.last_name}`));
    return ApiResponse.success(res, enums.ADMIN_SUCCESSFULLY_INVITED, enums.HTTP_OK,  newAdmin);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 6, 'fail', 
      descriptions.invite_admin_failed(`${req.admin.first_name} ${req.admin.last_name}`, `${req.body.first_name} ${req.body.last_name}`));
    error.label = enums.INVITE_ADMIN_CONTROLLER;
    logger.error(`Inviting new admin failed:::${enums.INVITE_ADMIN_CONTROLLER}`, error.message);
    return next(error);
  }
};
/**
 * fetch filter and search all admins with pagination
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns admin details.
 * @memberof AdminAdminController
 */
export const fetchAllAdmins = async(req, res, next) => {
  try {
    if (req.query.export) {
      const filter = {
        status: req.query.status || null,
        start_date: req.query.start_date || null,
        end_date: req.query.end_date || null
      };
      const admins = await fetchAdminServices.fetchAdmins(req.query, filter, req.user);
      const data = {
        total_count: admins.admins.length,
        ...admins                                           
      };
      logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: successfully fetched admins from the DB fetchAllAdmins.controllers.admin.admin.js`);
      return ApiResponse.success(res, enums.SEARCH_FILTER_ADMINS, enums.HTTP_OK, data);
    }
    if (!req.query.per_page) req.query.per_page = '10'; 
    if (!req.query.page) req.query.page = '1';
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: successfully assigned default values for page and per_page variables in the fetchAllAdmins.controllers.admin.admin.js`);
    const filter = {
      status: req.query.status || null,
      start_date: req.query.start_date || null,
      end_date: req.query.end_date || null
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: successfully assigned the start and end dates values to filter object. fetchAllAdmins.controllers.admin.admin.js`);
    const admins = await fetchAdminServices.fetchAllAdmins(req.query, filter, req.user);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: successfully filtered or searched the admins and returned required data or response in the DB. 
    fetchAllAdmins.controllers.admin.admin.js`);
    return ApiResponse.success(res, enums.SEARCH_FILTER_ADMINS, enums.HTTP_OK, admins);
  } catch (error) {
    error.label = enums.FETCH_ALL_ADMINS_CONTROLLER;
    logger.error(`searching/filtering through a admins from the DB failed:::${enums.FETCH_ALL_ADMINS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * edit admin status
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns data with empty array.
 * @memberof AdminAdminController
 */
export const editAdminStatus = async(req, res, next) => {
  try {
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: 
    decoded that admin status is about to be edited editAdminStatus.admin.controllers.admin.js`);
    await processAnyData(adminQueries.editAdminStatus, [ req.params.admin_id, req.body.status ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: 
    successfully confirm that admin status has been edited. editAdminStatus.admin.controllers.admin.js`);
    return  ApiResponse.success(res, enums.EDIT_ADMIN_STATUS, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.EDIT_ADMIN_STATUS_CONTROLLER;
    logger.error(`Editing admin status in the db failed:::${enums.EDIT_ADMIN_STATUS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * get admin profile
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns admin details.
 * @memberof AdminAdminController
 */
export const getProfile = async(req, res, next) => {
  try {
    const { admin } = req;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: Admin data info fetched. getProfile.controllers.admin.admin.js`);
    delete admin.refresh_token;
    const [ adminRoleDetails ] = await processAnyData(roleQueries.fetchRole, [ admin.role_type ]);
    return ApiResponse.success(res, enums.FETCH_ADMIN_PROFILE, enums.HTTP_OK, { ...admin, role_name: adminRoleDetails.name });
  } catch (error) {
    error.label = enums.GET_PROFILE_CONTROLLER;
    logger.error(`Fetching admin profile failed:::${enums.GET_PROFILE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * platform overview page
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns overview page details.
 * @memberof AdminAdminController
 */
export const fetchPlatformOverview = async(req, res, next) => {
  try {
    const { admin, query: { type, from_date, to_date } } = req;
    const queryFromType = type === 'filter' ? from_date : null;
    const queryToType = type === 'filter' ? to_date : null;
    const currentYearFromDate = type === 'all' ? dayjs().format('YYYY-01-01 00:00:00') : from_date; // i.e first day of the current year
    const currentYearToDate = type === 'all' ? dayjs().format('YYYY-12-31 23:59:59') : to_date; // i.e last day of the current year
    const nplGraceDay = await processOneOrNoneData(adminQueries.fetchAdminSetEnvDetails, [ 'npl_overdue_past' ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: query types set based on query type and parameters sent 
    fetchPlatformOverview.controllers.admin.admin.js`);
    const [ totalLoanApproved, totalLoanRejected, totalLoanDisbursed, totalRegisteredCustomers, 
      unpaidLoans, paidLoans, totalLoanRepayment, totalLoanOverDue, appliedLoans, approvedLoans, 
      totalClusters, totalPrivateClusters, totalPublicClusters, recentClusters, totalTierOneUsers, 
      totalTierTwoUsers, totalTierZeroUsers, totalActiveLoanUsers, totalActiveUsers,
      totalOverdueRepayment, totalExpectedRepayment ] = await Promise.all([
      processOneOrNoneData(adminQueries.totalLoanApproved, [ queryFromType, queryToType ]),
      processOneOrNoneData(adminQueries.totalLoanRejected, [ queryFromType, queryToType ]),
      processOneOrNoneData(adminQueries.totalDisbursedLoan, [ queryFromType, queryToType ]),
      processOneOrNoneData(adminQueries.totalRegisteredCustomers, [ queryFromType, queryToType ]),
      processAnyData(adminQueries.fetchDetailsOfUnpaidLoans, [ currentYearFromDate, currentYearToDate ]),
      processAnyData(adminQueries.fetchDetailsOfPaidLoans, [ currentYearFromDate, currentYearToDate ]),
      processOneOrNoneData(adminQueries.totalLoanRepayment, [ queryFromType, queryToType ]),
      processOneOrNoneData(adminQueries.totalLoanOverDue, [ queryFromType, queryToType ]),
      processAnyData(adminQueries.fetchDetailsOfAppliedLoans, [ currentYearFromDate, currentYearToDate ]),
      processAnyData(adminQueries.fetchDetailsOfApprovedLoans, [ currentYearFromDate, currentYearToDate ]),
      processOneOrNoneData(adminQueries.fetchTotalClusterCount, [ queryFromType, queryToType ]),
      processOneOrNoneData(adminQueries.fetchPrivateClusterCount, [ queryFromType, queryToType ]),
      processOneOrNoneData(adminQueries.fetchPublicClusterCount, [ queryFromType, queryToType ]),
      processAnyData(adminQueries.fetchRecentClusters, [  ]),
      processOneOrNoneData(adminQueries.totalTierOneUsers, [  ]),
      processOneOrNoneData(adminQueries.totalTierTwoUsers, [  ]),
      processOneOrNoneData(adminQueries.totalTierZeroUsers, [  ]),
      processOneOrNoneData(adminQueries.totalActiveLoanUsers, [  ]),
      processOneOrNoneData(adminQueries.totalActiveUsers, [  ]),
      processOneOrNoneData(adminQueries.totalOverdueRepayment, [ Number(nplGraceDay.value) ]),
      processOneOrNoneData(adminQueries.totalExpectedRepayment, [  ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: all platform overview details fetched from the DB fetchPlatformOverview.controllers.admin.admin.js`);
    const data = {
      generalOverviewCount: {
        total_loan_approved: Number(totalLoanApproved.count), 
        total_loan_rejected: Number(totalLoanRejected.count),
        total_loan_disbursed: parseFloat(parseFloat(totalLoanDisbursed.sum).toFixed(2)) || 0, 
        totalRegisteredCustomers: Number(totalRegisteredCustomers.count)
      },
      loanTransactions: {
        unpaid_loans: unpaidLoans,
        paid_loans: paidLoans
      },
      loanRepayment: {
        total_loan_repayment: parseFloat(parseFloat(totalLoanRepayment.sum).toFixed(2)) || 0,
        total_loan_over_due: parseFloat(parseFloat(totalLoanOverDue.sum).toFixed(2)) || 0,
        total_loan_rescheduled: 0 // to later include the value once loan rescheduling is implemented
      },
      loanSchedule: {
        applied_loans: appliedLoans,
        approved_loans: approvedLoans
      },
      clusterGroup: {
        total_cluster_group: Number(totalClusters.count),
        total_private_cluster: Number(totalPrivateClusters.count),
        total_public_cluster: Number(totalPublicClusters.count),
        recent_clusters: recentClusters
      },
      others: {
        total_tier_one_users: Number(totalTierOneUsers.count),
        total_tier_two_users: Number(totalTierTwoUsers.count),
        total_tier_zero_users: Number(totalTierZeroUsers.count),
        borrowing_customers: {
          total_active_loan_customers: Number(totalActiveLoanUsers.count),
          total_customers: Number(totalActiveUsers.count),
          percentage: parseFloat(parseFloat((Number(totalActiveLoanUsers.count) / Number(totalActiveUsers.count)) * 100).toFixed(2)) || 0
        },
        npl_ratio: {
          total_over_due_repayment: parseFloat(parseFloat(totalOverdueRepayment.sum).toFixed(2)) || 0,
          total_expected_repayment: parseFloat(parseFloat(totalExpectedRepayment.sum).toFixed(2)) || 0,
          percentage: parseFloat(parseFloat((parseFloat(totalOverdueRepayment.sum) / parseFloat(totalExpectedRepayment.sum)) * 100).toFixed(2)) || 0
        }
      }
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: overview data arranged and set to be returned fetchPlatformOverview.controllers.admin.admin.js`);
    return ApiResponse.success(res, enums.PLATFORM_OVERVIEW_PAGE_FETCHED, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_PLATFORM_OVERVIEW_CONTROLLER;
    logger.error(`Fetching admin overview page details failed:::${enums.FETCH_PLATFORM_OVERVIEW_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch and filter activity log
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns overview page details.
 * @memberof AdminAdminController
 */
export const fetchActivityLog = async(req, res, next) => {
  try {
    const { query, admin } = req;
    const  payload  = AdminPayload.fetchActivityLog(query);
    const [ activityLog, [ activityLogCount ] ] = await Promise.all([
      processAnyData(adminQueries.fetchAndFilterActivityLog, payload),
      processAnyData(adminQueries.countFetchedActivityLog, payload)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched admin activities from the DB fetchAndFilterActivityLog.controllers.admin.admin.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(activityLogCount.total_count),
      total_pages: Helpers.calculatePages(Number(activityLogCount.total_count), Number(req.query.per_page) || 10),
      activityLog
    };
    return ApiResponse.success(res, enums.SUCCESSFULLY_FETCH_ACTIVITY_LOG, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_ACTIVITY_LOG_CONTROLLER;
    logger.error(`fetching activity log in the DB failed:::${enums.FETCH_ACTIVITY_LOG_CONTROLLER}`, error.message);
    return next(error);
  }
};
