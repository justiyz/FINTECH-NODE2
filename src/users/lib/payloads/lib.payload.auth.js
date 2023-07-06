export default {
  register: (body, otp, expireAt) => [ body.phone_number.trim(), otp, expireAt ],
  verifyUserAccountAfterSignup: (user, refreshToken, body, referralCode) => [ 
    user.user_id, 
    refreshToken, 
    body.fcm_token?.trim() || null, 
    referralCode,
    body.device_token?.trim() || null 
  ],
  verifyUserAccountOnNewDevice: (user, refreshToken, body) => [ 
    user.user_id, 
    refreshToken?.trim(), 
    body.fcm_token?.trim() || null, 
    body.device_token?.trim() || null 
  ],
  completeProfile: (user, body, hashed) => [ 
    user.user_id, 
    body.first_name.trim().toLowerCase(), 
    body.middle_name ? body.middle_name.trim().toLowerCase() : null, 
    body.last_name.trim().toLowerCase(), 
    body.email.trim().toLowerCase(),
    body.date_of_birth, 
    body.gender, 
    hashed 
  ]
};
