import dayjs from 'dayjs';
import { admin } from '../../../users/config/firebase/index';
import config from '../../../users/config';
import { generateElevenDigits } from '../../../users/lib/utils/lib.util.helpers';
import { dbFireStore } from '../../../users/config/db';

export const sendPushNotification = async(user_id, content, fcm_token) => {
  try {
    if (!fcm_token || config.SEEDFI_NODE_ENV === 'test') {
      return;
    }
    const payload = {
      token: fcm_token,
      notification: {
        body: content
      },
      data: {
        user_id,
        created_at: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]')
      }
    };
    admin.messaging().send(payload);
  } catch (error) {
    logger.error('Error sending push notification message', error);
  }
};

/**
 * send notification to user
 * @param {Object} user - the user object receiving the notification
 * @param {String} title - the title of the personal notification
 * @param {String} content - the message content of the personal notification
 * @param {String} type - the type of personal notification // types should not be changed without informing mobile
 * @param {Object} extra_data - an optional object containing extra needed data
 * @returns { JSON } - a response based on if the notification was sent or not
 * @memberof FirebaseService
 */
export const sendUserPersonalNotification = async(user, title, content, type, extra_data) => {
  if (config.SEEDFI_NODE_ENV === 'test') {
    return;
  }
  const chatId = generateElevenDigits();
  const sendChat = dbFireStore
    .collection('notifications')
    .doc(`${user.user_id}`)
    .collection('messages-timestamp')
    .doc(Date.now().toString());
  await sendChat.set({
    chatId,
    user_id: user.user_id,
    title,
    content,
    chat_type: type,
    is_read: false,
    extra_data: JSON.stringify(extra_data) || {},
    created_at: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]')
  });
};


/**
 * update a single notification read status
 * @param {Object} admin - the user object for which the notification is being updated for
 * @param {String} params - the params from the request
 * @param {String} body - the payload from the request
 * @returns { JSON } - a response based on if the notification was updated or not
 * @memberof FirebaseService
 */
export const updateAdminNotificationReadBoolean = async(admin, params) => {
  if (config.SEEDFI_NODE_ENV === 'test') {
    return;
  }
  const { adminNotificationId } = params;
  const updateNotification = dbFireStore
    .collection('admin_notifications')
    .doc(`${admin.admin_id}`)
    .collection('messages-timestamp')
    .doc(adminNotificationId);

  await updateNotification.update({
    is_read: true
  });
  return updateNotification;
};

/**
 * fetch and update multiple notifications
 * @param {Object} docId - the admin document id for which the notification is being updated for
 * @returns { JSON } - a response based on if the notification was updated or not
 * @memberof FirebaseService
 */
export const fetchAndUpdateNotification = async(docId) => {
  try {
    if (config.SEEDFI_NODE_ENV === 'test') {
      return;
    }

    const querySnapshot = await dbFireStore
      .collection('admin_notifications')
      .doc(`${docId}`)
      .collection('messages-timestamp')
      .where('is_read', '==', false)
      .get();

    const notifications = [];
    const updateNotification = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      notifications.push(data);

      const updatePromises = doc.ref.update({
        is_read: true
      });
      updateNotification.push(updatePromises);
    });
    await Promise.all(updateNotification);
  } catch (error) {
    console.error('Error querying data:', error);
    throw error;
  }
};

/**
 * Send multiple users push notification
 * @param {String} content - the message content of the push notification
 * @param {Array} fcm_tokens - the unique tokens to deliver notification to all users
 * @param {String} type - the type of multicast push notification // types should not be changed without informing mobile
 * @param {String} user_id - an optional unique id of the cluster the push notification is for
 * @returns { JSON } - a response based on if the notifications were sent or not
 * @memberof FirebaseService
 */
export const sendMulticastPushNotification = async(content, fcm_tokens, type, user_id) => {
  const userId = user_id ? user_id.toString() : '';
  try {
    if (config.SEEDFI_NODE_ENV === 'test' || fcm_tokens.length < 1) {
      return;
    }
    const payload = {
      tokens: fcm_tokens,
      notification: {
        body: content
      },
      data: {
        type,
        userId,
        created_at: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]')
      }
    };
    await admin.messaging().sendMulticast(payload);
  } catch (error) {
    logger.error(error);
  }
};
