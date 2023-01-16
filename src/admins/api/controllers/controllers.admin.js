import * as AdminService from '../services/services.admin';
import AdminPayload from '../../lib/payloads/lip.payload.admin';
import MailService from '../services/services.email';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import * as Hash from '../../lib/utils/lib.util.hash';
import enums from '../../../users/lib/enums';
import config from '../../../users/config/index';
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
