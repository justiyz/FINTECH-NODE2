import dayjs from 'dayjs';
import AuthPayload from '../../lib/payloads/lib.payload.auth';
import authQueries from '../queries/queries.auth';
import userQueries from '../queries/queries.user';
import { processAnyData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import config from '../../config';
import sendSMS from '../../config/sms';
import { signupSms, resendSignupOTPSms } from '../../lib/templates/sms';
import { userActivityTracking } from '../../lib/monitor';
import * as Hash from '../../lib/utils/lib.util.hash';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import MailService from '../services/services.email';

const { SEEDFI_NODE_ENV } = config;

/**
 * Send verification code to new users phone number before registration
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the users verification details
 * @memberof AuthController
 */
export const signup = async(req, res, next) => {
  try {
    const { body, referringUserDetails } = req;
    const otp =  Helpers.generateOtp();
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random OTP generated signup.controllers.auth.js`);
    const [ existingOtp ] = await processAnyData(authQueries.getUserByVerificationToken, [ otp ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if OTP is existing in the database signup.controllers.auth.js`);
    if (existingOtp) {
      signup(req, res, next);
    }
    const expireAt = dayjs().add(10, 'minutes');
    const expirationTime = dayjs(expireAt);
    const payload = AuthPayload.register(body, otp, expireAt);
    const [ registeredUser ] = await processAnyData(authQueries.registerUser, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${registeredUser.user_id}:::Info: successfully registered user to the database signup.controllers.auth.js`);
    if(body.referral_code) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${registeredUser.user_id}:::Info: referral code is sent with signup payload signup.controllers.auth.js`);
      const [ referralPreviouslyRecorded ] = await processAnyData(authQueries.checkIfReferralPreviouslyRecorded, [ referringUserDetails.user_id, registeredUser.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${registeredUser.user_id}:::Info: checked if referral has been previously recorded signup.controllers.auth.js`);
      if (!referralPreviouslyRecorded) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${registeredUser.user_id}:::Info: referral has not been previously recorded signup.controllers.auth.js`);
        await processAnyData(authQueries.updateReferralTrail, [ referringUserDetails.user_id, registeredUser.user_id ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${registeredUser.user_id}:::Info: successfully updated the referral trails signup.controllers.auth.js`);
      }
    }
    const data = { ...registeredUser, otp, otpExpire: expirationTime };
    userActivityTracking(registeredUser.user_id, 1, 'success');
    await sendSMS(body.phone_number, signupSms(data));
    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.ACCOUNT_CREATED, enums.HTTP_CREATED, data);
    }
    return ApiResponse.success(res, enums.ACCOUNT_CREATED, enums.HTTP_CREATED, data); // To still delete the OTP from being returned
  } catch (error) {
    error.label = enums.SIGNUP_CONTROLLER;
    logger.error(`User account creation failed::${enums.SIGNUP_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * Resend verification code to users phone number
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the users verification details
 * @memberof AuthController
 */
export const resendSignupOtp = async(req, res, next) => {
  try {
    const { body, user } = req;
    const otp = Helpers.generateOtp();
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random OTP generated resendSignupOtp.controllers.auth.js`);
    const [ existingOtp ] = await processAnyData(authQueries.getUserByVerificationToken, [ otp ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if OTP is existing in the database resendSignupOtp.controllers.auth.js`);
    if (existingOtp) {
      resendSignupOtp(req, res, next);
    }
    const expireAt = dayjs().add(30, 'minutes');
    const expirationTime = dayjs(expireAt);
    const payload = AuthPayload.register(body, otp, expireAt);
    await processAnyData(authQueries.updateVerificationToken, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated new verification token into the DB resendSignupOtp.controllers.auth.js`);
    const data = { user_id: user.user_id, otp, otpExpire: expirationTime };
    userActivityTracking(user.user_id, 6, 'success');
    await sendSMS(body.phone_number, resendSignupOTPSms(data));
    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.VERIFICATION_OTP_RESENT, enums.HTTP_CREATED, data);
    }
    return ApiResponse.success(res, enums.VERIFICATION_OTP_RESENT, enums.HTTP_CREATED, data); // To still delete the OTP from being returned
  } catch (error) {
    userActivityTracking(req.user.user_id, 6, 'fail');
    error.label = enums.RESEND_SIGNUP_OTP_CONTROLLER;
    logger.error(`User account creation failed::${enums.RESEND_SIGNUP_OTP_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
/* Verify signup phone number
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the users details
 * @memberof AuthController
 */
export const verifyAccount = async(req, res, next) => {
  try {
    const {
      body, user, referralCode
    } = req;
    const refreshToken = await Hash.generateRandomString(50);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully generated refresh token verifyAccount.controllers.auth.js`);
    const token = await Hash.generateAuthToken(user);
    logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info: successfully generated access token verifyAccount.controllers.auth.js`);
    const tokenExpiration = await JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).exp;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched token expiration time verifyAccount.controllers.auth.js`);
    const myDate = new Date(tokenExpiration * 1000);
    const tokenExpireAt = dayjs(myDate);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully converted time from epoch time to a readable format verifyAccount.controllers.auth.js`);
    const payload = AuthPayload.verifyUserAccount(user, refreshToken, body, referralCode);
    await processAnyData(authQueries.verifyUserAccount, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully verified users account in the database verifyAccount.controllers.auth.js`);
    const [ newUserDetails ] = await processAnyData(userQueries.getUserByPhoneNumber, [ user.phone_number ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user updated details fetched from the database verifyAccount.controllers.auth.js`);
    userActivityTracking(user.user_id, 2, 'success');
    return ApiResponse.success(res, enums.USER_ACCOUNT_VERIFIED, enums.HTTP_OK, { ...newUserDetails, refresh_toke: refreshToken, token, tokenExpireAt });
  } catch (error) {
    userActivityTracking(req.user.user_id, 2, 'fail');
    error.label = enums.VERIFY_ACCOUNT_CONTROLLER;
    logger.error(`Verifying user account failed::${enums.VERIFY_ACCOUNT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
/* login user account
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the users details
 * @memberof AuthController
 */
export const login = async(req, res, next) => {
  try {
    const { user } = req;
    const refreshToken = await Hash.generateRandomString(50);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully generated refresh token login.controllers.auth.js`);
    const token = await Hash.generateAuthToken(user);
    logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info: successfully generated access token login.controllers.auth.js`);
    const tokenExpiration = await JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).exp;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched token expiration time login.controllers.auth.js`);
    const myDate = new Date(tokenExpiration * 1000);
    const tokenExpireAt = dayjs(myDate);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully converted time from epoch time to a readable format login.controllers.auth.js`);
    const [ loggedInUser ] = await processAnyData(authQueries.loginUserAccount, [ user.user_id, refreshToken ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated user login login.controllers.auth.js`);
    userActivityTracking(user.user_id, 15, 'success');
    return ApiResponse.success(res, enums.USER_LOGIN_SUCCESSFULLY, enums.HTTP_OK, { ...loggedInUser, token, tokenExpireAt });
  } catch (error) {
    userActivityTracking(req.user.user_id, 15, 'fail');
    error.label = enums.LOGIN_CONTROLLER;
    logger.error(`Login user failed::${enums.LOGIN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
/* Update user profile and password
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the users details
 * @memberof AuthController
 */
export const completeProfile = async(req, res, next) => {
  try {
    const { user, body } = req;
    const hash = await Hash.hashData(body.password.trim());
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully hashed user password completeProfile.controllers.auth.js`);
    const payload = AuthPayload.completeProfile(user, body, hash);
    const [ data ] = await processAnyData(authQueries.completeUserProfile, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully saved hashed password in the db completeProfile.controllers.auth.js`);
    userActivityTracking(user.user_id, 7, 'success');
    return ApiResponse.success(res, enums.USER_PROFILE_COMPLETED, enums.HTTP_OK, data);
  } catch (error) {
    userActivityTracking(req.user.user_id, 7, 'fail');
    error.label = enums.COMPLETE_PROFILE_CONTROLLER;
    logger.error(`Creating user password failed::${enums.COMPLETE_PROFILE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
Forgot password
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response containing user details
 * @memberof AuthController
 */
export const forgotPassword = async(req, res, next) => {
  try {
    const { user } = req;
    const otp = Helpers.generateOtp();
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random OTP generated forgotPassword.controller.auth.js`);
    const [ existingOtp ] = await processAnyData(authQueries.getUserByVerificationToken, [ otp ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if OTP is existing in the database forgotPassword.controller.auth.js`);
    if (existingOtp) {
      forgotPassword(req, res, next);
    }
    const expireAt = dayjs().add(10, 'minutes');
    const expirationTime = dayjs(expireAt);
    const payload = [ user.email, otp, expireAt ];
    await processAnyData(authQueries.forgotPassword, payload);
    const data ={ user_id: user.user_id, otp, otpExpire: expirationTime };
    logger.info(`[${enums.CURRENT_TIME_STAMP}, ${user.user_id},
      Info: email for user to reset password has been sent successfully to users mail successfully forgotPassword.controller.auth.js`);
    userActivityTracking(req.user.user_id, 8, 'success');
    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.PASSWORD_TOKEN, enums.HTTP_OK, data);
    }
    MailService('Reset your password', 'forgotPassword', { otp, ...user });
    return ApiResponse.success(res, enums.PASSWORD_TOKEN, enums.HTTP_OK);
  } catch (error) {
    userActivityTracking(req.user.user_id, 8, 'fail');
    error.label = enums.FORGOT_PASSWORD_CONTROLLER;
    logger.error(`user forgot password request failed:::${enums.FORGOT_PASSWORD_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
Reset password token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response containing user details
 * @memberof AuthController
 */
export const resetPasswordToken = async(req, res, next) => {
  try {
    const { user } = req;
    const passwordToken = await Hash.generateResetPasswordToken(user);
    logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info: successfully generated password token resetPasswordToken.middlewares.auth.js`);
    const tokenExpiration = await JSON.parse(Buffer.from(passwordToken.split('.')[1], 'base64').toString()).exp;
    const myDate = new Date(tokenExpiration * 1000);
    const tokenExpireAt = dayjs(myDate);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched token expiration time and converted it resetPasswordToken.middlewares.auth.js`);
    userActivityTracking(req.user.user_id, 20, 'success');
    return ApiResponse.success(res, enums.GENERATE_RESET_PASSWORD_TOKEN, enums.HTTP_OK, { passwordToken, tokenExpireAt });
  } catch (error) {
    userActivityTracking(req.user.user_id, 20, 'fail');
    error.label = enums.RESET_PASSWORD_TOKEN_CONTROLLER;
    logger.error(`generating reset password token failed::${enums.RESET_PASSWORD_TOKEN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
Reset user password
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response
 * @memberof AuthController
 */
export const resetPassword = async(req, res, next) => {
  try {
    const { user, body } = req;
    const hash = Hash.hashData(body.password.trim());
    if(!user.is_verified_email){
      await processAnyData(authQueries.verifyUserEmail, [ user.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
      user email successfully verified. resetPassword.controllers.auth.js`);
    }
    await processAnyData(authQueries.resetPassword, [ user.user_id, hash ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    successfully reset user password in the db. resetPassword.controllers.auth.js`);
    userActivityTracking(req.user.user_id, 9, 'success');
    return ApiResponse.success(res, enums.PASSWORD_RESET, enums.HTTP_OK);
  } catch (error) {
    userActivityTracking(req.user.user_id, 9, 'fail');
    error.label = enums.RESET_PASSWORD_CONTROLLER;
    logger.error(`resetting user password failed:::${enums.RESET_PASSWORD_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
Change user password
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response
 * @memberof AuthController
 */
export const changePassword = async(req, res, next) => {
  try {
    const { user, body } = req;
    const hash = Hash.hashData(body.newPassword.trim());
    await processAnyData(authQueries.changePassword, [ user.user_id, hash ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    successfully changed user password in the db. changePassword.controllers.auth.js`);
    userActivityTracking(req.user.user_id, 10, 'success');
    return ApiResponse.success(res, enums.CHANGE_PASSWORD, enums.HTTP_OK);
  } catch (error) {
    userActivityTracking(req.user.user_id, 10, 'fail');
    error.label = enums.CHANGE_PASSWORD_CONTROLLER;
    logger.error(`changing password failed:::${enums.CHANGE_PASSWORD_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
Create transaction pin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response containing success message
 * @memberof AuthController
 */
export const createPin = async(req, res, next) => {
  try {
    const { user, body } = req;
    const hash = Hash.hashData(body.pin.trim());
    await processAnyData(authQueries.createPin, [ user.user_id, hash ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    successfully created user user pin in the db. createPin.controllers.auth.js`);
    userActivityTracking(req.user.user_id, 11, 'success');
    return ApiResponse.success(res, enums.CREATE_PIN, enums.HTTP_CREATED);
  } catch (error) {
    userActivityTracking(req.user.user_id, 11, 'fail');
    error.label = enums.CREATE_PIN_CONTROLLER;
    logger.error(`creating pin failed:::${enums.CREATE_PIN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
Change transaction pin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response containing success message
 * @memberof AuthController
 */
export const changePin = async(req, res, next) => {
  try {
    const { user, body } = req;
    const hash = Hash.hashData(body.newPin.trim());
    await processAnyData(authQueries.changePin, [ user.user_id, hash ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    successfully changed user pin in the db. changePin.controllers.auth.js`);
    userActivityTracking(req.user.user_id, 14, 'success');
    return ApiResponse.success(res, enums.CHANGE_PIN, enums.HTTP_OK);
  } catch (error) {
    userActivityTracking(req.user.user_id, 14, 'fail');
    error.label = enums.CHANGE_PIN_CONTROLLER;
    logger.error(`changing pin failed:::${enums.CHANGE_PIN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
Confirm user password
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response containing success message
 * @memberof AuthController
 */
export const confirmPassword = (req, res, next) => {
  try {
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Info: 
    successfully confirm user password in the db. confirmPassword.controllers.auth.js`);
    userActivityTracking(req.user.user_id, 30, 'success');
    const data = {
      user_id: req.user.user_id,
      passwordCorrect: true
    };
    return ApiResponse.success(res, enums.CONFIRM_CREDENTIALS('password'), enums.HTTP_OK, data);
  } catch (error) {
    userActivityTracking(req.user.user_id, 30, 'fail');
    error.label = enums.CONFIRM_PASSWORD_CONTROLLER;
    logger.error(`Confirm password failed:::${enums.CONFIRM_PASSWORD_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
Confirm user pin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response containing user details
 * @memberof AuthController
 */
export const confirmPin = async(req, res, next) => {
  try {
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Info: 
    successfully confirm user pin in the db. confirmPin.controllers.auth.js`);
    userActivityTracking(req.user.user_id, 31, 'success');
    const data = {
      user_id: req.user.user_id,
      pinCorrect: true
    };
    return ApiResponse.success(res, enums.CONFIRM_CREDENTIALS('pin'), enums.HTTP_OK, data);
  } catch (error) {
    userActivityTracking(req.user.user_id, 31, 'fail');
    error.label = enums.CONFIRM_PIN_CONTROLLER;
    logger.error(`Confirm pin failed:::${enums.CONFIRM_PIN_CONTROLLER}`, error.message);
    return next(error);
  }
};
