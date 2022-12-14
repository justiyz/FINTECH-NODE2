export default {
  register: (body, otp, expireAt) => [ body.phone_number.trim(), otp, expireAt ],
  verifyUserAccount: (user, refreshToken, body, referralCode) => [ user.user_id, refreshToken, body.fcm_token, referralCode ],
  completeProfile: (user, body, hashed) => [ 
    user.user_id, 
    body.first_name.trim().toLowerCase(), 
    body.middle_name.trim().toLowerCase() || null, 
    body.last_name.trim().toLowerCase(), 
    body.email.trim().toLowerCase(),
    body.date_of_birth, 
    body.gender, 
    hashed 
  ]
};
