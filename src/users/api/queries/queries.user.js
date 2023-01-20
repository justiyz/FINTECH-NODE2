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
        is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code, password, pin, refresh_token, address, income_range,
        number_of_dependants, marital_status, loan_status
      FROM users
      WHERE user_id = $1`,

  getUserByEmail: `
      SELECT id, phone_number, user_id, email, title, first_name, middle_name, last_name, tier, gender, date_of_birth, image_url,
        is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin, 
        is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code, password, pin, refresh_token
      FROM users
      WHERE email = $1`,

  updateUserFcmToken:`
      UPDATE users
      SET 
        updated_at = NOW(),
        fcm_token = $2
      WHERE user_id = $1`,

  updateUserRefreshToken:`
      UPDATE users
      SET
        updated_at = NOW(),
        refresh_token = $2
      WHERE user_id = $1`,

  updateUserSelfieImage: `
      UPDATE users
      SET
        updated_at = NOW(),
        is_uploaded_selfie_image = TRUE,
        image_url = $2,
        verification_token = $3
      WHERE user_id = $1
      RETURNING id, user_id, first_name, middle_name, last_name, email, tier, image_url,
      gender, date_of_birth, status, is_completed_kyc, is_verified_bvn, is_uploaded_selfie_image
      `,

  updateUserBvn: `
      UPDATE users
      SET
        updated_at = NOW(),
        is_verified_bvn = TRUE,
        tier = '1',
        bvn = $2
      WHERE user_id = $1
      RETURNING id, user_id, first_name, middle_name, last_name, email, tier,
      gender, date_of_birth, status, is_completed_kyc, is_verified_bvn`,

  emailVerificationToken: `
      UPDATE users
      SET
        verification_token = $2,
        verification_token_expires = $3,
        updated_at = NOW()
      WHERE email = $1
      `,

  fetchAllExistingBvns: `
  SELECT bvn 
  FROM users
  WHERE bvn IS NOT NULL`,

  verifyEmail: `
      UPDATE users
      SET
        is_verified_email = TRUE,
        verification_token = NULL,
        verification_token_expires = NULL,
        updated_at = NOW()
      WHERE user_id = $1
      `,
  updateIdVerification: `
     INSERT INTO user_national_id_details(
      user_id,
      id_type,
      card_number,
      image_url,
      verification_url,
      issued_date,
      expiry_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
     `,
  userIdVerification: `
    UPDATE users
    SET
    is_uploaded_identity_card = true,
    tier = '2'
    WHERE user_id = $1
    RETURNING user_id, first_name, last_name, tier, is_verified_phone_number, is_verified_email, is_verified_bvn, 
    is_uploaded_selfie_image, is_created_password, is_created_pin, is_completed_kyc, is_uploaded_identity_card, status
    `,

  updateUserProfile: `
     UPDATE users
     SET 
     updated_at = NOW(),
     first_name = $2,
     middle_name = $3,
     last_name = $4,
     date_of_birth = $5,
     gender = $6,
     address = $7,
     income_range = $8,
     number_of_dependants = $9,
     marital_status = $10
     WHERE user_id = $1
     RETURNING user_id, first_name, middle_name, last_name, date_of_birth, gender, address,
              income_range, number_of_dependants, marital_status
  `
};
