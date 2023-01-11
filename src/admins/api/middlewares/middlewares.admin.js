import * as AdminService from '../services/services.admin';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';

/**
 * Fetch admin details from the database
 * @param {string} type - a type to know which of the response to return
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAdminMiddleware
 */
export const validateUnAuthenticatedAdmin = (type = '') => async(req, res, next) => {
  try {
    const { body } = req;
    const payload = body.email || req.admin.email;
    const [ admin ] = await AdminService.getAdminByEmail([ payload.trim().toLowerCase() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully fetched admin details from the database validateUnAuthenticatedAdmin.admin.middlewares.admin.js`);
    if (!admin && (type === 'login' || type === 'verify')) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: confirms that admin's email is not existing in the database validateUnAuthenticatedAdmin.admin.middlewares.admin.js`);
      return ApiResponse.error(res, type === 'login' ? enums.INVALID_PASSWORD : enums.ACCOUNT_NOT_EXIST('Admin'), enums.HTTP_BAD_REQUEST, enums.VALIDATE_UNAUTHENTICATED_ADMIN_MIDDLEWARE);
    }
    if (admin && type === 'login' && (admin.status !== 'active' || admin.is_deleted )) {
      // eslint-disable-next-line no-nested-ternary
      const adminStatus = admin.is_deleted ? 'deleted, kindly contact support team'  : `${admin.status}, kindly contact support team`;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully confirms that admin account is ${adminStatus} in the database validateUnAuthenticatedAdmin.admin.middlewares.admin.js`);
      return ApiResponse.error(res, enums.USER_ACCOUNT_STATUS(adminStatus), enums.HTTP_UNAUTHORIZED, enums.VALIDATE_UNAUTHENTICATED_ADMIN_MIDDLEWARE);
    }
    req.admin = admin;
    return next();
  } catch (error) {
    error.label = enums.VALIDATE_UNAUTHENTICATED_ADMIN_MIDDLEWARE;
    logger.error(`getting admins details from the database failed::${enums.VALIDATE_UNAUTHENTICATED_ADMIN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
