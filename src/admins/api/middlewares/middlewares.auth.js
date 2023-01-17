import * as AuthService from '../services/services.auth';
import * as AdminService from '../services/services.admin';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import * as Hash from '../../lib/utils/lib.util.hash';
import * as UserHash from '../../../users/lib/utils/lib.util.hash';
import * as UserHelpers from '../../../users/lib/utils/lib.util.helpers';
import { adminActivityTracking } from '../../lib/monitor';

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
    const [ adminPasswordDetails ] = await AuthService.fetchAdminPassword([ admin.admin_id ]);
    const passwordValid = await UserHash.compareData(password, adminPasswordDetails.password);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully returned compared passwords response compareAdminPassword.admin.middlewares.auth.js`);
    if (passwordValid) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: login password matches compareAdminPassword.admin.middlewares.auth.js`);
      return next();
    }
    adminActivityTracking(req.admin.admin_id, 9, 'fail');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: login password does not match compareAdminPassword.admin.middlewares.auth.js`);
    return ApiResponse.error(res, enums.INVALID_PASSWORD, enums.HTTP_BAD_REQUEST, enums.COMPARE_ADMIN_PASSWORD_MIDDLEWARE);
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 9, 'fail');
    error.label = enums.COMPARE_ADMIN_PASSWORD_MIDDLEWARE;
    logger.error(`comparing incoming and already set password in the DB failed:::${enums.COMPARE_ADMIN_PASSWORD_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * generate admin verification token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAuthMiddleware
 */
export const generateAdminVerificationToken = async(req, res, next) => {
  try {
    const token = UserHelpers.generateOtp();
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random token generated generateAdminVerificationToken.admin.middlewares.auth.js`);
    const [ existingToken ] = await AuthService.fetchAdminByVerificationToken([ token ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if token is existing in the database generateAdminVerificationToken.admin.middlewares.auth.js`);
    if (existingToken) {
      generateAdminVerificationToken(req, res, next);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully generates unique random token generateAdminVerificationToken.admin.middlewares.auth.js`);
    req.token = token;
    return next();
  } catch (error) {
    error.label = enums.GENERATE_ADMIN_VERIFICATION_TOKEN_MIDDLEWARE;
    logger.error(`generating random token(otp) and validating its existence from the DB failed:::${enums.GENERATE_ADMIN_VERIFICATION_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
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
    const { body: { otp } } = req;
    const [ otpAdmin ] = await AuthService.fetchAdminByVerificationToken([ otp ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if correct OTP is sent verifyLoginVerificationToken.admin.middlewares.auth.js`);
    if (!otpAdmin) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: OTP is invalid verifyVerificationToken.middlewares.auth.js`);
      return ApiResponse.error(res, enums.INVALID('OTP code'), enums.HTTP_BAD_REQUEST, enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpAdmin.admin_id}:::Info: OTP is valid verifyLoginVerificationToken.admin.middlewares.auth.js`);
    const isExpired = new Date().getTime() > new Date(otpAdmin.verification_token_expires).getTime();
    if (isExpired) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpAdmin.admin_id}:::Info: successfully confirms that verification token has expired verifyLoginVerificationToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.EXPIRED_VERIFICATION_TOKEN, enums.HTTP_FORBIDDEN, enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpAdmin.admin_id}:::Info: successfully confirms that verification token is still active verifyLoginVerificationToken.admin.middlewares.auth.js`);
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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: confirms this is another admin role type asides super admin adminPermissions.admin.middlewares.auth.js`);
    const [ rolePermissions, adminPermissions ] = await AuthService.fetchPermissions(admin.role_type, admin.admin_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: fetches admin roles adminPermissions.admin.middlewares.auth.js`);
    if ((rolePermissions && rolePermissions[0]) || (adminPermissions && adminPermissions[0])) {
      const role_permissions = {};
      const admin_permissions = {};
      rolePermissions.forEach((permission) => {
        role_permissions[
          permission.name
        ] = permission.permissions.split(',');
      });
      adminPermissions.forEach((permission) => {
        admin_permissions[
          permission.name
        ] = permission.permissions.split(',');
      });
      req.permissions = {
        role_permissions,
        admin_permissions
      };
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: admin roles properly aggregated adminPermissions.admin.middlewares.auth.js`);
      return next();
    }
    adminActivityTracking(req.admin.admin_id, 10, 'fail');
    return ApiResponse.error(res, enums.ADMIN_HAS_NO_PERMISSIONS, enums.HTTP_UNAUTHORIZED, enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 10, 'fail');
    error.label = enums.GENERATE_ADMIN_VERIFICATION_TOKEN_MIDDLEWARE;
    logger.error(`sorting admin permissions failed:::${enums.GENERATE_ADMIN_VERIFICATION_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * Get admin auth token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON object containing the user auth token
 * @memberof AdminAuthMiddleware
 */
export const getAdminAuthToken = async(req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that no authentication token was sent with the headers
      getAdminAuthToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.NO_TOKEN, enums.HTTP_UNAUTHORIZED, enums.GET_ADMIN_AUTH_TOKEN_MIDDLEWARE);
    }
    if (!token.startsWith('Bearer ')) {
      return ApiResponse.error(res, enums.INVALID_TOKEN, enums.HTTP_UNAUTHORIZED, enums.GET_ADMIN_AUTH_TOKEN_MIDDLEWARE);
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully extracts token getAdminAuthToken.admin.middlewares.auth.js`);
    }
    req.token = token;
    return next();
  } catch (error) {
    error.label = enums.GET_ADMIN_AUTH_TOKEN_MIDDLEWARE;
    logger.error(`confirming request header status if authentication token was sent along failed:::${enums.GET_ADMIN_AUTH_TOKEN_MIDDLEWARE}`, error.message);
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
export const validateAdminAuthToken = async(req, res, next) => {
  try {
    const { token } = req;
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
    const [ admin ] = await AdminService.getAdminByAdminId(decoded.admin_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.admin_id}:::Info: successfully fetched the users details using the decoded id validateAdminAuthToken.admin.middlewares.auth.js`);
    if (!admin) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that the user with the decoded id does not exist in the DB validateAdminAuthToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.INVALID_TOKEN, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_ADMIN_AUTH_TOKEN_MIDDLEWARE);
    }
    if (admin && (admin.is_deleted || admin.status !== 'active')) {
      // eslint-disable-next-line no-nested-ternary
      const adminStatus = admin.is_deleted ? 'deleted, kindly contact support team'  : `${admin.status}, kindly contact support team`;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.admin_id}:::Info: successfully confirms that user account is ${adminStatus} in the database validateAdminAuthToken.admin.middlewares.auth.js`);
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: admin has previously changed from their system default password checkIfChangedDefaultPassword.admin.middlewares.auth.js`);
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
 * generate admin reset password token to set password
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAuthMiddleware
 */
export const generateAdminResetPasswordToken = async(req, res, next) => {
  try {
    const { admin } = req;
    const token = await Hash.generateAdminResetPasswordToken(admin);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully generated password token generateAdminResetPasswordToken.admin.middlewares.auth.js`);
    req.passwordToken = token;
    return next();
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 18, 'fail');
    error.label = enums.GENERATE_ADMIN_RESET_PASSWORD_TOKEN_MIDDLEWARE;
    logger.error(`generating a temporary token to set new password failed:::${enums.GENERATE_ADMIN_RESET_PASSWORD_TOKEN_MIDDLEWARE}`, error.message);
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
    const { token } = req;
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
    if(decoded.email){
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded authentication token sent using the authentication secret
      validateAdminResetPasswordToken.admin.middlewares.auth.js`);
      const [ admin ] = await AdminService.getAdminByEmail(decoded.email);
      req.admin = admin;
      return next();
    }
  } catch (error) {
    error.label = enums.VALIDATE_ADMIN_PASSWORD_RESET_TOKEN_MIDDLEWARE;
    logger.error(`validating password reset authentication token failed:::${enums.VALIDATE_ADMIN_PASSWORD_RESET_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
