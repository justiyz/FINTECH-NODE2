import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import config from '../../../users/config/index';
import { updateAdminNotificationReadBoolean, fetchAndUpdateNotification } from '../services/services.firebase';



/**
 * update and mark as read for single notification
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON successful response
 * @memberof NotificationController
 */
export const updateSingleNotification = async(req, res, next) => {
  try {
    const { user, params } = req;
    if (config.SEEDFI_NODE_ENV === 'test') {
      return  ApiResponse.success(res, enums.NOTIFICATION_UPDATED_SUCCESSFULLY, enums.HTTP_OK);
    }
    await updateAdminNotificationReadBoolean(user, params);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: successfully updated notification read status updateNotificationIsRead.controller.admin.admin.js`);
    return ApiResponse.success(res, enums.NOTIFICATION_UPDATED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_SINGLE_NOTIFICATION_CONTROLLER;
    logger.error(`updating admin existing notification read status failed:::${enums.UPDATE_SINGLE_NOTIFICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * updating all notifications as read
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON successful response
 * @memberof NotificationController
 */
export const updateAllNotificationsAsRead = async(req, res, next) => {
  try {
    if (config.SEEDFI_NODE_ENV === 'test') {
      return  ApiResponse.success(res, enums.NOTIFICATION_UPDATED_SUCCESSFULLY, enums.HTTP_OK);
    }
    await fetchAndUpdateNotification(req.admin.admin_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: successfully updated notification read status updateNotificationIsRead.controller.admin.admin.js`);
    return ApiResponse.success(res, enums.NOTIFICATION_UPDATED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_ALL_NOTIFICATIONS_AS_READ_CONTROLLER;
    logger.error(`updating all notifications as read failed:::${enums.UPDATE_ALL_NOTIFICATIONS_AS_READ_CONTROLLER}`, error.message);
    return next(error);
  }
};
