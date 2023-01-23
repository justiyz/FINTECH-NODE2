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
        tier = $3,
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

  saveBankAccountDetails: `
      INSERT INTO user_bank_accounts(
        user_id,
        bank_name,
        bank_code,
        account_number,
        account_name
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,

  checkIfAccountExisting: `
      SELECT 
        account_number,
        bank_code
      FROM user_bank_accounts
      WHERE user_id = $1
      AND account_number = $2
      AND bank_code = $3`,

  fetchBankAccountDetails: `
      SELECT 
        id,
        user_id,
        bank_name,
        bank_code,
        account_number,
        account_name,
        is_default,
        is_disbursement_account,
        created_at
      FROM user_bank_accounts
      WHERE user_id = $1
      ORDER BY is_default DESC`,

  fetchUserDebitCards: `
      SELECT
        id,
        user_id,
        tokenising_platform,
        first_6_digits,
        last_4_digits,
        card_type,
        expiry_month,
        expiry_year,
        card_holder_name,
        card_attached_bank,
        is_default,
        created_at
      FROM user_debit_cards
      WHERE user_id = $1
      ORDER BY is_default DESC`,

  fetchBankAccountDetailsById: `
      SELECT 
        id,
        user_id,
        bank_name,
        bank_code,
        account_number,
        account_name,
        is_default,
        is_disbursement_account,
        created_at
      FROM user_bank_accounts
      WHERE id =$1`,

  deleteBankAccountDetails: `
      DELETE FROM user_bank_accounts
      WHERE user_id = $1
      AND id = $2`,

  setExistingAccountDefaultFalse: `
      UPDATE user_bank_accounts
      SET 
        updated_at = NOW(),
        is_default = 'false'
      WHERE user_id = $1`,

  SetNewAccountDefaultTrue: `
      UPDATE user_bank_accounts
      SET 
        updated_at = NOW(),
        is_default = 'true'
      WHERE user_id = $1
      AND id = $2
      RETURNING id, user_id, account_number, account_name,is_default, is_disbursement_account`,

  setExistingAccountDisbursementFalse: `
      UPDATE user_bank_accounts
      SET 
        updated_at = NOW(),
        is_disbursement_account = 'false'
      WHERE user_id = $1`,

  SetNewAccountDisbursementTrue: `
      UPDATE user_bank_accounts
      SET 
        updated_at = NOW(),
        is_disbursement_account = 'true'
      WHERE user_id = $1
      AND id = $2
      RETURNING id, user_id, account_number, account_name,is_default, is_disbursement_account`,

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
    tier = $2
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
