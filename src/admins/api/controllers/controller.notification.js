import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { collateUsersFcmTokens } from '../../lib/utils/lib.util.helpers';
import notificationQueries from '../queries/queries.settings';
import usersQueries from '../queries/queries.user';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import  notificationPayload from '../../lib/payloads/lib.payload.admin';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import { updateAdminNotificationReadBoolean, fetchAndUpdateNotification,  
  sendUserPersonalNotification, sendMulticastPushNotification, sendPushNotification } from '../services/services.firebase';



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
    const payload = notificationPayload.sendUserNotification(req.admin, body);

    if (body.type === 'alert') {
      const result = await processOneOrNoneData(notificationQueries.sendNotification, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: Users alert notification sent successfully. sendNotifications.admin.controller.notification.js`);
      return ApiResponse.success(res, enums.SUCCESSFULLY_NOTIFICATION, enums.HTTP_OK, result);
    }

    if (body.type === 'system') {
      if (body.recipient === 'select') {
        await Promise.all(body.sent_to.map(async(el) => {
          const [ user ]   = await processAnyData(usersQueries.getUsersFcToken, [ el.user_id ]);
          sendUserPersonalNotification(user, body.title, body.content, 'admin-sent-notification');
          await sendPushNotification(user.user_id, body.title, user.fec_token);
        }));
      }

      else {
        const usersToken = await collateUsersFcmTokens(users);
        await sendMulticastPushNotification(body.title, usersToken, 'admin-notification');
        await Promise.all(users.map(async(el) => {
          await sendPushNotification(el.user_id, body.title, el.fcm_token);
        }));
      }
    }

    const result = await processOneOrNoneData(notificationQueries.sendNotification, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: Users notification sent successfully in sendNotifications.admin.controller.notification.js`);
    return ApiResponse.success(res, enums.SUCCESSFULLY_NOTIFICATION, enums.HTTP_OK, result);
  } catch (error) {
    error.label = enums.SEND_USERS_NOTIFICATIONS_CONTROLLER;
    logger.error(`Sending users notification failed:::${enums.SEND_USERS_NOTIFICATIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/** 
 * fetch admin sent notifications 
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON successful response
 * @memberof NotificationController
 */
export const fetchNotifications = async(req, res, next) => {
  try {
    const { query, admin } = req;
    const payload = notificationPayload.fetchNotifications(query);
    const [ notifications, [ notificationCount ] ] = await Promise.all([
      processAnyData(notificationQueries.fetchNotifications, payload),
      processAnyData(notificationQueries.fetchNotificationCount, payload)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched notifications from the DB.
     fetchNotifications.admin.controller.notification.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(notificationCount.total_count),
      total_pages: Helpers.calculatePages(Number(notificationCount.total_count), Number(req.query.per_page) || 10),
      notifications
    };
    return ApiResponse.success(res, enums.FETCHED_NOTIFICATIONS, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_NOTIFICATIONS_CONTROLLER;
    logger.error(`fetching notifications failed:::${enums.FETCH_NOTIFICATIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};
