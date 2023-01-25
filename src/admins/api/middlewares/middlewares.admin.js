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

/**
 * check if admin exists in the DB based on admin_id
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAdminMiddleware
 */
export const checkIfAdminExists = async(req, res, next) => {
  try {
    const { params: { admin_id } } = req;
    const [ adminUser ] = await AdminService.getAdminByAdminId([ admin_id ]);
    if (adminUser) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
      successfully confirms that admin being queries exists in the DB checkIfAdminExists.admin.middlewares.auth.js`);
      req.adminUser = adminUser;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
    successfully confirms that admin being queries does not exists in the DB checkIfAdminExists.admin.middlewares.auth.js`);
    return ApiResponse.error(res, enums.ACCOUNT_NOT_EXIST('admin'), enums.HTTP_BAD_REQUEST, enums.CHECK_IF_ADMIN_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_ADMIN_EXISTS_MIDDLEWARE;
    logger.error(`checking if queried admin id exists in the DB failed::${enums.CHECK_IF_ADMIN_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check queried admin is the super admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAdminMiddleware
 */
export const checkIfSuperAdmin = async(req, res, next) => {
  try {
    const { adminUser } = req;
    if (adminUser.role_type === 'SADM') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: queried admin is super admin checkIfSuperAdmin.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.ACTION_NOT_ALLOWED_FOR_SUPER_ADMIN, enums.HTTP_FORBIDDEN, enums.CHECK_IF_SUPER_ADMIN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: queried admin is not super admin checkIfSuperAdmin.admin.middlewares.auth.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_SUPER_ADMIN_MIDDLEWARE;
    logger.error(`checking if queried admin is super admin failed::${enums.CHECK_IF_SUPER_ADMIN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check queried admin is the same as authenticated non super admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAdminMiddleware
 */
export const checkIfAuthenticatedAdmin = async(req, res, next) => {
  try {
    const { admin, adminUser } = req;
    if ((adminUser.admin_id === admin.admin_id) && (admin.role_type !== 'SADM')) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: queried admin is same as authenticated non super admin checkIfSuperAdmin.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.ACTION_NOT_ALLOWED_FOR_SELF_ADMIN, enums.HTTP_FORBIDDEN, enums.CHECK_IF_AUTHENTICATED_ADMIN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: queried admin is not the same as authenticated non super admin checkIfSuperAdmin.admin.middlewares.auth.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_AUTHENTICATED_ADMIN_MIDDLEWARE;
    logger.error(`checking if queried admin is authenticated non super admin failed::${enums.CHECK_IF_AUTHENTICATED_ADMIN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if admin email being sent previously exists in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAdminMiddleware
 */
export const checkIfAdminEmailAlreadyExist = async(req, res, next) => {
  try {
    const [ adminEmail ] = await AdminService.getAdminByEmail(req.body.email.trim().toLowerCase());
    if (!adminEmail) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
      successfully confirms that admin's email is not existing in the database checkIfAdminEmailAlreadyExist.middlewares.admin.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
    successfully confirms that admin's email is existing in the database checkIfAminEmailAlreadyExist.middlewares.admin.js`);
    return ApiResponse.error(res, enums.ADMIN_EMAIL_EXIST, enums.HTTP_CONFLICT, enums.CHECK_IF_ADMIN_EMAIL_ALREADY_EXIST_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_ADMIN_EMAIL_ALREADY_EXIST_MIDDLEWARE;
    logger.error(`checking if user email is not already existing failed::${enums.CHECK_IF_ADMIN_EMAIL_ALREADY_EXIST_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check admin current status in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminAdminMiddleware
 */
export const checkAdminCurrentStatus = async(req, res, next) => {
  try {
    if (req.adminUser.status === req.body.status) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info:
      decoded that the admin is already ${req.body.status} in the DB. checkAdminCurrentStatus.admin.middlewares.admin.js`);
      return ApiResponse.error(res, enums.ADMIN_CURRENT_STATUS(req.body.status), enums.HTTP_BAD_REQUEST, enums.CHECK_ADMIN_CURRENT_STATUS_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_ADMIN_CURRENT_STATUS_MIDDLEWARE;
    logger.error(`checking if user email is not already existing failed::${enums.CHECK_ADMIN_CURRENT_STATUS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
