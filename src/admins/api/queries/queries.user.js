export default {
  editUserStatus: `
  UPDATE users
  SET 
    updated_at = NOW(),
    status = $2
  WHERE user_id = $1
  `,
  getUserByUserId: `
    SELECT id, phone_number, user_id, email, title, first_name, middle_name, last_name, tier, gender,
      to_char(DATE (date_of_birth)::date, 'DDth Month, YYYY') AS date_of_birth, image_url,
      is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin, 
      is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code, address, income_range,
      number_of_dependants, marital_status, loan_status
    FROM users
    WHERE user_id = $1`,

  fetchUserReferrals: `
    SELECT 
        referral_trail.id AS referral_id,
        referral_trail.referred_user_id,
        (SELECT CONCAT(users.first_name, ' ', users.last_name, ' ', users.middle_name) FROM users WHERE referral_trail.referred_user_id = user_id) AS referred_user_name,
        (SELECT users.email FROM users WHERE referral_trail.referred_user_id = user_id) AS referred_user_email,
        (SELECT users.created_at FROM users WHERE referral_trail.referred_user_id = user_id) AS referred_user_signup_date
    FROM referral_trail
    LEFT JOIN users
    ON users.user_id = referral_trail.referrer_user_id
    WHERE referral_trail.referrer_user_id = $1`,

  fetchUserBankAccounts: `
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
      ORDER BY is_default DESC`
};
