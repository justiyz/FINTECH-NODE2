export default {
  getUserByPhoneNumber: `
  SELECT id, phone_number, user_id, email, title, first_name, middle_name, last_name, tier, gender, date_of_birth, image_url,
    is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin, 
    is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code,
    number_of_children, marital_status, loan_status, device_token,
    to_char(created_at, 'DDth, Month YYYY') AS date_joined, next_profile_update
  FROM users
  WHERE phone_number = $1`,

  getUserByUserId: `
    SELECT id, phone_number, user_id, email, title, INITCAP(first_name) AS first_name, INITCAP(middle_name) AS middle_name, INITCAP(last_name) AS last_name, 
      tier, gender, date_of_birth, image_url, is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin, 
      is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code, number_of_children, marital_status, loan_status, device_token,
      to_char(created_at, 'DDth, Month YYYY') AS date_joined, next_profile_update
   FROM users
   WHERE user_id = $1`,

  getUserByEmail: `
    SELECT id, phone_number, user_id, email, title, first_name, middle_name, last_name, tier, gender, date_of_birth, image_url,
      is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin, 
      is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code,
      number_of_children, marital_status, loan_status, device_token,
      to_char(created_at, 'DDth, Month YYYY') AS date_joined, next_profile_update
    FROM users
    WHERE email = $1`
  ,

  updateUserFcmToken: `
      UPDATE users
      SET 
        updated_at = NOW(),
        fcm_token = $2
      WHERE user_id = $1`,

  fetchUserFcmTOken: `
      SELECT fcm_token
      FROM users
      WHERE user_id = $1`,

  fetchUserRefreshToken: `
      SELECT refresh_token 
      FROM users
      WHERE user_id = $1`,

  updateUserRefreshToken: `
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

  checkMaximumExistingAccountCounts: `
      SELECT COUNT(id)
      FROM user_bank_accounts
      WHERE user_id = $1`,

  checkMaximumExistingCardsCounts: `
      SELECT COUNT(id)
      FROM user_debit_cards
      WHERE user_id = $1`,

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
        mono_account_id = NULL,
        is_default = FALSE
      WHERE user_id = $1`,

  SetNewAccountDefaultTrue: `
      UPDATE user_bank_accounts
      SET 
        updated_at = NOW(),
        is_default = TRUE
      WHERE user_id = $1
      AND id = $2
      RETURNING id, user_id, account_number, account_name,is_default, is_disbursement_account`,

  setExistingAccountDisbursementFalse: `
      UPDATE user_bank_accounts
      SET 
        updated_at = NOW(),
        is_disbursement_account = FALSE
      WHERE user_id = $1`,

  SetNewAccountDisbursementTrue: `
      UPDATE user_bank_accounts
      SET 
        updated_at = NOW(),
        is_disbursement_account = TRUE
      WHERE user_id = $1
      AND id = $2
      RETURNING id, user_id, account_number, account_name,is_default, is_disbursement_account`,

  fetchAllExistingBvns: `
      SELECT bvn 
      FROM users
      WHERE bvn IS NOT NULL`,

  fetchAllExistingBlacklistedBvns: `
      SELECT bvn 
      FROM blacklisted_bvns
      WHERE bvn IS NOT NULL`,

  blacklistUser: `
      UPDATE user
      SET 
        updated_at = NOW(),
        status = 'blacklisted'
      WHERE user_id = $1`,

  fetchUserBvn: `
      SELECT bvn 
      FROM users
      WHERE user_id = $1`,

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

  addDocumentTOUserUploadedDocuments: `
    INSERT INTO user_admin_uploaded_documents (
      user_id, 
      document_title,
      image_url
    ) VALUES ($1, $2, $3)`,

  fetchUserAddressDetails: `
    SELECT 
      id,
      user_id,
      street,
      state,
      city,
      house_number,
      lga,
      landmark,
      country,
      type_of_residence,
      rent_amount,
      is_verified_address,
      is_verified_utility_bill,
      address_image_url,
      you_verify_candidate_id,
      you_verify_request_id,
      you_verify_address_id,
      is_editable,
      can_upload_utility_bill,
      you_verify_address_verification_status,
      created_at
    FROM address_verification
    WHERE (user_id = $1 OR you_verify_candidate_id = $1)`,

  createUserAddressDetails: `
    INSERT INTO address_verification (
      user_id,
      street,
      state,
      city,
      house_number,
      landmark,
      lga,
      country,
      type_of_residence,
      rent_amount,
      is_verified_address,
      you_verify_candidate_id
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,

  updateUserAddressDetails: `
    UPDATE address_verification
    SET
      updated_at = NOW(),
      street = $2,
      state = $3,
      city = $4,
      house_number = $5,
      landmark = $6,
      lga = $7,
      country = $8,
      type_of_residence = $9,
      rent_amount = $10,
      you_verify_request_id = $11,
      you_verify_address_id = $12,
      you_verify_address_verification_status = $13,
      you_verify_candidate_id = $14,
      is_editable = FALSE
    WHERE user_id = $1
    RETURNING *`,

  updateAddressVerificationStatus: `
    UPDATE address_verification
    SET
      updated_at = NOW(),
      you_verify_address_verification_status = $2,
      is_editable = $3,
      is_verified_address = $4
    WHERE user_id = $1
    `,

  updateUtilityBillDocument: `
    UPDATE address_verification
    SET 
      updated_at = NOW(),
      address_image_url = $2,
      can_upload_utility_bill = false
    WHERE user_id = $1`,

  userIdVerification: `
    UPDATE users
    SET
    is_uploaded_identity_card = true,
    tier = $2
    WHERE user_id = $1
    RETURNING user_id, first_name, last_name, tier, is_verified_phone_number, is_verified_email, is_verified_bvn, 
    is_uploaded_selfie_image, is_created_password, is_created_pin, is_completed_kyc, is_uploaded_identity_card, status
    `,

  updateUserTierValue: `
    UPDATE users
    SET 
      updated_at = NOW(),
      tier = $2
    WHERE user_id = $1`,

  updateUserProfile: `
     UPDATE users
     SET 
     updated_at = NOW(),
     first_name = $2,
     middle_name = $3,
     last_name = $4,
     date_of_birth = $5,
     gender = $6,
     number_of_children = $7,
     marital_status = $8,
     next_profile_update = $9
     WHERE user_id = $1
     RETURNING user_id, first_name, middle_name, last_name, date_of_birth, gender, email, number_of_children, marital_status, next_profile_update
  `,

  fetchCardsById: `
      SELECT id, user_id, card_type, is_default, tokenising_platform, auth_token
      FROM user_debit_cards
      WHERE id = $1
  `,

  setExistingCardDefaultFalse: `
      UPDATE user_debit_cards
      SET 
        updated_at = NOW(),
        is_default = FALSE
      WHERE user_id = $1`,

  setNewCardDefaultTrue: `
      UPDATE user_debit_cards
      SET 
        updated_at = NOW(),
        is_default = TRUE
      WHERE user_id = $1
      AND id = $2
      RETURNING id, user_id, is_default, card_type`,

  removeCard: `
      DELETE FROM user_debit_cards
      WHERE user_id = $1 AND id = $2`,

  updateSecondaryCardDefault: `
      UPDATE user_debit_cards
      SET 
        updated_at = NOW(),
        is_default = TRUE
      WHERE user_id = $1
      RETURNING id, user_id, is_default, card_type`,

  userOutstandingPersonalLoan: `
      SELECT 
        id,
        user_id,
        loan_id,
        TRUNC(total_outstanding_amount::numeric, 2) AS total_outstanding_amount
      FROM personal_loans
      WHERE user_id = $1
      AND (status = 'ongoing' OR status = 'over due')`,

  userOutstandingClusterLoan: `
      SELECT 
        id,
        user_id,
        loan_id,
        member_loan_id,
        cluster_id,
        TRUNC(total_outstanding_amount::numeric, 2) AS total_outstanding_amount
      FROM cluster_member_loans
      WHERE user_id = $1
      AND (status = 'ongoing' OR status = 'over due')`,

  userExistingProcessingLoans: `
      SELECT 
        id,
        loan_id,
        user_id,
        TRUNC(amount_requested::numeric, 2) AS amount_requested,
        loan_reason,
        loan_tenor_in_months,
        status,
        loan_decision,
        created_at,
        to_char(DATE (created_at)::date, 'Mon DD YYYY') AS requested_date
      FROM personal_loans
      WHERE user_id = $1
      AND (status = 'in review' OR status = 'approved')
      ORDER BY created_at DESC`,

  userExistingClusterProcessingLoans: `
      SELECT 
        id,
        loan_id,
        member_loan_id,
        user_id,
        cluster_id,
        TRUNC(amount_requested::numeric, 2) AS amount_requested,
        loan_tenor_in_months,
        status,
        loan_decision,
        created_at,
        to_char(DATE (created_at)::date, 'Mon DD YYYY') AS requested_date
      FROM cluster_member_loans
      WHERE user_id = $1
      AND (status = 'in review' OR status = 'approved' OR status = 'pending')
      ORDER BY created_at DESC`,

  userPersonalLoanTransactions: `
      SELECT 
        id,
        payment_id,
        loan_id,
        user_id,
        TRUNC(amount::numeric, 2) AS amount_payed,
        transaction_type,
        loan_purpose,
        status,
        payment_description,
        payment_means,
        created_at,
        to_char(DATE (created_at)::date, 'DDth Mon, YYYY') AS payment_date
      FROM personal_loan_payments
      WHERE user_id = $1
      ORDER BY created_at DESC`,

  userClusterLoanTransactions: `
      SELECT 
        id,
        payment_id,
        loan_id,
        member_loan_id,
        cluster_id,
        user_id,
        TRUNC(amount::numeric, 2) AS amount_payed,
        transaction_type,
        loan_purpose,
        status,
        payment_description,
        payment_means,
        created_at,
        to_char(DATE (created_at)::date, 'DDth Mon, YYYY') AS payment_date
      FROM cluster_member_loan_payments
      WHERE user_id = $1
      ORDER BY created_at DESC`,

  userOfferLetterDetails: `
      SELECT 
        id,
        user_id,
        INITCAP(
          TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name))
        ) AS full_name,
        bvn,
        gender
      FROM users
      WHERE user_id = $1`,

  createNextOfKin: `
      INSERT INTO next_of_kin(
        user_id,
        first_name,
        last_name,
        phone_number,
        email,
        kind_of_relationship
      ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
  getUserNextOfKin: `
        SELECT 
            id,
            first_name,
            last_name,
            phone_number,
            email,
            kind_of_relationship
        FROM next_of_kin
        WHERE user_id = $1`,

  createUserEmploymentDetails: `  
    INSERT INTO employment_type(
        user_id,
        employment_type,
        company_name,
        school_name,
        date_started,
        next_update,
        monthly_income
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING user_id, employment_type, monthly_income
      `,
  updateEmploymentDetails: `
    UPDATE employment_type
    SET 
      updated_at = NOW(),
      employment_type = $2,
      company_name = $3,
      school_name = $4,
      date_started = $5,
      next_update = $6,
      monthly_income = $7
    WHERE user_id = $1
    RETURNING user_id, employment_type, next_update, monthly_income
    `,

  fetchEmploymentDetails: `
       SELECT 
          user_id,
          employment_type,
          company_name,
          school_name,
          date_started,
          monthly_income,
          next_update AS employment_next_update
        FROM employment_type
        WHERE user_id = $1
    `,

  updateUserMonoAccountId: `
    UPDATE user_bank_accounts
    SET 
      updated_at = NOW(),
      mono_account_id = $2
    WHERE user_id = $1
    AND is_default = TRUE
    RETURNING id, user_id, bank_name, account_name, is_default, mono_account_id
    `,
  fetchTierOneLoanValue: `
   SELECT 
    name,
    value
   FROM admin_env_values_settings
   WHERE name IN ('maximum_loan_tenor', 'minimum_loan_tenor', 
   'tier_one_minimum_loan_amount', 'tier_one_maximum_loan_amount');
  `,
  fetchTierTwoLoanValue: `
    SELECT 
    name,
    value
    FROM admin_env_values_settings
    WHERE name IN ('maximum_loan_tenor', 'minimum_loan_tenor', 
    'tier_two_minimum_loan_amount', 'tier_two_maximum_loan_amount');
 `,
  fetchAllActivePromos: `
      SELECT
          id,
          promo_id,
          name,
          description,
          start_date,
          end_date,
          image_url,
          status,
          created_by
      FROM system_promos
      WHERE status = 'active' 
 `,
 
  fetchAlert: `
     SELECT 
        notification_id,  
        title, 
        content, 
        created_at 
      FROM admin_sent_notifications 
      WHERE type = 'alert' AND is_ended IS FALSE;
  `,
  
  updateAlertNotification: `
      UPDATE admin_sent_notifications
      SET 
      updated_at = NOW(),
      is_ended = TRUE
      WHERE DATE(end_at) = CURRENT_DATE;
  `
};
