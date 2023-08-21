import dayjs from 'dayjs';
import authQueries from '../queries/queries.auth';
import userQueries from '../queries/queries.user';
import { processAnyData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import * as Hash from '../../lib/utils/lib.util.hash';
import { sendSms } from '../services/service.sms';
import { verifyAccountOTPSms } from '../../lib/templates/sms';
import { userActivityTracking } from '../../lib/monitor';
import config from '../../config';

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
    const [ existingReferralCode ] = await processAnyData(authQueries.checkIfExistingReferralCode, [ referralCode ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if referral code previously existed in the db generateReferralCode.middlewares.auth.js`);
    if (existingReferralCode) {
      return generateReferralCode(req, res, next);
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
    if (!body.referral_code) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: referral code is not part of signup payload checkIfReferralCodeExists.middlewares.auth.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: referral code is part of signup payload middlewares.auth.js`);
    const [ referringUserDetails ] = await processAnyData(authQueries.checkIfExistingReferralCode, [ body.referral_code.trim().toUpperCase() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if referral code previously existed in the db checkIfReferralCodeExists.middlewares.auth.js`);
    if (!referringUserDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully confirms that referral code does not belongs to an existing user 
      checkIfReferralCodeExists.middlewares.auth.js`);
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
 * verify validity and expiry of signup or new device login verification token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const verifyVerificationToken = async(req, res, next) => {
  try {
    const { body: { otp } } = req;
    const [ otpUser ] = await processAnyData(authQueries.getUserByVerificationToken, [ otp ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if correct OTP is sent verifyVerificationToken.middlewares.auth.js`);
    if (!otpUser) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: OTP is invalid verifyVerificationToken.middlewares.auth.js`);
      return ApiResponse.error(res, enums.INVALID('OTP code'), enums.HTTP_BAD_REQUEST, enums.VERIFY_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpUser.user_id}:::Info: OTP is valid verifyVerificationToken.middlewares.auth.js`);
    const isExpired = new Date().getTime() > new Date(otpUser.verification_token_expires).getTime();
    if (isExpired) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpUser.user_id}:::Info: successfully confirms that verification token has expired 
      verifyVerificationToken.middlewares.auth.js`);
      userActivityTracking(otpUser.user_id, 2, 'fail');
      return ApiResponse.error(res, enums.EXPIRED_VERIFICATION_TOKEN, enums.HTTP_FORBIDDEN, enums.VERIFY_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpUser.user_id}:::Info: successfully confirms that verification token is still active 
    verifyVerificationToken.middlewares.auth.js`);
    req.user = otpUser;
    return next();
  } catch (error) {
    error.label = enums.VERIFY_VERIFICATION_TOKEN_MIDDLEWARE;
    logger.error(`verify verification token failed::${enums.VERIFY_VERIFICATION_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user phone number(account) has not been previously verified
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const checkIfUserAccountNotVerified = async(req, res, next) => {
  try {
    const { user } = req;
    if (!user.is_verified_phone_number && user.referral_code === null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: confirms user account has not been previously verified checkIfUserAccountNotVerified.middlewares.auth.js`);
      return ApiResponse.error(res, enums.ACCOUNT_NOT_PREVIOUSLY_VERIFIED, enums.HTTP_FORBIDDEN, enums.CHECK_IF_USER_ACCOUNT_NOT_VERIFIED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: confirms user account has been previously verified checkIfUserAccountNotVerified.middlewares.auth.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_USER_ACCOUNT_NOT_VERIFIED_MIDDLEWARE;
    logger.error(`checking if user account has not been previously verified failed::${enums.CHECK_IF_USER_ACCOUNT_NOT_VERIFIED_MIDDLEWARE}`, error.message);
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
    let token = req.headers.authorization;
    if (!token) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that no authentication token was sent with the headers
      validateAuthToken.middlewares.auth.js`);
      return ApiResponse.error(res, enums.NO_TOKEN, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
    }
    if (!token.startsWith('Bearer ')) {
      return ApiResponse.error(res, enums.INVALID_TOKEN, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully extracts token validateAuthToken.middlewares.auth.js`);
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
    const [ user ] = await processAnyData(userQueries.getUserByUserId, [ decoded.user_id ]);
    const [ employmentDetails ] = await processAnyData(userQueries.fetchEmploymentDetails, [ user.user_id ]);
    const [ addressDetails ] = await processAnyData(userQueries.fetchUserAddressDetails, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.user_id}:::Info: successfully fetched the users details using the decoded id validateAuthToken.middlewares.auth.js`);
    if (!user) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that the user with the decoded id does not exist in the DB validateAuthToken.middlewares.auth.js`);
      return ApiResponse.error(res, enums.INVALID_TOKEN, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
    }
    if (user && (user.is_deleted || user.status === 'suspended' || user.status === 'deactivated')) {
      const userStatus = user.is_deleted ? 'deleted, kindly contact support team'  : `${user.status}, kindly contact support team`;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${decoded.user_id}:::Info: successfully confirms that user account is ${userStatus} in the database 
      validateAuthToken.middlewares.auth.js`);
      return ApiResponse.error(res, enums.USER_ACCOUNT_STATUS(userStatus), enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
    }
    req.userEmploymentDetails = employmentDetails;
    req.userAddressDetails = addressDetails;
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has been previously completed their kyc 
      isCompletedKyc.middlewares.auth.js`);
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
*  @param {String} type - The type request from the endpoint.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const isPasswordCreated = (type = '') => async(req, res, next) => {
  try {
    const { user } = req;
    if (!user.is_created_password && type === 'confirm') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: decoded that user have not created password in the DB. isPasswordCreated.middlewares.auth.js`);
      return ApiResponse.error(res, enums.USER_CREDENTIALS('password'), enums.HTTP_BAD_REQUEST, enums.IS_PASSWORD_CREATED_MIDDLEWARE);
    }
    if (user.is_created_password && type === 'validate') {
      userActivityTracking(user.user_id, 7, 'fail');
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has previously created password 
      isPasswordCreated.middlewares.auth.js`);
      return ApiResponse.error(res, enums.ALREADY_CREATED('password'), enums.HTTP_FORBIDDEN, enums.IS_PASSWORD_CREATED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has not previously created password 
    isPasswordCreated.middlewares.auth.js`);
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
    const [ emailUser ] = await processAnyData(userQueries.getUserByEmail, [ body.email.trim().toLowerCase() ]);
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
    const [ userPasswordDetails ] = await processAnyData(authQueries.fetchUserPassword, [ user.user_id ]);
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
 * compare device token in the database with the current device token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const compareDeviceToken = async(req, res, next) => {
  try {
    const { user, query: { type } } = req;
    if (type === 'web') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user login is being processed from the web compareDeviceToken.middlewares.auth.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user login is being processed from the mobile app compareDeviceToken.middlewares.auth.js`);
    if (!req.body.device_token) {
      return ApiResponse.error(res, enums.DEVICE_TOKEN_REQUIRED, enums.HTTP_BAD_REQUEST, enums.COMPARE_DEVICE_TOKEN_MIDDLEWARE);
    }
    if (config.SEEDFI_NEW_DEVICE_LOGIN_WAVER_USERS.trim().toLowerCase().includes(user.email.trim().toLowerCase())) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user device token does not match but user account was exempted 
      compareDeviceToken.middlewares.auth.js`);
      return next();
    }
    if (req.body.device_token.trim() !== user.device_token) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user device token does not match compareDeviceToken.middlewares.auth.js`);
      const otp =  Helpers.generateOtp();
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random OTP generated compareDeviceToken.middlewares.auth.jss`);
      const [ existingOtp ] = await processAnyData(authQueries.getUserByVerificationToken, [ otp ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if OTP is existing in the database compareDeviceToken.middlewares.auth.js`);
      if (existingOtp) {
        return compareDeviceToken(req, res, next);
      }
      const expireAt = dayjs().add(10, 'minutes');
      const expirationTime = dayjs(expireAt);
      await processAnyData(authQueries.updateVerificationToken, [ user.phone_number, otp, expireAt ]);
      const data = { otp, otpDuration: `${10} minutes` };
      await sendSms(user.phone_number, verifyAccountOTPSms(data));
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: New token successfully sent to user registered phone number compareDeviceToken.middlewares.auth.js`);
      if (config.SEEDFI_NODE_ENV === 'test' || config.SEEDFI_NODE_ENV === 'development') {
        return ApiResponse.success(res, enums.NEW_DEVICE_DETECTED, enums.HTTP_OK, { otp, expirationTime });
      }
      return ApiResponse.success(res, enums.NEW_DEVICE_DETECTED, enums.HTTP_OK);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user device token matches compareDeviceToken.middlewares.auth.js`);
    return next();
  } catch (error) {
    error.label = enums.COMPARE_DEVICE_TOKEN_MIDDLEWARE;
    logger.error(`Comparing user compare device token failed::${enums.COMPARE_DEVICE_TOKEN_MIDDLEWARE}`, error.message);
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
export const validateForgotPasswordAndPinToken = async(req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that no authentication token was sent with the headers
      validateForgotPasswordAndPinToken.middlewares.auth.js`);
      return ApiResponse.error(res, enums.NO_TOKEN, enums.HTTP_UNAUTHORIZED, enums.GET_AUTH_TOKEN_MIDDLEWARE);
    }
    if (!token.startsWith('Bearer ')) {
      return ApiResponse.error(res, enums.INVALID_TOKEN, enums.HTTP_UNAUTHORIZED, enums.GET_AUTH_TOKEN_MIDDLEWARE);
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully extracts token validateForgotPasswordAndPinToken.middlewares.auth.js`);
    const decoded = Hash.decodeToken(token);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded authentication token sent using the authentication secret
    validateForgotPasswordAndPinToken.middlewares.auth.js`);
    if (decoded.message) {
      if (decoded.message === 'jwt expired') {
        return ApiResponse.error(res, enums.SESSION_EXPIRED, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded authentication token has a message which is an 
      error message validateForgotPasswordAndPinToken.middlewares.auth.js`);
      return ApiResponse.error(res, decoded.message, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
    }
    if (decoded.email) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded authentication token sent using the authentication secret
      validateForgotPasswordAndPinToken.middlewares.auth.js`);
      const [ user ] = await processAnyData(userQueries.getUserByEmail, [ decoded.email ]);
      req.user = user;
      return next();
    }
  } catch (error) {
    error.label = enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE;
    logger.error(`validating authentication token failed:::${enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * Check if new password/pin is same as current
 * @param {Request} type - The request from the endpoint.
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const checkIfNewCredentialsSameAsOld = (type = '') => async(req, res, next) => {
  try {
    const { 
      body: { newPassword, newPin }, user } = req;
    const [ userPasswordDetails ] = type == 'pin' ?  await processAnyData(authQueries.fetchUserPin, [ user.user_id ]) : 
      await processAnyData(authQueries.fetchUserPassword, [ user.user_id ]);
    const isValidCredentials = type == 'pin' ? Hash.compareData(newPin, userPasswordDetails.pin) : Hash.compareData(newPassword, userPasswordDetails.password);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully returned compared user response checkIfNewCredentialsSameAsOld.middlewares.auth.js`);
    if (isValidCredentials) {   
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
      decoded that new ${type} matches with old ${type}. checkIfNewCredentialsSameAsOld.middlewares.auth.js`);
      return ApiResponse.error(res, enums.IS_VALID_CREDENTIALS(`${type}`), enums.HTTP_BAD_REQUEST, enums.CHECK_IF__NEW_CREDENTIALS_IS_SAME_AS_OLD_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    confirms that users new ${type} pin is not the same as the currently set ${type} checkIfNewCredentialsSameAsOld.middlewares.auth.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF__NEW_CREDENTIALS_IS_SAME_AS_OLD_MIDDLEWARE;
    logger.error(`Checking if password/pin sent matches in the DB failed:::${enums.CHECK_IF__NEW_CREDENTIALS_IS_SAME_AS_OLD_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if pin sent matches user's pin in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const comparePin = async(req, res, next) => {
  try {
    const { 
      body: { pin }, user } = req;
    const [ userPin ] = await processAnyData(authQueries.fetchUserPin, [ user.user_id ]);
    const isPinValid = Hash.compareData(pin, userPin.pin);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully returned compared pin response comparePin.middlewares.auth.js`);
    if (isPinValid) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user pin matches comparePin.middlewares.auth.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: pin does not match comparePin.middlewares.auth.js`);
    return ApiResponse.error(res, enums.INVALID_PIN, enums.HTTP_BAD_REQUEST, enums.COMPARE_PIN_MIDDLEWARE);
  } catch (error) {
    error.label = enums.COMPARE_PIN_MIDDLEWARE;
    logger.error(`comparing incoming and already set pin in the DB failed:::${enums.COMPARE_PIN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if pin sent matches user's pin in the DB
 * @param {Request} type - The request from the endpoint.
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const isPinCreated = (type = '') => async(req, res, next) => {
  try {
    const { user } = req;
    if (!user.is_created_pin && type == 'confirm') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: decoded that user have not created pin in the DB. isPinCreated.middlewares.auth.js`);
      userActivityTracking(user.user_id, 11, 'fail');
      return ApiResponse.error(res, enums.USER_CREDENTIALS('pin'), enums.HTTP_BAD_REQUEST, enums.IS_PIN_CREATED_MIDDLEWARE);
    }
    if (user.is_created_pin && type === 'validate') {
      userActivityTracking(req.user.user_id, 11, 'fail');
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has previously created pin isPinCreated.middlewares.auth.js`);
      return ApiResponse.error(res, enums.ALREADY_CREATED('pin'), enums.HTTP_FORBIDDEN, enums.IS_PIN_CREATED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has not previously created pin isPinCreated.middlewares.auth.js`);
    return next();
  } catch (error) {
    error.label = enums.IS_PIN_CREATED_MIDDLEWARE;
    logger.error(`checking if user already created pin  failed::${enums.IS_PIN_CREATED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * validate password/pin pin in the DB
 * @param {Request} type - The request from the endpoint.
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AuthMiddleware
 */
export const validatePasswordOrPin = (type = '') => async(req, res, next) => {
  try {
    const { 
      body, user } = req;
    const condition = body.oldPin || body.oldPassword;
    const [ credentials ] = type == 'pin' ? await processAnyData(authQueries.fetchUserPin, [ user.user_id ]) : 
      await processAnyData(authQueries.fetchUserPassword, [ user.user_id ]);
    const isValidCredentials = type == 'pin' ? Hash.compareData(condition, credentials.pin) : Hash.compareData(condition, credentials.password);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully returned compared password/pin in the DB validatePasswordOrPin.middlewares.auth.js`);
    if (isValidCredentials) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully validate password/pin in the DB validatePasswordOrPin.middlewares.auth.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: password/pin does not match in the DB validatePasswordOrPin.middlewares.auth.js`);
    return ApiResponse.error(res, enums.VALIDATE_PASSWORD_OR_PIN(`${type}`), enums.HTTP_BAD_REQUEST, enums.VALIDATE_PASSWORD_OR_PIN_MIDDLEWARE);
  } catch (error) {
    error.label = enums.VALIDATE_PASSWORD_OR_PIN_MIDDLEWARE;
    logger.error(`validate password/pin in the DB failed:::${enums.VALIDATE_PASSWORD_OR_PIN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
