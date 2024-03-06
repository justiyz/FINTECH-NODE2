export default {
  createMerchant: `
    INSERT INTO merchants(
      business_name,
      email,
      phone_number,
      interest_rate,
      address,
      secret_key,
      orr_score_threshold,
      processing_fee,
      insurance_fee,
      advisory_fee,
      customer_loan_max_amount,
      merchant_loan_limit
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
<<<<<<< Updated upstream
    ) RETURNING id, merchant_id, business_name, email, phone_number, interest_rate, address, 
    orr_score_threshold, processing_fee, insurance_fee, advisory_fee, customer_loan_max_amount, merchant_loan_limit, created_at;
=======
    ) RETURNING id, merchant_id, business_name, email, phone_number, interest_rate, address, orr_score_threshold,
     processing_fee, insurance_fee, advisory_fee, customer_loan_max_amount, merchant_loan_limit, created_at;
>>>>>>> Stashed changes
  `,
  onboardMerchant: `
    UPDATE merchants
    SET
        first_name = $2,
        last_name = $3,
        email = $4,
        phone_number = $5,
        gender = $6,
        password = $7,
        updated_at = NOW()
    WHERE
        merchant_id = $1
    RETURNING first_name, last_name, email, phone_number, gender, merchant_id
  `,
  createMerchantAdmin: `
      INSERT INTO merchant_admins (
        first_name,
        last_name,
        email,
        phone_number,
        gender,
        password,
        verification_token,
        verification_token_expires
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8
      ) RETURNING *
  `,

  createMerchantAdminPivot: `
      INSERT INTO merchant_admins_merchants (
        merchant_id,
        merchant_admin_id
      ) VALUES (
        $1, $2
      ) RETURNING *
  `,

  fetchMerchantAdminIdByMerchantEmail: `
    SELECT
        merchant_admins.merchant_id
    FROM merchant_admins
    LEFT JOIN merchants ON merchants.merchant_id = merchant_admins.merchant_id
    WHERE
        merchant_admins.email = $1`,
  updateMerchantLoginToken: `
      UPDATE merchant_admins
      SET
        updated_at = NOW(),
        is_verified_email = true,
        verification_token = $2,
        verification_token_expires = $3,
        verification_token_request_count = $4,
        invalid_verification_token_count = $5
      WHERE merchant_admin_id = $1
      RETURNING *`,

  fetchMerchantByMerchantId: `
    SELECT * FROM merchants WHERE merchant_id = $1;
  `,

  fetchMerchantByCodeInitials: `
      SELECT * FROM merchants WHERE merchant_code ILIKE $1 || '%';
  `,

  fetchMerchantAdminByEmail:
    'SELECT * FROM merchant_admins WHERE email = $1',

  fetchMerchantAdminPivotByAdminEmail:
  `SELECT mam.*
  FROM merchant_admins_merchants mam
  JOIN merchant_admins ma ON mam.merchant_admin_id = ma.merchant_admin_id
  WHERE ma.email = $1 AND mam.merchant_id = $2`,


  fetchMerchantAdminByEmailAndPhoneNo:
    'SELECT id FROM merchant_admins WHERE (email = $1 OR phone_number = $2) AND merchant_id = $3;',


  fetchMerchantAdmins: `
    SELECT
        merchant_admins.merchant_admin_id,
        merchant_admins.first_name,
        merchant_admins.last_name,
        TRIM(CONCAT(merchant_admins.first_name, ' ', merchant_admins.last_name)) AS name,
        merchant_admins.gender,
        merchant_admins.email,
        merchant_admins.phone_number,
        merchant_admins.status,
        mam.created_at
    FROM merchant_admins_merchants AS mam
    LEFT JOIN merchant_admins ON mam.merchant_admin_id = merchant_admins.merchant_admin_id
    WHERE
      mam.merchant_id = $1
      AND ($3 IS NULL OR merchant_admins.status = $3)
      AND (
        $2 IS NULL
        OR TRIM(CONCAT(merchant_admins.first_name,  ' ', merchant_admins.last_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(merchant_admins.last_name, ' ', merchant_admins.first_name)) ILIKE TRIM($2)
        OR merchant_admins.email ILIKE TRIM($2)
        OR merchant_admins.phone_number ILIKE TRIM($2)
      )
    ORDER BY mam.created_at DESC
    OFFSET $4
    LIMIT $5
  `,

  fetchMerchantAdminsCount: `
    SELECT COUNT(*) AS total_count
    FROM merchant_admins_merchants AS mam
    LEFT JOIN merchant_admins ON mam.merchant_admin_id = merchant_admins.merchant_admin_id
    WHERE
      mam.merchant_id = $1
      AND ($3 IS NULL OR merchant_admins.status = $3)
      AND (
        $2 IS NULL
        OR TRIM(CONCAT(merchant_admins.first_name,  ' ', merchant_admins.last_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(merchant_admins.last_name, ' ', merchant_admins.first_name)) ILIKE TRIM($2)
        OR merchant_admins.email ILIKE TRIM($2)
        OR merchant_admins.phone_number ILIKE TRIM($2)
      )
    `,

  fetchMerchantByEmailAndPhoneNo: 'SELECT id FROM merchants WHERE email = $1 OR phone_number = $2;',
  fetchSingleMerchant: `
    SELECT
      merchants.merchant_id,
      business_name,
      email,
      phone_number,
      status,
      interest_rate,
      address,
      secret_key,
      orr_score_threshold,
      processing_fee,
      insurance_fee,
      advisory_fee,
      customer_loan_max_amount,
      merchant_loan_limit,
      merchants.created_at,
      json_build_object(
        'bank_name', ba.bank_name,
        'bank_code', ba.bank_code,
        'account_number', ba.account_number,
        'account_name', ba.account_name
      ) AS bank_account
    FROM merchants
    LEFT JOIN merchant_bank_accounts ba ON merchants.merchant_id = ba.merchant_id
    WHERE merchants.merchant_id = $1;
  `,
  fetchSingleMerchantByEmail: `
    SELECT
      merchants.merchant_id,
      business_name,
      email,
      phone_number,
      status,
      interest_rate,
      address,
      secret_key,
      orr_score_threshold,
      processing_fee,
      insurance_fee,
      advisory_fee,
      customer_loan_max_amount,
      merchant_loan_limit,
      merchants.created_at,
      json_build_object(
        'bank_name', ba.bank_name,
        'bank_code', ba.bank_code,
        'account_number', ba.account_number,
        'account_name', ba.account_name
      ) AS bank_account
    FROM merchants
    LEFT JOIN merchant_bank_accounts ba ON merchants.merchant_id = ba.merchant_id
    WHERE merchants.email = $1;
  `,
  fetchAndSearchMerchants: `
    SELECT
    count(*) OVER() AS total,
    merchants.merchant_id,
    business_name,
    email,
    phone_number,
    status,
    interest_rate,
    address,
    secret_key,
    orr_score_threshold,
    processing_fee,
    insurance_fee,
    advisory_fee,
    customer_loan_max_amount,
    merchant_loan_limit,
    merchants.created_at,
    json_build_object(
      'bank_name', ba.bank_name,
      'bank_code', ba.bank_code,
      'account_number', ba.account_number,
      'account_name', ba.account_name
    ) AS bank_account
    FROM merchants
    LEFT JOIN merchant_bank_accounts ba ON merchants.merchant_id = ba.merchant_id
    WHERE
      (
        $1 IS NULL
        OR TRIM(business_name) ILIKE TRIM('%'||$1||'%')
        OR TRIM(email) ILIKE TRIM('%'||$1||'%')
        OR TRIM(phone_number) ILIKE TRIM('%'||$1||'%')
      )
      AND
      (
        $2 IS NULL
        OR status = $2
      )
    ORDER BY merchants.created_at DESC
    OFFSET $3 LIMIT $4
  `,
  updateMerchant: `
    UPDATE merchants SET
      business_name = $2,
      status = $3,
      phone_number = $4,
      interest_rate = $5,
      address = $6,
      orr_score_threshold = $7,
      processing_fee = $8,
      insurance_fee = $9,
      advisory_fee = $10,
      customer_loan_max_amount = $11,
      merchant_loan_limit = $12,
      updated_at = now()
    WHERE merchant_id = $1
    RETURNING
      merchant_id,
      business_name,
      email,
      phone_number,
      status,
      interest_rate,
      address,
      secret_key,
      orr_score_threshold,
      processing_fee,
      insurance_fee,
      advisory_fee,
      customer_loan_max_amount,
      merchant_loan_limit,
      created_at
  `,
  fetchMerchantUserById: `
    SELECT
      users.id,
      users.user_id,
      users.first_name,
      users.last_name,
      users.middle_name,
      TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) AS name,
      users.date_of_birth,
      users.gender,
      users.email,
      users.phone_number,
      users.tier,
      users.loan_status,
      mu.status,
      users.bvn
    FROM merchant_users AS mu
    LEFT JOIN users ON mu.user_id = users.user_id
    WHERE mu.user_id = $1 AND mu.merchant_id = $2;
  `,
  fetchMerchantUsers: `
    WITH loans AS (
      SELECT
        pl.loan_id,
        pl.user_id,
        pl.status,
        pl.amount_requested,
        pl.loan_tenor_in_months,
        pl.loan_disbursed_at
      FROM merchant_user_loans mul
      LEFT JOIN personal_loans pl ON mul.loan_id = pl.loan_id
      WHERE mul.merchant_id = $1 AND pl.status IN (
        'pending', 'approved', 'ongoing', 'over due'
      )
    )
    SELECT
      users.id,
      users.user_id,
      users.first_name,
      users.last_name,
      users.middle_name,
      TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) AS name,
      users.date_of_birth,
      users.gender,
      users.email,
      users.phone_number,
      users.tier,
      users.bvn,
      mu.status,
      mu.created_at,
      loans.status as loan_status,
      loans.loan_id,
      loans.amount_requested AS loan_amount,
      loans.loan_tenor_in_months AS loan_duration,
      loans.loan_disbursed_at AS date_received
    FROM merchant_users AS mu
    LEFT JOIN users ON mu.user_id = users.user_id
    LEFT JOIN loans ON mu.user_id = loans.user_id
    WHERE
      mu.merchant_id = $1
      AND ($3 IS NULL OR mu.status = $3)
      AND (
        $2 IS NULL
        OR TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(users.first_name, ' ', users.last_name, ' ', users.middle_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(users.last_name, ' ', users.first_name, ' ', users.middle_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(users.last_name, ' ', users.middle_name, ' ', users.first_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(users.middle_name, ' ', users.first_name, ' ', users.last_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(users.middle_name, ' ', users.last_name, ' ', users.first_name)) ILIKE TRIM($2)
        OR email ILIKE TRIM($2)
        OR phone_number ILIKE TRIM($2)
      )
    ORDER BY mu.created_at DESC
    OFFSET $4
    LIMIT $5;
  `,
  fetchMerchantUsersCount: `
    SELECT COUNT(*) AS total_count
    FROM merchant_users AS mu
    LEFT JOIN users ON mu.user_id = users.user_id
    WHERE
      mu.merchant_id = $1
      AND ($3 IS NULL OR mu.status = $3)
      AND (
        $2 IS NULL
        OR TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(users.first_name, ' ', users.last_name, ' ', users.middle_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(users.last_name, ' ', users.first_name, ' ', users.middle_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(users.last_name, ' ', users.middle_name, ' ', users.first_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(users.middle_name, ' ', users.first_name, ' ', users.last_name)) ILIKE TRIM($2)
        OR TRIM(CONCAT(users.middle_name, ' ', users.last_name, ' ', users.first_name)) ILIKE TRIM($2)
        OR users.email ILIKE TRIM($2)
        OR users.phone_number ILIKE TRIM($2)
      );
  `,
  fetchMerchantUserActiveLoan: `
    SELECT id, loan_id FROM personal_loans pl
    WHERE pl.user_id = $1 AND
    pl.status IN ('pending', 'approved', 'ongoing', 'over due');
  `,
  fetchMerchantUserLoanRepaymentSchedule: `
    SELECT
      loan_repayment_id,
      loan_id,
      user_id,
      repayment_order,
      total_payment_amount,
      amount_paid,
      status,
      payment_at
    FROM "personal_loan_payment_schedules" schedules
    WHERE schedules.loan_id = $1
    ORDER BY repayment_order ASC;
  `,
  updateMerchantUsers: `
    UPDATE merchant_users SET
      status = $3,
      updated_at = now()
    WHERE merchant_id = $1 and user_id = $2;
  `,
  countMerchantLoans: `
    SELECT count(*) as count
    FROM merchant_user_loans as mu_loans
    LEFT JOIN users ON mu_loans.user_id = users.user_id
    LEFT JOIN personal_loans pl ON mu_loans.loan_id = pl.loan_id
    WHERE
      mu_loans.merchant_id = $1
      AND ($2 IS NULL OR mu_loans.user_id = $2)
      AND ($3 IS NULL OR pl.status = $3)
      AND (
        $4 IS NULL
        OR TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) ILIKE TRIM($4)
        OR TRIM(CONCAT(users.first_name, ' ', users.last_name, ' ', users.middle_name)) ILIKE TRIM($4)
        OR TRIM(CONCAT(users.last_name, ' ', users.first_name, ' ', users.middle_name)) ILIKE TRIM($4)
        OR TRIM(CONCAT(users.last_name, ' ', users.middle_name, ' ', users.first_name)) ILIKE TRIM($4)
        OR TRIM(CONCAT(users.middle_name, ' ', users.first_name, ' ', users.last_name)) ILIKE TRIM($4)
        OR TRIM(CONCAT(users.middle_name, ' ', users.last_name, ' ', users.first_name)) ILIKE TRIM($4)
        OR email ILIKE TRIM($4)
        OR phone_number ILIKE TRIM($4)
      );
  `,
  fetchMerchantLoans: `
    SELECT
      users.user_id,
      users.first_name,
      users.last_name,
      users.middle_name,
      pl.loan_id,
      pl.amount_requested as loan_amount,
      pl.created_at date_requested,
      pl.loan_disbursed_at as date_disbursed,
      (
        SELECT COALESCE(SUM(amount_paid), 0)
        FROM personal_loan_payment_schedules
        WHERE loan_id = pl.loan_id
      ) AS repayment_amount,
      (
        SELECT COALESCE(SUM(total_payment_amount)) - COALESCE(SUM(amount_paid), 0)
        FROM personal_loan_payment_schedules
        WHERE loan_id = pl.loan_id
      ) AS outstanding_amount,
      (
        pl.total_repayment_amount +
        pl.processing_fee +
        pl.insurance_fee +
        pl.advisory_fee
      )as total_amount,
      pl.status as loan_status
    FROM merchant_user_loans as mu_loans
    LEFT JOIN users ON mu_loans.user_id = users.user_id
    LEFT JOIN personal_loans pl ON mu_loans.loan_id = pl.loan_id
    WHERE
      mu_loans.merchant_id = $3
      AND ($4 IS NULL OR mu_loans.user_id = $4)
      AND ($5 IS NULL OR pl.status = $5)
      AND (
        $6 IS NULL
        OR TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) ILIKE TRIM($6)
        OR TRIM(CONCAT(users.first_name, ' ', users.last_name, ' ', users.middle_name)) ILIKE TRIM($6)
        OR TRIM(CONCAT(users.last_name, ' ', users.first_name, ' ', users.middle_name)) ILIKE TRIM($6)
        OR TRIM(CONCAT(users.last_name, ' ', users.middle_name, ' ', users.first_name)) ILIKE TRIM($6)
        OR TRIM(CONCAT(users.middle_name, ' ', users.first_name, ' ', users.last_name)) ILIKE TRIM($6)
        OR TRIM(CONCAT(users.middle_name, ' ', users.last_name, ' ', users.first_name)) ILIKE TRIM($6)
        OR email ILIKE TRIM($6)
        OR phone_number ILIKE TRIM($6)
      )
    ORDER BY mu_loans.created_at DESC
    OFFSET $1 LIMIT $2;
  `,
  updateMerchantPassword: `
    UPDATE merchants
    SET
        password = $2,
        updated_at = NOW(),
        status = 'active',
        is_created_password = true
    WHERE merchant_id = $1
    RETURNING first_name, last_name, email, merchant_id
  `,

  setNewMerchantPassword: `
    UPDATE merchants
    SET
      updated_at = NOW(),
      status = 'active',
      is_created_password = TRUE,
      password = $2
    WHERE merchant_id = $1
    RETURNING merchant_id, status, is_created_password`,

  fetchMerchantPassword: `
      SELECT id, merchant_id, password
      FROM merchants
      WHERE merchant_id = $1`,

  getMerchantByEmailV2: `
<<<<<<< Updated upstream
    SELECT id, merchant_id, first_name, last_name, status, email, phone_number,
     verification_token_request_count, invalid_verification_token_count, gender, created_at, updated_at
=======
    SELECT id, merchant_id, first_name, last_name, status, email, phone_number, verification_token_request_count, 
    invalid_verification_token_count, gender, created_at, updated_at
>>>>>>> Stashed changes
    FROM merchants
    WHERE email = $1;
  `,

  fetchMerchantByVerificationOTP: `
    SELECT id, email, merchant_id, verification_token, verification_token_expires, is_created_password, verification_token_request_count, invalid_verification_token_count, otp
    FROM merchants
    WHERE verification_token = $1 AND merchant_id = $2`,

  updateMerchantInvalidOtpCount: `
    UPDATE merchants
    SET
      updated_at = NOW(),
      invalid_verification_token_count = invalid_verification_token_count + 1
    WHERE merchant_id = $1`,

  updateAdminInvalidOtpCount: `
    UPDATE merchants
    SET
      updated_at = NOW(),
      invalid_verification_token_count = invalid_verification_token_count + 1
    WHERE merchant_id = $1`,

  deactivateMerchant: `
    UPDATE merchants
    SET
      updated_at = NOW(),
      status = 'deactivated'
    WHERE merchant_id = $1`
};
