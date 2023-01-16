import dayjs from 'dayjs';
import * as  UserService from '../services/services.user';
import * as AuthService from '../services/services.auth';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import * as Hash from '../../lib/utils/lib.util.hash';
import { userActivityTracking } from '../../lib/monitor';
import config from '../../config';
import MailService from '../services/services.email';
import UserPayload from '../../lib/payloads/lib.payload.user';

const { SEEDFI_NODE_ENV } = config;

/**
 * update user device fcm token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the users updated fcm token
 * @memberof UserController
 */
export const updateFcmToken = async (req, res, next) => {
  try {
    const {user, body} = req;
    await UserService.updateUserFcmToken([ user.user_id, body.fcm_token ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated user fcm token to the database updateFcmToken.controllers.user.js`);
    const data = {
      user_id: user.user_id,
      fcm_token: body.fcm_token
    };
    return ApiResponse.success(res, enums.USER_FCM_TOKEN_UPDATED, enums.HTTP_OK, data );
  } catch (error) {
    error.label = enums.UPDATE_USER_FCM_TOKEN_CONTROLLER;
    logger.error(`user token update failed::${enums.UPDATE_USER_FCM_TOKEN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * refresh user auth token using refresh token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the users details
 * @memberof UserController
 */
export const updateUserRefreshToken = async (req, res, next) => {
  try {
    const { tokenDetails: { token, refreshToken}, user } = req;
    const [ updatedUser ] = await AuthService.loginUserAccount([ user.user_id, refreshToken ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated new refresh token to the database updateUserRefreshToken.controllers.user.js`);
    const data = {
      ...updatedUser,
      token
    };
    return ApiResponse.success(res, enums.USER_REFRESH_TOKEN_UPDATED, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.UPDATE_USER_REFRESH_TOKEN_CONTROLLER;
    logger.error(`user token update failed::${enums.UPDATE_USER_REFRESH_TOKEN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update user selfie image
 * @param {String} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns a successful image upload response
 * @memberof UserController
 */
export const updateSelfieImage = async (req, res, next) => {
  try {
    const { user, body, otp } = req;
    const [ updateUserSelfie ] = await UserService.updateUserSelfieImage([ user.user_id, body.image_url.trim(), otp ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated user's selfie image and email verification token to the database updateSelfieImage.controllers.user.js`);
    MailService('Welcome to SeedFi 🎉', 'verifyEmail', { otp, ...user });
    userActivityTracking(user.user_id, 17, 'success');
    return ApiResponse.success(res, enums.USER_SELFIE_IMAGE_UPDATED_SUCCESSFULLY, enums.HTTP_OK, updateUserSelfie);
  } catch (error) {
    error.label = enums.UPDATE_SELFIE_IMAGE_CONTROLLER;
    logger.error(`updating user selfie image and email verification token in the DB failed::${enums.UPDATE_SELFIE_IMAGE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update user bvn
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the users details
 * @memberof UserController
 */
export const updateBvn = async (req, res, next) => {
  try {
    const { body: { bvn }, user } = req;
    const hashedBvn = encodeURIComponent(await Hash.encrypt(bvn.trim()));
    const [ updateBvn ] = await UserService.updateUserBvn([ user.user_id, hashedBvn ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated user's bvn and updating user tier to the database updateBvn.controllers.user.js`);
    userActivityTracking(user.user_id, 5, 'success');
    return ApiResponse.success(res, enums.USER_BVN_VERIFIED_SUCCESSFULLY, enums.HTTP_OK, updateBvn);
  } catch (error) {
    userActivityTracking(req.user.user_id, 5, 'fail');
    error.label = enums.UPDATE_BVN_CONTROLLER;
    logger.error(`updating user bvn after verification failed::${enums.UPDATE_BVN_CONTROLLER}`, error.message);
    return next(error);
  }
};


/**
 Request email verification
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response
 * @memberof AuthController
 */
export const requestEmailVerification = async(req, res, next) => {
  try {
    const { user, otp } = req;
    const expireAt = dayjs().add(10, 'minutes');
    const expirationTime = dayjs(expireAt);
    const payload = [ user.email, otp, expireAt ];
    await UserService.emailVerificationToken(payload);
    const data ={ user_id: user.user_id, otp, otpExpire: expirationTime };
    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.REQUEST_EMAIL_VERIFICATION, enums.HTTP_OK, data);
    }
    MailService('Verify your email', 'requestVerifyEmail', { otp, ...user });
    logger.info(`[${enums.CURRENT_TIME_STAMP}, ${user.user_id},
      Info: email verification has been sent successfully to user mail. requestEmailVerification.controller.auth.js`);
    return ApiResponse.success(res, enums.REQUEST_EMAIL_VERIFICATION, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.REQUEST_EMAIL_VERIFICATION_CONTROLLER;
    logger.error(`updating user email failed:::${enums.REQUEST_EMAIL_VERIFICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * Verify user email address
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response
 * @memberof UserController
 */
export const verifyEmail = async(req, res, next) => {
  try {
    const { user } = req;
    await UserService.verifyEmail([ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    User email address verified in the DB verifyEmail.controller.user.js`);
    userActivityTracking(req.user.user_id, 4, 'success');
    return SEEDFI_NODE_ENV === 'test' ? ApiResponse.success(res, enums.VERIFY_EMAIL, enums.HTTP_OK) : res.redirect(config.SEEDFI_VERIFY_EMAIL_MOBILE_REDIRECT_URL);
  } catch (error) {
    userActivityTracking(req.user.user_id, 4, 'fail');
    error.label = enums.VERIFY_EMAIL_CONTROLLER;
    logger.error(`verifying user email address in the DB failed:::${enums.VERIFY_EMAIL_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * user id verification
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response
 * @memberof UserController
 */
export const idVerification = async(req, res, next) => {
  try {
    const { user, body } = req; 
    const payload = UserPayload.imgVerification(user, body);
    await UserService.userIdVerification(payload);
    await UserService.updateIdVerification(user.user_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    user id verification uploaded successfully DB userImageVerification.controller.user.js`);
    userActivityTracking(req.user.user_id, 18, 'success');
    return ApiResponse.success(res, enums.ID_VERIFICATION, enums.HTTP_OK);
  } catch (error) {
    userActivityTracking(req.user.user_id, 18, 'fail');
    error.label = enums.ID_VERIFICATION_CONTROLLER;
    logger.error(`Id verification failed:::${enums.ID_VERIFICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};
