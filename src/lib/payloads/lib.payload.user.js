export default {
  updateUserFcmToken: (user, body) => [ user.user_id, body.fcm_token]
};
