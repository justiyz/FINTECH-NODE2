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
    ) RETURNING merchant_id;
  `,
  createMerchantAdmin: `
      INSERT INTO merchant_admins (
        merchant_id,
        first_name,
        last_name,
        email,
        phone_number,
        gender,
        password,
        verification_token,
        verification_token_expires
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
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
  fetchMerchantByEmailAndPhoneNo: `SELECT id FROM merchants WHERE email = $1 OR phone_number = $2;`,
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
};
