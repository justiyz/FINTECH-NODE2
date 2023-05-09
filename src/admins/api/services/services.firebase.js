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
    extra_data: JSON.stringify(extra_data),
    created_at: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]')
  });
};
