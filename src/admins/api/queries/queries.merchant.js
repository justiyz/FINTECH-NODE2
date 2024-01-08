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
      advisory_fee
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
    ) RETURNING merchant_id;
  `,
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
        OR TRIM(business_name) ILIKE TRIM($1 || '%')
        OR TRIM(email) ILIKE TRIM($1 || '%')
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
      users.status,
      users.bvn
    FROM merchant_users AS mu
    LEFT JOIN users ON mu.user_id = users.user_id
    WHERE mu.user_id = $1 AND mu.merchant_id = $2;
  `,
  fetchMerchantUsers: `
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
      employment_type.employment_type,
      users.status,
      users.bvn,
      pl.amount_requested AS loan_amount,
      pl.loan_tenor_in_months AS loan_duration,
      pl.loan_disbursed_at AS date_received
    FROM merchant_users AS mu
    LEFT JOIN users ON mu.user_id = users.user_id
    LEFT JOIN employment_type ON users.user_id = employment_type.user_id
    LEFT JOIN personal_loans pl ON users.user_id = pl.user_id
      AND pl.status IN ('pending', 'approved', 'ongoing', 'over due')
    WHERE
      (
        TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.first_name, ' ', users.last_name, ' ', users.middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.last_name, ' ', users.first_name, ' ', users.middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.last_name, ' ', users.middle_name, ' ', users.first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.middle_name, ' ', users.first_name, ' ', users.last_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.middle_name, ' ', users.last_name, ' ', users.first_name)) ILIKE TRIM($1)
        OR email ILIKE TRIM($1)
        OR phone_number ILIKE TRIM($1)
        OR $1 IS NULL
      )
      AND (users.status = $2 OR $2 IS NULL)
    ORDER BY users.created_at DESC
    OFFSET $3
    LIMIT $4;
  `,
  fetchMerchantUsersCount: `
    SELECT COUNT(*) AS total_count
    FROM merchant_users AS mu
    LEFT JOIN users ON mu.user_id = users.user_id
    WHERE
      (
        TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.first_name, ' ', users.last_name, ' ', users.middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.last_name, ' ', users.first_name, ' ', users.middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.last_name, ' ', users.middle_name, ' ', users.first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.middle_name, ' ', users.first_name, ' ', users.last_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.middle_name, ' ', users.last_name, ' ', users.first_name)) ILIKE TRIM($1)
        OR users.email ILIKE TRIM($1)
        OR users.phone_number ILIKE TRIM($1)
        OR $1 IS NULL
      )
      AND (users.status = $2 OR $2 IS NULL);
  `,
};
