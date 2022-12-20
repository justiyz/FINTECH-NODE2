import * as  UserService from '../services/services.user';
import * as AuthService from '../services/services.auth';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import * as Hash from '../../lib/utils/lib.util.hash';
import { userActivityTracking } from '../../lib/monitor';

/**
 * update user device fcm token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @returns { JSON } - A JSON with the users updated fcm token
 * @memberof UserController
 */
export const updateFcmToken = async (req, res) => {
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
    return (error);
  }
};

/**
 * refresh user auth token using refresh token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @returns { JSON } - A JSON response with the users details
 * @memberof UserController
 */
export const updateUserRefreshToken = async (req, res) => {
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
    return (error);
  }
};

/**
 * update user bvn
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @returns { JSON } - A JSON response with the users details
 * @memberof UserController
 */
export const updateBvn = async (req, res) => {
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
    return (error);
  }
};
