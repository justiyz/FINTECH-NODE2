import * as AdminService from '../services/services.admin';
import AdminPayload from '../../lib/payloads/lib.payload.roles.js';
import MailService from '../services/services.email';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import * as Hash from '../../lib/utils/lib.util.hash';
import enums from '../../../users/lib/enums';
import config from '../../../users/config/index';
import * as fetchAdminServices from '../../services/services.admin';
import { adminActivityTracking } from '../../lib/monitor';


const { SEEDFI_NODE_ENV } = config;

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
    const [ newAdmin ] = await AdminService.inviteAdmin(payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: admin successfully created inviteAdmin.controllers.admin.admin.js`);
    const data = {
      firstName: newAdmin.first_name,
      email: newAdmin.email,
      password
    };
    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.ADMIN_SUCCESSFULLY_INVITED, enums.HTTP_OK,  { newAdmin });
    }
    MailService('Admin Invite', 'adminInviteMail', { ...data });
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: invite admin mail successfully sent. inviteAdmin.controllers.admin.admin.js`);
    adminActivityTracking(req.admin.admin_id, 6, 'success');
    return ApiResponse.success(res, enums.ADMIN_SUCCESSFULLY_INVITED, enums.HTTP_OK,  newAdmin);
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 6, 'fail');
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
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: successfully filtered or searched the admins and returned required data or response in the DB. fetchAllAdmins.controllers.admin.admin.js`);
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
    await AdminService.editAdminStatus([ req.params.admin_id, req.body.status ]);
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
    return ApiResponse.success(res, enums.FETCH_ADMIN_PROFILE, enums.HTTP_OK, admin);
  } catch (error){
    error.label = enums.GET_PROFILE_CONTROLLER;
    logger.error(`Fetching admin profile failed:::${enums.GET_PROFILE_CONTROLLER}`, error.message);
    return next(error);
  }
};
