import AuthPayload from '../../lib/payloads/lib.payload.user';
import * as  UserService from '../services/services.user';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';


export const updateFcmToken = async (req, res) => {
  try {
    const {user, body} = req;
    const payload = AuthPayload.updateUserFcmToken(user, body);
    UserService.updateUserFcmToken(payload);
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
