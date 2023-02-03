import dayjs from 'dayjs';
import { admin } from '../../users/config/firebase/index';
import config from '../../users/config';

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
