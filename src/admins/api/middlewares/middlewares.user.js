import * as UserService from '../services/services.user';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { adminActivityTracking } from '../../lib/monitor';


/**
 * check if user is on active loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminUserMiddleware
 */
export const userLoanStatus = async(req, res, next) => {
  try {
    if (req.userDetails.loan_status !== 'inactive') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: user is currently on an active loan userLoanStatus.admin.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_IS_ON_AN_ACTIVE_LOAN, enums.HTTP_FORBIDDEN, enums.USER_LOAN_STATUS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: user is not on an active loan userLoanStatus.admin.middlewares.user.js`);
    return next();
  } catch (error) {
    error.label = enums.USER_LOAN_STATUS_MIDDLEWARE;
    logger.error(`checking if user is on an active loan failed::${enums.USER_LOAN_STATUS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check user current status in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminUserMiddleware
 */
export const checkUserCurrentStatus = async(req, res, next) => {
  const { body: { status } } = req;
  const activityType = status === 'active' ? 19 : 20;
  try {
    if (req.userDetails.status === req.body.status) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info:
      decoded that the user is already ${req.body.status} in the DB. checkUserCurrentStatus.admin.middlewares.admin.js`);
      adminActivityTracking(req.admin.admin_id, activityType, 'fail');
      return ApiResponse.error(res, enums.USER_CURRENT_STATUS(req.body.status), enums.HTTP_BAD_REQUEST, enums.CHECK_USER_CURRENT_STATUS_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, activityType, 'fail');
    error.label = enums.CHECK_USER_CURRENT_STATUS_MIDDLEWARE;
    logger.error(`checking user status current status failed::${enums.CHECK_USER_CURRENT_STATUS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user exists in the DB based on user_id
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminUserMiddleware
 */
export const checkIfUserExists = async(req, res, next) => {
  try {
    const { params: { user_id } } = req;
    const [ userDetails ] = await UserService.getUserByUserId([ user_id ]);
    if (userDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
        successfully confirms that user being queried exists in the DB checkIfUserExists.admin.middlewares.user.js`);
      req.userDetails = userDetails;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
      successfully confirms that user being queried does not exists in the DB checkIfUserExists.admin.middlewares.user.js`);
    return ApiResponse.error(res, enums.ACCOUNT_NOT_EXIST('user'), enums.HTTP_BAD_REQUEST, enums.CHECK_IF_USER_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_USER_EXISTS_MIDDLEWARE;
    logger.error(`checking if queried user id exists in the DB failed::${enums.CHECK_IF_USER_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
