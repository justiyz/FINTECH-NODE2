export default {
  getUserByPhoneNumber: `
      SELECT id, phone_number, user_id, email, title, first_name, middle_name, last_name, tier, gender, date_of_birth, image_url,
        is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin, 
        is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code, password, pin, refresh_token
      FROM users
      WHERE phone_number = $1`,

  getUserByUserId: `
      SELECT id, phone_number, user_id, email, title, first_name, middle_name, last_name, tier, gender, date_of_birth, image_url,
        is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin, 
        is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code, password, pin, refresh_token
      FROM users
      WHERE user_id = $1`,

  getUserByEmail: `
      SELECT id, phone_number, user_id, email, title, first_name, middle_name, last_name, tier, gender, date_of_birth, image_url,
        is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin, 
        is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code, password, pin, refresh_token
      FROM users
      WHERE email = $1`,

  updateUserFcmToken:`
      UPDATE 
         users
      SET 
        updated_at = NOW(),
        fcm_token = $2
      WHERE 
        user_id = $1
  `,
  updateUserRefreshToken:`
      UPDATE
          users
      SET
        updated_at = NOW(),
        refresh_token = $2
      WHERE
         user_id = $1
  `
};
