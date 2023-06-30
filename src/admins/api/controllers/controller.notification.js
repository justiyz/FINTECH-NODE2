import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import notificationQueries from '../queries/queries.settings';
import usersQueries from '../queries/queries.user';
import  notificationPayload from '../../lib/payloads/lib.payload.settings';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import { updateAdminNotificationReadBoolean, fetchAndUpdateNotification, sendPushNotification, sendUserPersonalNotification } from '../services/services.firebase';



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
    const { admin, params } = req;
    await updateAdminNotificationReadBoolean(admin, params);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: successfully updated notification read status updateNotificationIsRead.admin.controller.notification.js`);
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
    await fetchAndUpdateNotification(req.admin.admin_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: successfully updated notification read status updateNotificationIsRead.admin.controller.notification.js`);
    return ApiResponse.success(res, enums.NOTIFICATION_UPDATED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_ALL_NOTIFICATIONS_AS_READ_CONTROLLER;
    logger.error(`updating all notifications as read failed:::${enums.UPDATE_ALL_NOTIFICATIONS_AS_READ_CONTROLLER}`, error.message);
    return next(error);
  }
};

/** 
 * sending users notification
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON successful response
 * @memberof NotificationController
 */
export const sendNotifications = async(req, res, next) => {
  try {
    const { body } = req;
    const users = await processAnyData(usersQueries.getUsersForNotifications, []);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: Successfully fetched users for notification in sendNotifications.admin.controller.notification.js`);
    const payload =  notificationPayload.sendUserNotification(req.admin, body);
    const notifyUsers = await processOneOrNoneData(notificationQueries.sendNotification, payload);
    
    if (body.recipient === 'all') {
      users.forEach((user) => {
        sendPushNotification(user.user_id, body.content, user.fcm_token);
      });
      
      return ApiResponse.success(res, enums.SUCCESSFULLY_NOTIFICATION, enums.HTTP_OK, notifyUsers);
    }
    
    body.sent_to.forEach((user) => {
      sendUserPersonalNotification(user, body.title, body.content, 'admin-sent-notification');
    });
    
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: Users notification sent successfully in sendNotifications.admin.controller.notification.js`);
    return ApiResponse.success(res, enums.SUCCESSFULLY_NOTIFICATION, enums.HTTP_OK, notifyUsers);
  } catch (error) {
    error.label = enums.SEND_USERS_NOTIFICATIONS_CONTROLLER;
    logger.error(`Sending users notification failed:::${enums.SEND_USERS_NOTIFICATIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};
