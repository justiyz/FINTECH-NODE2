import dayjs from 'dayjs';
import * as AuthService from '../services/services.auth';
import * as UserService from '../services/services.user';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import * as Hash from '../../lib/utils/lib.util.hash';
import { userActivityTracking } from '../../lib/monitor';

/**
 * generate phone number verification token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const generateVerificationToken = async(req, res, next) => {
  try {
    const otp = Helpers.generateOtp();
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random OTP generated generateVerificationToken.middlewares.auth.js`);
    const [ existingOtp ] = await AuthService.getUserByVerificationToken(otp);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if OTP is existing in the database generateVerificationToken.middlewares.auth.js`);
    if (existingOtp) {
      generateVerificationToken(req, res, next);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully generates unique random OTP generateVerificationToken.middlewares.auth.js`);
    req.otp = otp;
    return next();
  } catch (error) {
    error.label = enums.GENERATE_VERIFICATION_TOKEN_MIDDLEWARE;
    logger.error(`generating verification OTP and encoding failed::${enums.GENERATE_VERIFICATION_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * generate user referral code
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const generateReferralCode = async(req, res, next) => {
  try {
    const referralCode = await Helpers.generateReferralCode(5);
    const [ existingReferralCode ] = await AuthService.checkIfExistingReferralCode([ referralCode ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if referral code previously existed in the db generateReferralCode.middlewares.auth.js`);
    if (existingReferralCode) {
      generateReferralCode(req, res, next);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully generated user referral code generateReferralCode.middlewares.auth.js`);
    req.referralCode = referralCode;
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 2, 'fail');
    error.label = enums.GENERATE_REFERRAL_CODE_MIDDLEWARE;
    logger.error(`generating referral code for user failed::${enums.GENERATE_REFERRAL_CODE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if signup referral code exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const checkIfReferralCodeExists = async(req, res, next) => {
  try {
    const { body } = req;
    if(!body.referral_code) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: referral code is not part of signup payload checkIfReferralCodeExists.middlewares.auth.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: referral code is part of signup payload middlewares.auth.js`);
    const [ referringUserDetails ] = await AuthService.checkIfExistingReferralCode([ body.referral_code.trim() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if referral code previously existed in the db checkIfReferralCodeExists.middlewares.auth.js`);
    if (!referringUserDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully confirms that referral code does not belongs to an existing user checkIfReferralCodeExists.middlewares.auth.js`);
      return ApiResponse.error(res, enums.INVALID('referral code'), enums.HTTP_BAD_REQUEST, enums.CHECK_IF_REFERRAL_CODE_EXISTS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully confirms that referral code belongs to an existing user checkIfReferralCodeExists.middlewares.auth.js`);
    req.referringUserDetails = referringUserDetails;
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_REFERRAL_CODE_EXISTS_MIDDLEWARE;
    logger.error(`confirming existence of referral code failed::${enums.CHECK_IF_REFERRAL_CODE_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * verify validity and expiry of signup verification token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const verifyVerificationToken = async(req, res, next) => {
  try {
    const { body: { otp } } = req;
    const [ otpUser ] = await AuthService.getUserByVerificationToken(otp);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if correct OTP is sent verifyVerificationToken.middlewares.auth.js`);
    if (!otpUser) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: OTP is invalid verifyVerificationToken.middlewares.auth.js`);
      return ApiResponse.error(res, enums.INVALID('OTP code'), enums.HTTP_BAD_REQUEST, enums.VERIFY_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpUser.user_id}:::Info: OTP is valid verifyVerificationToken.middlewares.auth.js`);
    const isExpired = new Date().getTime() > new Date(otpUser.verification_token_expires).getTime();
    if (isExpired) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpUser.user_id}:::Info: successfully confirms that verification token has expired verifyVerificationToken.middlewares.auth.js`);
      userActivityTracking(otpUser.user_id, 2, 'fail');
      return ApiResponse.error(res, enums.EXPIRED_VERIFICATION_TOKEN, enums.HTTP_FORBIDDEN, enums.VERIFY_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpUser.user_id}:::Info: successfully confirms that verification token is still active verifyVerificationToken.middlewares.auth.js`);
    req.user = otpUser;
    return next();
  } catch (error) {
    error.label = enums.VERIFY_VERIFICATION_TOKEN_MIDDLEWARE;
    logger.error(`verify verification token failed::${enums.VERIFY_VERIFICATION_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * generate authentication token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const generateTokens = async(req, res, next) => {
  try {
    const { user } = req;
    const token = await Hash.generateAuthToken(user);
    logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info: successfully generated access token generateTokens.middlewares.auth.js`);
    const refreshToken = await Hash.generateRandomString(50);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully generated refresh token generateTokens.middlewares.auth.js`);
    const tokenExpiration = await JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).exp;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched token expiration time generateTokens.middlewares.auth.js`);
    const myDate = new Date(tokenExpiration * 1000);
    const tokenExpireAt = dayjs(myDate);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully converted time from epoch time to a readable format generateTokens.middlewares.auth.js`);
    req.tokenDetails = { token, refreshToken, tokenExpireAt };
    return next();
  } catch (error) {
    error.label = enums.GENERATE_TOKENS_MIDDLEWARE;
    logger.error(`generating auth token for user failed::${enums.GENERATE_TOKENS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * Get auth token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON object containing the user auth token
 * @memberof AuthMiddleware
 */
export const getAuthToken = async(req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that no authentication token was sent with the headers
      getAuthToken.middlewares.auth.js`);
      return ApiResponse.error(res, enums.NO_TOKEN, enums.HTTP_UNAUTHORIZED, enums.GET_AUTH_TOKEN_MIDDLEWARE);
    }
    if (!token.startsWith('Bearer ')) {
      return ApiResponse.error(res, enums.INVALID_TOKEN, enums.HTTP_UNAUTHORIZED, enums.GET_AUTH_TOKEN_MIDDLEWARE);
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully extracts token getAuthToken.middlewares.auth.js`);
    req.token = token;
    return next();
  } catch (error) {
    error.label = enums.GET_AUTH_TOKEN_MIDDLEWARE;
    logger.error(`confirming request header status if authentication token was sent along failed:::${enums.GET_AUTH_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * Validate auth token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the validated user's details
 * @memberof AuthMiddleware
 */
export const validateAuthToken = async(req, res, next) => {
  try {
    const { token } = req;
    const decoded = Hash.decodeToken(token);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.user_id}:::Info: successfully decoded authentication token sent using the authentication secret
    validateAuthToken.middlewares.auth.js`);
    if (decoded.message) {
      if (decoded.message === 'jwt expired') {
        return ApiResponse.error(res, enums.SESSION_EXPIRED, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.user_id}:::Info: successfully decoded authentication token has a message which is an 
      error message validateAuthToken.middlewares.auth.js`);
      return ApiResponse.error(res, decoded.message, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
    }
    const [ user ] = await UserService.getUserByUserId(decoded.user_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.user_id}:::Info: successfully fetched the users details using the decoded id validateAuthToken.middlewares.auth.js`);
    if (!user) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that the user with the decoded id does not exist in the DB validateAuthToken.middlewares.auth.js`);
      return ApiResponse.error(res, enums.INVALID_TOKEN, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
    }
    if (user && (user.is_deleted || user.status === 'suspended' || user.status === 'deactivated')) {
      // eslint-disable-next-line no-nested-ternary
      const userStatus = user.is_deleted ? 'deleted, kindly contact support team'  : `${user.status}, kindly contact support team`;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.user_id}:::Info: successfully confirms that user account is ${userStatus} in the database validateAuthToken.middlewares.auth.js`);
      return ApiResponse.error(res, enums.USER_ACCOUNT_STATUS(userStatus), enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
    }
    req.user = user;
    return next();
  } catch (error) {
    error.label = enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE;
    logger.error(`validating authentication token failed:::${enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user kyc has been previously completed
 * @param {string} type - a type to know which of the response to return
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const isCompletedKyc = (type = '') => async(req, res, next) => {
  try {
    const { user } = req;
    if (user.is_completed_kyc && type === 'complete') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has been previously completed their kyc isCompletedKyc.middlewares.auth.js`);
      userActivityTracking(user.user_id, 7, 'fail');
      return ApiResponse.error(res, enums.KYC_PREVIOUSLY_COMPLETED, enums.HTTP_FORBIDDEN, enums.IS_COMPLETED_KYC_MIDDLEWARE);
    }
    if (!user.is_completed_kyc && type === 'confirm') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has not completed their kyc isCompletedKyc.middlewares.auth.js`);
      return ApiResponse.error(res, enums.KYC_NOT_PREVIOUSLY_COMPLETED, enums.HTTP_FORBIDDEN, enums.IS_COMPLETED_KYC_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 7, 'fail');
    error.label = enums.IS_COMPLETED_KYC_MIDDLEWARE;
    logger.error(`checking if user has completed their kyc failed::${enums.IS_COMPLETED_KYC_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user has previously created password
*  @param {String} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const isPasswordCreated = async(req, res, next) => {
  try {
    const { user } = req;
    if (user.is_created_password) {
      userActivityTracking(user.user_id, 7, 'fail');
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has previously created password isPasswordCreated.middlewares.auth.js`);
      return ApiResponse.error(res, enums.ALREADY_CREATED('password'), enums.HTTP_FORBIDDEN, enums.IS_PASSWORD_OR_PIN_CREATED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has not previously created password isPasswordCreated.middlewares.auth.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 7, 'fail');
    error.label = enums.IS_PASSWORD_CREATED_MIDDLEWARE;
    logger.error(`checking if user already created password failed::${enums.IS_PASSWORD_CREATED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if email being sent previously exists in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const checkIfEmailAlreadyExist = async(req, res, next) => {
  try {
    const { user, body } = req;
    const [ emailUser ] = await UserService.getUserByEmail(body.email.trim().toLowerCase());
    if (!emailUser) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user's email is not existing in 
      the database checkIfEmailAlreadyExist.middlewares.auth.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user's email is existing in the database 
    checkIfEmailAlreadyExist.middlewares.auth.js`);
    userActivityTracking(user.user_id, 7, 'fail');
    return ApiResponse.error(res, enums.USER_EMAIL_EXIST, enums.HTTP_CONFLICT, enums.CHECK_IF_EMAIL_ALREADY_EXIST_MIDDLEWARE);
  } catch (error) {
    userActivityTracking(req.user.user_id, 7, 'fail');
    error.label = enums.CHECK_IF_EMAIL_ALREADY_EXIST_MIDDLEWARE;
    logger.error(`checking if user email is not already existing failed::${enums.CHECK_IF_EMAIL_ALREADY_EXIST_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if password sent matches user's password in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const comparePassword = async(req, res, next) => {
  try {
    const {
      body: { password }, user
    } = req;
    const [ userPasswordDetails ] = await AuthService.fetchUserPassword([ user.user_id ]);
    const passwordValid = await Hash.compareData(password, userPasswordDetails.password);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully returned compared passwords response comparePassword.middlewares.auth.js`);
    if (passwordValid) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: login password matches comparePassword.middlewares.auth.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: login password does not match comparePassword.middlewares.auth.js`);
    return ApiResponse.error(res, enums.INVALID_PASSWORD, enums.HTTP_BAD_REQUEST, enums.COMPARE_PASSWORD_MIDDLEWARE);
  } catch (error) {
    error.label = enums.COMPARE_PASSWORD_MIDDLEWARE;
    logger.error(`comparing incoming and already set password in the DB failed:::${enums.COMPARE_PASSWORD_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * Generate jwt password token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const generateResetPasswordToken = async(req, res, next) => {
  try {
    const { user } = req;
    const token = await Hash.generateResetPasswordToken(user);
    logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info: 
    successfully generated password token generateResetPasswordToken.middlewares.auth.js`);
    req.passwordToken = token;
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 20, 'fail');
    error.label = enums.GENERATE_RESET_PASSWORD_TOKEN_MIDDLEWARE;
    logger.error(`generating reset password token failed::${enums.GENERATE_RESET_PASSWORD_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * validate forgot password token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const validateForgotPasswordToken = async(req, res, next) => {
  try {
    const { token } = req;
    const decoded = Hash.decodeToken(token);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.user_id}:::Info: successfully decoded authentication token sent using the authentication secret
    validateForgotPasswordToken.middlewares.auth.js`);
    if (decoded.message) {
      if (decoded.message === 'jwt expired') {
        return ApiResponse.error(res, enums.SESSION_EXPIRED, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.user_id}:::Info: successfully decoded authentication token has a message which is an 
      error message validateForgotPasswordToken.middlewares.auth.js`);
      return ApiResponse.error(res, decoded.message, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
    }
    if(decoded.email){
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.user_id}:::Info: successfully decoded authentication token sent using the authentication secret
      validateForgotPasswordToken.middlewares.auth.js`);
      const [ user ] = await UserService.getUserByEmail(decoded.email);
      req.user = user;
      return next();
    }
  } catch (error) {
    error.label = enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE;
    logger.error(`validating authentication token failed:::${enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
