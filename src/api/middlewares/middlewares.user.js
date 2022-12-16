import * as UserService from '../services/services.user';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';

/**
 * Fetch user details from the database
 * @param {string} type - a type to know which of the response to return
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const validateUnAuthenticatedUser = (type = '') => async(req, res, next) => {
  try {
    const { body } = req;
    const payload = body.phone_number || body.email || req.user.phone_number;
    const [ user ] = payload.startsWith('+') ? await UserService.getUserByPhoneNumber([ payload.trim() ]) : await UserService.getUserByEmail([ payload.trim().toLowerCase() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully fetched users details from the database validateUnAuthenticatedUser.middlewares.user.js`);
    if (user && user.is_verified_phone_number && user.is_created_password && type === 'validate') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user account already exists in
        the database validateUnAuthenticatedUser.middlewares.user.js`);
      return ApiResponse.error(res, enums.ACCOUNT_EXIST, enums.HTTP_BAD_REQUEST, enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE);
    }
    if (user && user.is_verified_phone_number && user.is_created_password && type === 'authenticate') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user account already exists in
        the database validateUnAuthenticatedUser.middlewares.user.js`);
      return ApiResponse.error(res, enums.ACCOUNT_ALREADY_VERIFIED, enums.HTTP_BAD_REQUEST, enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE);
    }
    if (!user && type === 'authenticate') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully confirms that user account does not exists in
        the database validateUnAuthenticatedUser.middlewares.user.js`);
      return ApiResponse.error(res, enums.ACCOUNT_NOT_EXIST, enums.HTTP_BAD_REQUEST, enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE);
    }
    if (!user && type === 'login') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: confirms that user's email is not existing in the database validateUnAuthenticatedUser.middlewares.user.js`);
      return ApiResponse.error(res, enums.INVALID_EMAIL_ADDRESS, enums.HTTP_BAD_REQUEST, enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE);
    }
    if (user && type === 'login' && (user.status !== 'active' || user.is_deleted )) {
      // eslint-disable-next-line no-nested-ternary
      const userStatus = user.is_deleted ? 'deleted, kindly contact support team'  : `${user.status}, kindly contact support team`;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user account is ${userStatus} in the database validateUnAuthenticatedUser.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_ACCOUNT_STATUS(userStatus), enums.HTTP_UNAUTHORIZED, enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE);
    }
    req.user = user;
    return next();
  } catch (error) {
    error.label = enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE;
    logger.error(`getting user details from the database failed::${enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
