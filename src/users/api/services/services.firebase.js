import dayjs from 'dayjs';
import { admin } from '../../config/firebase/index';
import { dbFireStore } from '../../config/db';
import config from '../../../users/config';
import { generateElevenDigits } from '../../lib/utils/lib.util.helpers';

/**
 * Send single user push notification
 * @param {String} user_id - id of the user receiving the push notification
 * @param {String} content - the message content of the push notification
 * @param {String} fcm_token - the unique token to deliver notification to user
 * @returns { JSON } - a response based on if the notification was sent or not
 * @memberof FirebaseService
 */
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
 * Send multiple users push notification
 * @param {String} content - the message content of the push notification
 * @param {Array} fcm_tokens - the unique tokens to deliver notification to all users
 * @param {String} type - the type of multicast push notification // types should not be changed without informing mobile
 * @param {String} cluster_id - an optional unique id of the cluster the push notification is for
 * @returns { JSON } - a response based on if the notifications were sent or not
 * @memberof FirebaseService
 */
export const sendMulticastPushNotification = async(content, fcm_tokens, type, cluster_id) => {
  const clusterId = cluster_id ? cluster_id.toString() : '';
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
        clusterId,
        created_at: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]')
      }
    };
    await admin.messaging().sendMulticast(payload);
  } catch (error) {
    logger.error(error);
  }
};

/**
 * create cluster and send create cluster notification
 * @param {Object} user - the user object sending the notification
 * @param {Object} body - the request body object from the request
 * @param {Object} newClusterDetails - details of the just created cluster on postgresDB
 * @param {Object} clusterMemberDetails - details of the admin cluster user
 * @param {String} content - the message content of the cluster notification
 * @param {String} type - the type of cluster notification // types should not be changed without informing mobile
 * @param {Object} extra_data - an optional object containing extra needed data
 * @returns { JSON } - a response based on if the notification was sent or not
 * @memberof FirebaseService
 */
export const createClusterNotification = async(user, body, newClusterDetails, clusterMemberDetails, content, type, extra_data) => {
  if (config.SEEDFI_NODE_ENV === 'test') {
    return;
  }
  const chatId = generateElevenDigits();
  const sendChat = dbFireStore
    .collection('clusters')
    .doc(`${newClusterDetails.cluster_id}`)
    .collection('messages-timestamp')
    .doc(Date.now().toString());
  await sendChat.set({
    chatId,
    cluster_id: newClusterDetails.cluster_id,
    cluster_type: body.type,
    cluster_name: body.name.trim().toLowerCase(),
    sender_user_id: user.user_id,
    is_sender_admin: clusterMemberDetails.is_admin,
    content,
    chat_type: type,
    extra_data: JSON.stringify(extra_data),
    created_at: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]')
  });
};

/**
 * send notification to cluster
 * @param {Object} user - the user object sending the notification
 * @param {Object} cluster - the details of the cluster in question
 * @param {Object} clusterMemberDetails - details of the admin cluster user
 * @param {String} content - the message content of the cluster notification
 * @param {String} type - the type of cluster notification // types should not be changed without informing mobile
 * @param {Object} extra_data - an optional object containing extra needed data
 * @returns { JSON } - a response based on if the notification was sent or not
 * @memberof FirebaseService
 */
export const sendClusterNotification = async(user, cluster, clusterMemberDetails, content, type, extra_data) => {
  if (config.SEEDFI_NODE_ENV === 'test') {
    return;
  }
  const chatId = generateElevenDigits();
  const sendChat = dbFireStore
    .collection('clusters')
    .doc(`${cluster.cluster_id}`)
    .collection('messages-timestamp')
    .doc(Date.now().toString());
  await sendChat.set({
    chatId,
    cluster_id: cluster.cluster_id,
    cluster_type: cluster.type,
    cluster_name: cluster.name.trim().toLowerCase(),
    sender_user_id: user.user_id,
    is_sender_admin: clusterMemberDetails.is_admin,
    content,
    chat_type: type,
    extra_data: JSON.stringify(extra_data),
    created_at: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]')
  });
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

/**
 * update a notifications is read status
 * @param {Object} user - the user object for which the notification is being updated for
 * @param {String} params - the params from the request
 * @param {String} body - the payload from the request
 * @returns { JSON } - a response based on if the notification was updated or not
 * @memberof FirebaseService
 */
export const updateNotificationReadBoolean = async(user, params, body) => {
  if (config.SEEDFI_NODE_ENV === 'test') {
    return;
  }
  const { notificationId } = params;
  const updateNotification = await dbFireStore
    .collection('notifications')
    .doc(`${user.user_id}`)
    .collection('messages-timestamp')
    .doc(notificationId);

  if (body.type === 'voting') {
    await updateNotification.update({
      is_read: true,
      extra_data: JSON.stringify(body.extra_data)
    });
    return updateNotification;
  }
  await updateNotification.update({
    is_read: true
  });
  return updateNotification;
};


/**
 * send notification to admin
 * @param {Object} admin_id - the admin id receiving the notification
 * @param {String} title - the title of the personal notification
 * @param {String} message - the message content of the personal notification
 * @param {String} customer_name - contains the customer name 
 * @param {String} type - the type of notification sent to admin
 * @param {Object} extra_data - an optional object containing extra needed data
 * @returns { JSON } - a response based on if the notification was sent or not
 * @memberof FirebaseService
 */
export const sendNotificationToAdmin = async(admin_id, title, message, customer_name, type, extra_data) => {
  if (config.SEEDFI_NODE_ENV === 'test') {
    return;
  }

  const chatId = generateElevenDigits();
  const sendChat = await dbFireStore
    .collection('admin_notifications')
    .doc(`${admin_id}`)
    .collection('messages-timestamp')
    .doc(Date.now().toString());
  await sendChat.set({
    chatId,
    title,
    message,
    customer_name: customer_name || [],
    is_read: false,
    chat_type: type,
    extra_data: JSON.stringify(extra_data) || {},
    created_at: dayjs().format('YYYY-MM-DDTHH:mm:ss[Z]')
  });
};

