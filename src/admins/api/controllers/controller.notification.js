import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { collateUsersFcmTokens } from '../../lib/utils/lib.util.helpers';
import notificationQueries from '../queries/queries.settings';
import usersQueries from '../queries/queries.user';
import MailService from '../services/services.email';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import  notificationPayload from '../../lib/payloads/lib.payload.admin';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';
import { updateAdminNotificationReadBoolean, fetchAndUpdateNotification,  
  sendUserPersonalNotification, sendMulticastPushNotification } from '../services/services.firebase';



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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully updated notification read status 
    updateNotificationIsRead.admin.controller.notification.js`);
    await adminActivityTracking(req.admin.admin_id, 47, 'success', descriptions.marks_a_notification_read());
    return ApiResponse.success(res, enums.NOTIFICATION_UPDATED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 47, 'fail', descriptions.marks_a_notification_read_failed());
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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: successfully updated notification read status 
    updateNotificationIsRead.admin.controller.notification.js`);
    await adminActivityTracking(req.admin.admin_id, 48, 'success', descriptions.marks_all_notifications_read());
    return ApiResponse.success(res, enums.NOTIFICATION_UPDATED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 48, 'fail', descriptions.marks_all_notifications_read_failed());
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
  const { body, admin } = req;
  const activityType = body.type === 'alert' ? 50 : 49;
  try {
    const adminName = `${admin.first_name} ${admin.last_name}`;
    if (body.type === 'alert') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: alert notification type about to be sent sendNotifications.admin.controller.notification.js`);
      const payload = notificationPayload.sendUserNotification(admin, body);
      const result = await processOneOrNoneData(notificationQueries.sendNotification, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: Users alert notification sent successfully. sendNotifications.admin.controller.notification.js`);
      await adminActivityTracking(req.admin.admin_id, 50, 'success', descriptions.sends_alert_notification(adminName));
      return ApiResponse.success(res, enums.SUCCESSFULLY_NOTIFICATION, enums.HTTP_OK, result);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: system notification type about to be sent sendNotifications.admin.controller.notification.js`);
    const [ usersToken, userNames ] = await collateUsersFcmTokens(body.sent_to);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: recipient tokens and names sorted sendNotifications.admin.controller.notification.js`);
    await Promise.all(body.sent_to.map(async(user) => {
      const [ userDetails ] = await processAnyData(usersQueries.getUsersForNotifications, [ user.user_id ]);
      await MailService(body.title, 'adminSentNotification', { 
        email: userDetails.email, 
        first_name: userDetails.first_name,
        title: body.title,
        content: body.content
      });
      sendUserPersonalNotification(user, body.title, body.content, 'admin-sent-notification');
    }));
    sendMulticastPushNotification(`${body.title} \n${body.content}`, usersToken, 'admin-notification');
    body.sent_to = userNames;
    const payload = notificationPayload.sendUserNotification(admin, body);
    const result = await processOneOrNoneData(notificationQueries.sendNotification, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: Users system notification sent successfully sendNotifications.admin.controller.notification.js`);
    await adminActivityTracking(req.admin.admin_id, 49, 'success', descriptions.sends_system_notification(adminName));
    return ApiResponse.success(res, enums.SUCCESSFULLY_NOTIFICATION, enums.HTTP_OK, result);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, activityType, 'fail', body.type === 'system' ? 
      descriptions.sends_system_notification_failed(`${admin.first_name} ${admin.last_name}`) : 
      descriptions.sends_alert_notification_failed(`${admin.first_name} ${admin.last_name}`));
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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully fetched notifications from the DB.
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


/** 
 * delete notification
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON successful response
 * @memberof NotificationController
 */
export const deleteNotification = async(req, res, next) => {
  const adminName = `${req.admin.first_name} ${req.admin.last_name}`;
  try {
    const { body, admin, notification } = req;
    for (const id of body) {
      await processOneOrNoneData(notificationQueries.deleteNotification, [ id.adminNotificationId ]);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully delete notifications from the DB.
    deleteNotification.admin.controller.notification.js`);
    await adminActivityTracking(req.admin.admin_id, 51, 'success', descriptions.delete_notification(adminName, notification.title));

    return ApiResponse.success(res, enums.DELETE_NOTIFICATION, enums.HTTP_OK);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 51, 'fail', descriptions.delete_notification_failed(adminName));
    error.label = enums.DELETE_NOTIFICATION_CONTROLLER;
    logger.error(`delete notifications failed:::${enums.DELETE_NOTIFICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};
