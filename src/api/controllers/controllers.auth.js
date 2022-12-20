import dayjs from 'dayjs';
import AuthPayload from '../../lib/payloads/lib.payload.auth';
import * as AuthService from '../services/services.auth';
import * as UserService from '../services/services.user';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import config from '../../config';
import sendSMS from '../../config/sms';
import { signupSms, resendSignupOTPSms } from '../../lib/templates/sms';
import { userActivityTracking } from '../../lib/monitor';
import * as Hash from '../../lib/utils/lib.util.hash';
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
    const { body, otp } = req;
    const expireAt = dayjs().add(10, 'minutes');
    const expirationTime = dayjs(expireAt);
    const payload = AuthPayload.register(body, otp, expireAt);
    const [ registeredUser ] = await AuthService.registerUser(payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${registeredUser.user_id}:::Info: successfully registered user to the database signup.controllers.auth.js`);
    const data = { ...registeredUser, otp, otpExpire: expirationTime };
    if(body.referral_code) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${registeredUser.user_id}:::Info: referral code is sent with signup payload signup.controllers.auth.js`);
      req.registeredUser = registeredUser;
      req.expirationTime = expirationTime;
      return next();
    }
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
 * process the referral details if referral code is sent
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the users verification details
 * @memberof AuthController
 */
export const processReferral = async(req, res, next) => {
  try {
    const { body, otp, expirationTime, registeredUser, referringUserDetails } = req;
    const [ referralPreviouslyRecorded ] = await AuthService.checkIfReferralPreviouslyRecorded([ referringUserDetails.user_id, registeredUser.user_id ]);
    if (!referralPreviouslyRecorded) {
      await AuthService.updateReferralTrail([ referringUserDetails.user_id, registeredUser.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${registeredUser.user_id}:::Info: successfully updated the referral trails processReferral.controllers.auth.js`);
    }
    const data = { ...registeredUser, otp, otpExpire: expirationTime };
    userActivityTracking(registeredUser.user_id, 1, 'success');
    await sendSMS(body.phone_number, signupSms(data));
    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.ACCOUNT_CREATED, enums.HTTP_CREATED, data);
    }
    return ApiResponse.success(res, enums.ACCOUNT_CREATED, enums.HTTP_CREATED, data); // To still delete the OTP from being returned
  } catch (error) {
    error.label = enums.PROCESS_REFERRAL_CONTROLLER;
    logger.error(`Processing referral details failed::${enums.PROCESS_REFERRAL_CONTROLLER}`, error.message);
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
    const { body, otp, user } = req;
    const expireAt = dayjs().add(30, 'minutes');
    const expirationTime = dayjs(expireAt);
    const payload = AuthPayload.register(body, otp, expireAt);
    await AuthService.updateVerificationToken(payload);
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
      body, user, tokenDetails: { token, refreshToken, tokenExpireAt }, referralCode
    } = req;
    const payload = AuthPayload.verifyUserAccount(user, refreshToken, body, referralCode);
    await AuthService.verifyUserAccount(payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully verified users account in the database verifyAccount.controllers.auth.js`);
    const [ newUserDetails ] = await UserService.getUserByPhoneNumber(user.phone_number);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user updated details fetched from the database verifyAccount.controllers.auth.js`);
    const {
      // eslint-disable-next-line no-unused-vars
      password, pin, ...userData
    } = newUserDetails;
    userActivityTracking(user.user_id, 2, 'success');
    return ApiResponse.success(res, enums.USER_ACCOUNT_VERIFIED, enums.HTTP_OK, { ...userData, token, tokenExpireAt });
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
    const { user, tokenDetails: { token, refreshToken, tokenExpireAt } } = req;
    const [ loggedInUser ] = await AuthService.loginUserAccount([ user.user_id, refreshToken ]);
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
    const [ data ] = await AuthService.completeUserProfile(payload);
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
    const { user, otp } = req;
    const expireAt = dayjs().add(10, 'minutes');
    const expirationTime = dayjs(expireAt);
    const payload = [user.email, otp, expireAt];
    await AuthService.forgotPassword(payload);
    const data ={ user_id: user.user_id, otp, otpExpire: expirationTime };
    logger.info(`[${enums.CURRENT_TIME_STAMP}, ${user.user_id},
      Info: email for user to reset password has been sent successfully to users mail successfully forgotPassword.controller.auth.js`);
    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.PASSWORD_TOKEN, enums.HTTP_OK, data);
    }
    MailService('Reset your password', 'forgotPassword', { otp, ...user });
    userActivityTracking(req.user.user_id, 8, 'success');
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
    const { user, passwordToken} = req;
    logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info: 
    decoded that generated password token was successful resetPasswordToken.middlewares.auth.js`);
    return ApiResponse.success(res, enums.GENERATE_RESET_PASSWORD_TOKEN, enums.HTTP_OK, {passwordToken});
  } catch (error) {
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
 * @returns { JSON } - A JSON response containing user details
 * @memberof AuthController
 */
export const resetPassword = async(req, res, next) => {
  try {
    const { user, body } = req;
    const hash = Hash.hashData(body.password.trim());
    if(!user.is_verified_email){
      await AuthService.verifyUserEmail(user.user_id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
      user email successfully verified. resetPassword.controllers.auth.js`);
    }
    await AuthService.resetPassword([user.user_id, hash]);
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
