import * as  UserService from '../services/services.user';
import * as AuthService from '../services/services.auth';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';


export const updateFcmToken = async (req, res) => {
  try {
    const {user, body} = req;
    await UserService.updateUserFcmToken([user.user_id, body.fcm_token]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated user fcm token to the database signup.controllers.user.js`);
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

export const updateUserRefreshToken = async (req, res) => {
  try {
    const { tokenDetails: { token, refreshToken}, user } = req;
    const [updatedUser] = await AuthService.loginUserAccount([user.user_id, refreshToken]);
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
