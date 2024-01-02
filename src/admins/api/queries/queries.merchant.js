export default {
  createMerchant: `
    INSERT INTO merchants(
      business_name,
      email,
      phone_number,
      interest_rate,
      address,
      secret_key,
      orr_score_threshold
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7
    ) RETURNING merchant_id;
  `,
  fetchMerchantByMerchantId: `
    SELECT * FROM merchants WHERE merchant_id = $1;
  `,
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
    merchant_id,
    business_name,
    email,
    phone_number,
    status,
    interest_rate,
    address,
    orr_score_threshold,
    created_at
    FROM merchants
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
      orr_score_threshold,
      created_at
  `,
};
