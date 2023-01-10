import dayjs from 'dayjs';
import * as AuthService from '../services/services.auth';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import MailService from '../services/services.email';
import * as Hash from '../../lib/utils/lib.util.hash';
import config from '../../../users/config/index';
import { adminActivityTracking } from '../../lib/monitor';

const { SEEDFI_NODE_ENV } = config;

/**
 * complete admin login request
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns admin details.
 * @memberof AdminAuthController
 */
export const completeAdminLoginRequest = async(req, res, next) => {
  try {
    const { token, admin } = req;
    const expireAt = dayjs().add(5, 'minutes');
    const [ updatedAdmin ] = await AuthService.updateLoginToken([ admin.admin_id, token, expireAt ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: login token set in the DB completeAdminLoginRequest.admin.controllers.auth.js`);
    MailService('Complete Login with OTP', 'login', { token, ...admin });
    adminActivityTracking(req.admin.admin_id, 9, 'success');
    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.LOGIN_REQUEST_SUCCESSFUL, enums.HTTP_OK, { ...updatedAdmin, token });
    }
    return ApiResponse.success(res, enums.LOGIN_REQUEST_SUCCESSFUL, enums.HTTP_OK, updatedAdmin);
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 9, 'fail');
    error.label = enums.COMPLETE_ADMIN_LOGIN_REQUEST_CONTROLLER;
    logger.error(`completing admin login request failed:::${enums.COMPLETE_ADMIN_LOGIN_REQUEST_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * login admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns admin login details.
 * @memberof AdminAuthController
 */
export const login = async(req, res, next) => {
  try {
    const { admin , permissions} = req;
    const token = await Hash.generateAdminAuthToken(admin, permissions);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: auth token generated login.admin.controllers.auth.js`);
    const [ updatedAdmin ] = await AuthService.updateLoginToken([ admin.admin_id, null, null ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: login token set to null in the DB login.admin.controllers.auth.js`);
    adminActivityTracking(req.admin.admin_id, 10, 'success');
    return ApiResponse.success(res, enums.ADMIN_LOGIN_SUCCESSFULLY, enums.HTTP_OK, { ...updatedAdmin, token });
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 10, 'fail');
    error.label = enums.ADMIN_LOGIN_CONTROLLER;
    logger.error(`login admin failed:::${enums.ADMIN_LOGIN_CONTROLLER}`, error.message);
    return next(error);
  }
};

