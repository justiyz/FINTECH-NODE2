export default {
  getUserByVerificationToken: `
    SELECT id, email, phone_number, user_id, verification_token_expires, is_verified_email
    FROM users 
    WHERE verification_token = $1`,

  registerUser: `
    INSERT INTO users(
        phone_number, verification_token, verification_token_expires
    ) VALUES ($1, $2, $3)
    ON CONFLICT(phone_number)
    DO UPDATE SET
    referral_code = EXCLUDED.referral_code,
    verification_token = EXCLUDED.verification_token,
    verification_token_expires = EXCLUDED.verification_token_expires
    RETURNING user_id, phone_number, tier, status, verification_token_expires, is_deleted`,

  updateVerificationToken: `
    UPDATE users
    SET
      updated_at = NOW(),
      verification_token = $2,
      verification_token_expires = $3
    WHERE phone_number = $1`,

  checkIfExistingReferralCode: `
    SELECT id, user_id, referral_code
    FROM users 
    WHERE referral_code = $1`,

  checkIfReferralPreviouslyRecorded: `
    SELECT id, referrer_user_id, referred_user_id
    FROM referral_trail
    WHERE referrer_user_id = $1
    AND referred_user_id = $2`,

  updateReferralTrail: `
    INSERT INTO referral_trail(
      referrer_user_id, referred_user_id
    ) VALUES ($1, $2)`,

  setSameFcmTokenNull: `
    UPDATE users
    SET
      updated_at = NOW(),
      fcm_token = null
    WHERE fcm_token = $1`,

  verifyUserAccountAfterSignup: `
    UPDATE users
    SET
      updated_at = NOW(),
      refresh_token = $2,
      fcm_token = $3,
      referral_code = $4,
      device_token = $5,
      is_verified_phone_number = TRUE,
      verification_token = NULL,
      verification_token_expires = NULL
    WHERE user_id = $1`,

  verifyUserAccountOnNewDevice: `
    UPDATE users
    SET
      updated_at = NOW(),
      refresh_token = $2,
      fcm_token = $3,
      device_token = $4,
      is_verified_phone_number = TRUE,
      verification_token = NULL,
      verification_token_expires = NULL
    WHERE user_id = $1`,

  completeUserProfile: `
    UPDATE users
    SET
      updated_at = NOW(),
      status = 'active',
      is_created_password = TRUE,
      is_completed_kyc = TRUE,
      first_name = $2,
      middle_name = $3,
      last_name = $4,
      email = $5,
      date_of_birth = $6,
      gender = $7,
      password = $8
    WHERE user_id = $1
    RETURNING id, user_id, first_name, middle_name, last_name, email, tier, gender, date_of_birth, status`,

  fetchUserPassword: `
    SELECT id, user_id, password
    FROM users 
    WHERE user_id = $1`,

  fetchUserPin: `
    SELECT id, user_id, pin
    FROM users 
    WHERE user_id = $1`,

  loginUserAccount: `
    UPDATE users
    SET 
      updated_at = NOW(),
      refresh_token = $2
    WHERE user_id = $1
    RETURNING id, phone_number, user_id, email, title, first_name, middle_name, last_name, tier, gender, date_of_birth, image_url,
    is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin, 
    is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code, refresh_token, loan_status, next_profile_update`,

  forgotPassword: `
    UPDATE users
    SET
      verification_token = $2,
      verification_token_expires = $3,
      updated_at = NOW()
     WHERE email = $1
     RETURNING user_id, first_name, middle_name, last_name, status`,

  resetPassword: `
    UPDATE users
    SET
      password = $2,
      verification_token = NULL,
      verification_token_expires = NULL,
      updated_at = NOW()
     WHERE user_id = $1
    `,
  verifyUserEmail: `
    UPDATE users
    SET
      is_verified_email = TRUE,
      updated_at = NOW()
    WHERE user_id = $1
    `,
  changePassword: `
  UPDATE users
  SET
    updated_at = NOW(),
    password = $2
  WHERE user_id = $1
    `,
  createPin: `
  UPDATE users
  SET
    updated_at = NOW(),
    is_created_pin = TRUE,
    pin = $2
  WHERE user_id = $1
  `,
  changePin: `
  UPDATE users
  SET
    updated_at = NOW(),
    pin = $2
  WHERE user_id = $1
    `,
  forgotPin: `
    UPDATE users
    SET
      verification_token = $2,
      verification_token_expires = $3,
      updated_at = NOW()
    WHERE user_id = $1
    RETURNING user_id, first_name, middle_name, last_name, status`,

  resetPin: `
    UPDATE users
    SET
      updated_at = NOW(),
      verification_token = NULL,
      verification_token_expires = NULL,
      pin = $2
    WHERE user_id = $1`,

  checkIfUserHasClusterInvite: `
    SELECT 
      id,
      cluster_id,
      inviter_id,
      invitee,
      invitation_mode,
      invitee_id,
      is_joined,
      is_declined,
      created_at
    FROM cluster_invitees
    WHERE invitee = $1
    AND invitation_mode = $2
    AND invitee_id IS NULL
    AND is_joined = FALSE
    AND is_declined = FALSE
    ORDER BY created_at DESC
    LIMIT 1`,

  updateInvitedUserUserId: `
    UPDATE cluster_invitees
    SET
      updated_at = NOW(),
      invitee_id = $2
    WHERE id = $1`
};
