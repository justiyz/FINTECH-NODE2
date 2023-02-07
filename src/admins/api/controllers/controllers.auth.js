import dayjs from 'dayjs';
import authQueries from '../queries/queries.auth';
import roleQueries from '../queries/queries.role';
import { processAnyData } from '../services/services.db';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import MailService from '../services/services.email';
import * as Hash from '../../lib/utils/lib.util.hash';
import * as UserHelpers from '../../../users/lib/utils/lib.util.helpers';
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
    const { admin } = req;
    const token = UserHelpers.generateOtp();
    console.log(token);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random token generated completeAdminLoginRequest.admin.controllers.auth.js`);
    const [ existingToken ] = await processAnyData(authQueries.fetchAdminByVerificationToken, [ token ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if token is existing in the database completeAdminLoginRequest.admin.controllers.auth.js`);
    if (existingToken) {
      completeAdminLoginRequest(req, res, next);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully generates unique random token completeAdminLoginRequest.admin.controllers.auth.js`);
    const expireAt = dayjs().add(3, 'minutes');
    const expireTime = dayjs(expireAt).format('HH:mm:ss');
    const [ updatedAdmin ] = await processAnyData(authQueries.updateLoginToken, [ admin.admin_id, token, expireAt ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: login token set in the DB completeAdminLoginRequest.admin.controllers.auth.js`);
    MailService('Complete Login with OTP', 'login', { token, expireTime, ...admin });
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
    const [ updatedAdmin ] = await processAnyData(authQueries.updateLoginToken, [ admin.admin_id, null, null ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: login token set to null in the DB login.admin.controllers.auth.js`);
    const [ adminRoleDetails ] = await processAnyData(roleQueries.fetchRole, [ admin.role_type ]);
    adminActivityTracking(req.admin.admin_id, 10, 'success');
    return ApiResponse.success(res, enums.ADMIN_LOGIN_SUCCESSFULLY, enums.HTTP_OK, { ...updatedAdmin, role_name: adminRoleDetails.name, token });
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 10, 'fail');
    error.label = enums.ADMIN_LOGIN_CONTROLLER;
    logger.error(`login admin failed:::${enums.ADMIN_LOGIN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/** 
*  set admin password
 * @param {String} type - The type to know which action is being carried out.
 * @returns { JSON } - A JSON response containing user details
 * @memberof AdminAuthController
 */
export const setPassword =  (type = '') => async(req, res, next) => {
  try {
    const { admin, body } = req;
    const hash = await Hash.hashData(body.password.trim());
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: password hashed setPassword.admin.controllers.auth.js`);
    const [ setNewPassword ] = await processAnyData(authQueries.setNewAdminPassword, [ admin.admin_id, hash ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: hashed password saved in the DB setPassword.admin.controllers.auth.js`);
    const typeMonitor = type === 'first' ? 11 : 2;
    adminActivityTracking(req.admin.admin_id, typeMonitor, 'success');
    return ApiResponse.success(res, enums.PASSWORD_SET_SUCCESSFULLY, enums.HTTP_OK, setNewPassword);
  } catch (error) {
    error.label = enums.SET_PASSWORD_CONTROLLER;
    logger.error(`admin set new password:::${enums.SET_PASSWORD_CONTROLLER}`, error.message);
    return next(error);
  }
};

/** 
*  Admin Forgot password
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response containing user details
 * @memberof AdminAuthController
 */
export const forgotPassword = async(req, res, next) => {
  try {
    const { admin } = req;
    const token = UserHelpers.generateOtp();
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random token generated forgotPassword.admin.controllers.auth.js`);
    const [ existingToken ] = await processAnyData(authQueries.fetchAdminByVerificationToken, [ token ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if token is existing in the database forgotPassword.admin.controllers.auth.js`);
    if (existingToken) {
      forgotPassword(req, res, next);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully generates unique random token forgotPassword.admin.controllers.auth.js`);
    const expireAt = dayjs().add(5, 'minutes');
    const expireTime = dayjs(expireAt).format('HH:mm:ss');
    const payload = [ admin.email, token, expireAt ];
    await processAnyData(authQueries.adminForgotPassword, payload);
    const data ={ admin_id: admin.admin_id, token };
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: reset password token set in the DB forgotPassword.admin.controllers.auth.js`);
    adminActivityTracking(req.admin.admin_id, 1, 'success');
    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.PASSWORD_TOKEN, enums.HTTP_OK, data);
    }
    MailService('Reset your password', 'forgotPassword', { token, expireTime, ...admin });
    return ApiResponse.success(res, enums.PASSWORD_TOKEN, enums.HTTP_OK);
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 1, 'fail');
    error.label = enums.ADMIN_FORGOT_PASSWORD_CONTROLLER;
    logger.error(`admin forgot password request failed:::${enums.ADMIN_FORGOT_PASSWORD_CONTROLLER}`, error.message);
    return next(error);
  }
};

/** 
*  send admin reset password token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response containing user details
 * @memberof AdminAuthController
 */
export const sendAdminPasswordToken = async(req, res, next) => {
  try {
    const { admin} = req;
    const passwordToken = await Hash.generateAdminResetPasswordToken(admin);
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::: Info: successfully generated password token sendAdminPasswordToken.admin.controllers.auth.js`);
    const tokenExpiration = await JSON.parse(Buffer.from(passwordToken.split('.')[1], 'base64').toString()).exp;
    const myDate = new Date(tokenExpiration * 1000);
    const tokenExpireAt = dayjs(myDate);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully fetched token expiration time and converted it sendAdminPasswordToken.admin.controllers.auth.js`);
    adminActivityTracking(req.admin.admin_id, 18, 'success');
    return ApiResponse.success(res, enums.GENERATE_RESET_PASSWORD_TOKEN, enums.HTTP_OK, { passwordToken, tokenExpireAt });
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 18, 'fail');
    error.label = enums.SEND_ADMIN_PASSWORD_TOKEN_CONTROLLER;
    logger.error(`send password reset token failed${enums.SEND_ADMIN_PASSWORD_TOKEN_CONTROLLER}`, error.message);
    return next(error);
  }
};

