import dayjs from 'dayjs';
import AuthPayload from '../../lib/payloads/lib.payload.auth';
import * as AuthService from '../services/services.auth';
import * as UserService from '../services/services.user';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import config from '../../config';
import sendSMS from '../../config/sms';
import { signupSms } from '../../lib/templates/sms';
import { userActivityTracking } from '../../lib/monitor';

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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${registeredUser.user_id}:::Info: successfully registered user to the database controllers.auth.js`);
    const data = { ...registeredUser, otp, otpExpire: expirationTime };
    if(body.referral_code) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${registeredUser.user_id}:::Info: referral code is sent with signup payload controllers.auth.js`);
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${registeredUser.user_id}:::Info: successfully updated the referral trails controllers.auth.js`);
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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated new verification token into the DB controllers.auth.js`);
    const data = { user_id: user.user_id, otp, otpExpire: expirationTime };
    userActivityTracking(user.user_id, 6, 'success');
    await sendSMS(body.phone_number, signupSms(data));
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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully verified users account in the database controllers.auth.js`);
    const [ newUserDetails ] = await UserService.getUser(user.phone_number);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user updated details fetched from the database controllers.auth.js`);
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
/* Update user profile and password
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the users details
 * @memberof AuthController
 */
export const completeProfile = async(req, res, next) => {
  try {
    const { hashed, user, body } = req;
    const payload = AuthPayload.completeProfile(user, body, hashed);
    const [ data ] = await AuthService.completeUserProfile(payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully saved hashed password in the db controller.auth.js`);
    userActivityTracking(user.user_id, 7, 'success');
    return ApiResponse.success(res, enums.USER_PROFILE_COMPLETED, enums.HTTP_OK, data);
  } catch (error) {
    userActivityTracking(req.user.user_id, 7, 'fail');
    error.label = enums.COMPLETE_PROFILE_CONTROLLER;
    logger.error(`Creating user password failed::${enums.COMPLETE_PROFILE_CONTROLLER}`, error.message);
    return next(error);
  }
};
