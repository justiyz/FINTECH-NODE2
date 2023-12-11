import authQueries from '../queries/queries.auth';
import adminQueries from '../queries/queries.admin';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import * as UserHash from '../../../users/lib/utils/lib.util.hash';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';
import config from '../../../users/config/index';
const { SEEDFI_UNDERWRITING_APP_ACCESS_TOKEN } = config;
import {TOKEN_VALIDATION_UNSUCCESSFUL} from "../../../users/lib/enums/lib.enum.labels";
import {INVALID_PASS_STRING} from "../../../users/lib/enums/lib.enum.messages";

/**
 * check if password sent matches admins password in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAuthMiddleware
 */
export const compareAdminPassword = async(req, res, next) => {
  try {
    const {
      body: { password }, admin
    } = req;
    const [ adminPasswordDetails ] = await processAnyData(authQueries.fetchAdminPassword, [ admin.admin_id ]);
    const passwordValid = await UserHash.compareData(password, adminPasswordDetails.password);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully returned compared passwords response compareAdminPassword.admin.middlewares.auth.js`);
    if (passwordValid) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: login password matches compareAdminPassword.admin.middlewares.auth.js`);
      return next();
    }
    await adminActivityTracking(req.admin.admin_id, 9, 'fail', descriptions.login_request_failed(`${req.admin.first_name} ${req.admin.last_name}`));
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: login password does not match compareAdminPassword.admin.middlewares.auth.js`);
    return ApiResponse.error(res, enums.INVALID_PASSWORD, enums.HTTP_BAD_REQUEST, enums.COMPARE_ADMIN_PASSWORD_MIDDLEWARE);
  } catch (error) {
    error.label = enums.COMPARE_ADMIN_PASSWORD_MIDDLEWARE;
    logger.error(`comparing incoming and already set password in the DB failed:::${enums.COMPARE_ADMIN_PASSWORD_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * records the number of times user has entered invalid otp and if more than required, deactivates the account
 * @param {Response} res - The response returned by the method.
 * @param {Object} admin - The admin details.
 * @returns {object} - Returns a response
 * @memberof AuthMiddleware
 */
const recordAdminInvalidOtpInputCount = async(res, admin) => {
  await processOneOrNoneData(adminQueries.updateAdminInvalidOtpCount, [ admin.admin_id ]);
  if (admin.invalid_verification_token_count >= 4) { // at 5th attempt or greater perform action
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: confirms user has entered invalid otp more than required limit recordAdminInvalidOtpInputCount.admin.middlewares.auth.js`);
    await processOneOrNoneData(adminQueries.deactivateAdmin, [ admin.admin_id ]);
    return ApiResponse.error(res, enums.ADMIN_ACCOUNT_DEACTIVATED, enums.HTTP_UNAUTHORIZED, enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
  }
};

/**
 * verify validity and expiry of admin login verification token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAuthMiddleware
 */
export const verifyLoginVerificationToken = async(req, res, next) => {
  try {
    const { body: { otp, email } } = req;
    const [ admin ] = await processAnyData(adminQueries.getAdminByEmail, [ email.trim().toLowerCase() ]);
    if (!admin) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that the user with the email does not exist in the DB
      verifyLoginVerificationToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.ACCOUNT_NOT_EXIST('Admin'), enums.HTTP_UNAUTHORIZED, enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    const [ otpAdmin ] = await processAnyData(authQueries.fetchAdminByVerificationTokenAndUniqueId, [ otp, admin.admin_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if correct OTP is sent verifyLoginVerificationToken.admin.middlewares.auth.js`);
    if (!otpAdmin) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: OTP is invalid verifyVerificationToken.middlewares.auth.js`);
      await recordAdminInvalidOtpInputCount(res, admin);
      return ApiResponse.error(res, enums.INVALID('OTP code'), enums.HTTP_BAD_REQUEST, enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpAdmin.admin_id}:::Info: OTP is valid verifyLoginVerificationToken.admin.middlewares.auth.js`);
    if (admin.invalid_verification_token_count >= 5) {
      await recordAdminInvalidOtpInputCount(res, admin);
    }
    const isExpired = new Date().getTime() > new Date(otpAdmin.verification_token_expires).getTime();
    if (isExpired) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpAdmin.admin_id}:::Info: successfully confirms that verification token has expired
      verifyLoginVerificationToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.EXPIRED_VERIFICATION_TOKEN, enums.HTTP_FORBIDDEN, enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpAdmin.admin_id}:::Info: successfully confirms that verification token is still active
    verifyLoginVerificationToken.admin.middlewares.auth.js`);
    req.admin = otpAdmin;
    return next();
  } catch (error) {
    error.label = enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE;
    logger.error(`verify login verification token failed::${enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * sort out admin permissions
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAuthMiddleware
 */
export const adminPermissions = async(req, res, next) => {
  try {
    const { admin } = req;
    if (admin.role_type === 'SADM') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: confirms this is super admin role type adminPermissions.admin.middlewares.auth.js`);
      req.permissions = {
        role_permissions: {},
        admin_permissions: {}
      };
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: confirms this is another admin role type asides super admin
    adminPermissions.admin.middlewares.auth.js`);
    const [ rolePermissions, adminPermissions ] = await Promise.all([
      processAnyData(authQueries.fetchRolePermissions, admin.role_type),
      processAnyData(authQueries.fetchAdminPermissions, admin.admin_id)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: fetches admin roles adminPermissions.admin.middlewares.auth.js`);
    if ((rolePermissions && rolePermissions[0]) || (adminPermissions && adminPermissions[0])) {
      const role_permissions = {};
      const admin_permissions = {};
      rolePermissions.forEach((permission) => {
        role_permissions[
          permission.name
        ] = permission.permissions;
      });
      adminPermissions.forEach((permission) => {
        admin_permissions[
          permission.name
        ] = permission.permissions;
      });
      req.permissions = {
        role_permissions,
        admin_permissions
      };
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: admin roles properly aggregated adminPermissions.admin.middlewares.auth.js`);
      return next();
    }
    await adminActivityTracking(req.admin.admin_id, 10, 'fail', descriptions.login_approved_failed(`${req.admin.first_name} ${req.admin.last_name}`));
    return ApiResponse.error(res, enums.ADMIN_HAS_NO_PERMISSIONS, enums.HTTP_UNAUTHORIZED, enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
  } catch (error) {
    error.label = enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE;
    logger.error(`sorting admin permissions failed:::${enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * validate the admin auth token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAuthMiddleware
 */

export const validateInfoCall = async(req, res, next) => {
  try {
    const valString = req.headers.x_token_check;
    if (valString != SEEDFI_UNDERWRITING_APP_ACCESS_TOKEN) {
      logger.error(`${enums.CURRENT_TIME_STAMP}, Error: Failed to validate the authorization token
      validateInfoCall.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.INVALID_PASS_STRING, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.TOKEN_VALIDATION_UNSUCCESSFUL;
    logger.error(`validation of token failed:::${enums.TOKEN_VALIDATION_UNSUCCESSFUL}`, error.message);
    return next(error);
  }
};
export const validateAdminAuthToken = async(req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that no authentication token was sent with the headers
      validateAdminAuthToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.NO_TOKEN, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE);
    }
    if (!token.startsWith('Bearer ')) {
      return ApiResponse.error(res, enums.INVALID_TOKEN, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE);
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully extracts token validateAdminAuthToken.admin.middlewares.auth.js`);
    }
    const decoded = UserHash.decodeToken(token);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.admin_id}:::Info: successfully decoded authentication token sent using the authentication secret
    validateAdminAuthToken.admin.middlewares.auth.js`);
    if (decoded.message) {
      if (decoded.message === 'jwt expired') {
        return ApiResponse.error(res, enums.SESSION_EXPIRED, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.admin_id}:::Info: successfully decoded authentication token has a message which is an
      error message validateAdminAuthToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, decoded.message, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE);
    }
    const [ admin ] = await processAnyData(adminQueries.getAdminByAdminId, [ decoded.admin_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.admin_id}:::Info: successfully fetched the users details using the decoded id
    validateAdminAuthToken.admin.middlewares.auth.js`);
    if (!admin) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that the user with the decoded id does not exist in the DB
      validateAdminAuthToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.INVALID_TOKEN, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE);
    }
    if (admin && (admin.is_deleted || admin.status !== 'active')) {
      const adminStatus = admin.is_deleted ? 'deleted, kindly contact support team'  : `${admin.status}, kindly contact support team`;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.admin_id}:::Info: successfully confirms that user account is ${adminStatus} in the database
      validateAdminAuthToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.USER_ACCOUNT_STATUS(adminStatus), enums.HTTP_UNAUTHORIZED, enums.VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE);
    }
    req.admin = admin;
    req.admin.permissions = { role_permissions: decoded.role_permissions, admin_permissions: decoded.admin_permissions };
    return next();
  } catch (error) {
    error.label = enums.VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE;
    logger.error(`Validating the admin auth token sent failed:::${enums.VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if admin has changed their default password
 * @param {String} type - The type to know which of the conditions to run.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAuthMiddleware
 */
export const checkIfChangedDefaultPassword = (type = '') => async(req, res, next) => {
  try {
    const { admin: { is_created_password } } = req;
    if (!is_created_password && type === 'verify') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: admin is yet to change from their system default password checkIfChangedDefaultPassword.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.ADMIN_NOT_SET_NEW_PASSWORD, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CHANGED_DEFAULT_PASSWORD_MIDDLEWARE);
    }
    if (is_created_password && type === 'validate') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: admin has previously changed from their system default password
      checkIfChangedDefaultPassword.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.ADMIN_ALREADY_SET_NEW_PASSWORD, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CHANGED_DEFAULT_PASSWORD_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: admin has changed from their system default password checkIfChangedDefaultPassword.admin.middlewares.auth.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_CHANGED_DEFAULT_PASSWORD_MIDDLEWARE;
    logger.error(`checking if admin has changed default password failed:::${enums.CHECK_IF_CHANGED_DEFAULT_PASSWORD_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * validate admin reset password token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAuthMiddleware
 */
export const validateAdminResetPasswordToken = async(req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that no authentication token was sent with the headers
      validateAdminResetPasswordToken.admin..middlewares.auth.js`);
      return ApiResponse.error(res, enums.NO_TOKEN, enums.HTTP_UNAUTHORIZED, enums.GET_ADMIN_AUTH_TOKEN_MIDDLEWARE);
    }
    if (!token.startsWith('Bearer ')) {
      return ApiResponse.error(res, enums.INVALID_TOKEN, enums.HTTP_UNAUTHORIZED, enums.GET_ADMIN_AUTH_TOKEN_MIDDLEWARE);
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully extracts token validateAdminResetPasswordToken.admin..middlewares.auth.js`);
    }
    const decoded = UserHash.decodeToken(token);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded authentication token sent using the authentication secret
    validateAdminResetPasswordToken.admin..middlewares.auth.js`);
    if (decoded.message) {
      if (decoded.message === 'jwt expired') {
        return ApiResponse.error(res, enums.SESSION_EXPIRED, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_ADMIN_PASSWORD_RESET_TOKEN_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded authentication token has a message which is an
      error message validateAdminResetPasswordToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, decoded.message, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_ADMIN_PASSWORD_RESET_TOKEN_MIDDLEWARE);
    }
    if (decoded.email) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded authentication token sent using the authentication secret
      validateAdminResetPasswordToken.admin.middlewares.auth.js`);
      const [ admin ] = await processAnyData(adminQueries.getAdminByEmail, [ decoded.email ]);
      req.admin = admin;
      return next();
    }
  } catch (error) {
    error.label = enums.VALIDATE_ADMIN_PASSWORD_RESET_TOKEN_MIDDLEWARE;
    logger.error(`validating password reset authentication token failed:::${enums.VALIDATE_ADMIN_PASSWORD_RESET_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if admin OTP verification request is not getting suspicious
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAuthMiddleware
 */
export const checkOtpVerificationRequestCount = async(req, res, next) => {
  try {
    const { admin } = req;
    if (admin && (admin.verification_token_request_count >= 4)) { // at 5th attempt or greater perform action
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: confirms user has requested for otp verification consistently without using it
      checkOtpVerificationRequestCount.admin.middlewares.auth.js`);
      await processOneOrNoneData(adminQueries.deactivateAdmin, [ admin.admin_id ]);
      return ApiResponse.error(res, enums.ADMIN_CANNOT_REQUEST_VERIFICATION_ANYMORE, enums.HTTP_UNAUTHORIZED, enums.CHECK_ADMIN_OTP_VERIFICATION_REQUEST_COUNT_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: confirms user otp verification request still within limit checkOtpVerificationRequestCount.admin.middlewares.auth.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_ADMIN_OTP_VERIFICATION_REQUEST_COUNT_MIDDLEWARE;
    logger.error(`checking if admin OTP verification request is still within limit failed::${enums.CHECK_ADMIN_OTP_VERIFICATION_REQUEST_COUNT_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * Checks if reset password is same as current
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const checkIfResetCredentialsSameAsOld = async(req, res, next) => {
  try {
    const {
      body: { password }, admin } = req;
    const [ adminPasswordDetails ] = await processAnyData(authQueries.fetchAdminPassword, [ admin.admin_id ]);
    const isValidCredentials = UserHash.compareData(password, adminPasswordDetails.password);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: successfully returned compared user response checkIfResetCredentialsSameAsOld.middlewares.auth.js`);
    if (isValidCredentials) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
      decoded that new password matches with oldpassword. checkIfResetCredentialsSameAsOld.middlewares.auth.js`);
      return ApiResponse.error(res, enums.IS_VALID_CREDENTIALS('password'), enums.HTTP_BAD_REQUEST, enums.CHECK_IF__RESET_CREDENTIALS_IS_SAME_AS_OLD_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
    confirms that users new password is not the same as the currently set password checkIfResetCredentialsSameAsOld.middlewares.auth.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF__RESET_CREDENTIALS_IS_SAME_AS_OLD_MIDDLEWARE;
    logger.error(`Checking if password sent matches in the DB failed:::${enums.CHECK_IF__RESET_CREDENTIALS_IS_SAME_AS_OLD_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
