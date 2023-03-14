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
      to_char(DATE (date_of_birth)::date, 'DDth Month, YYYY') AS date_of_birth, image_url, bvn,
      is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin, 
      is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code, address, income_range,
      number_of_dependents, marital_status, loan_status, employment_type, address, address_image_url, is_verified_address,
       to_char(DATE (created_at)::date, 'DDth Month, YYYY') AS date_created
    FROM users
    WHERE user_id = $1`,

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
      ORDER BY is_default DESC`,

  fetchUsers:`
      SELECT 
        id,
        user_id,
        CONCAT(first_name, ' ', last_name) AS name,
        tier,
        to_char(DATE (created_at)::date, 'Mon DD YYYY') As date,
        loan_status,
        employment_type,
        status
      FROM users
      WHERE (CONCAT(first_name, ' ', last_name) ILIKE TRIM($1) OR $1 IS NULL) AND (status = $2 OR $2 IS NULL) AND 
      ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL)) AND (loan_status = $5 OR $5 IS NULL)
      ORDER BY created_at DESC
      OFFSET $6
      LIMIT $7`,

  fetchAllUsers:`
        SELECT
        id,
        user_id,
        CONCAT(first_name, ' ', last_name) AS name,
        tier,
        to_char(DATE (created_at)::date, 'Mon DD YYYY') As date,
        loan_status,
        employment_type,
        status
      FROM users
      WHERE (CONCAT(first_name, ' ', last_name) ILIKE TRIM($1) OR $1 IS NULL) AND (status = $2 OR $2 IS NULL) AND 
      ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL)) AND (loan_status = $5 OR $5 IS NULL)
      ORDER BY created_at DESC
      `,

  fetchUsersCount: `
    SELECT COUNT(user_id) AS total_count
    FROM users
    WHERE (CONCAT(first_name, ' ', last_name) ILIKE TRIM($1) OR $1 IS NULL) AND (status = $2 OR $2 IS NULL) AND 
    ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
  `,
  
  fetchUserKycDetails: `
    SELECT 
      users.user_id, 
      tier,
      is_verified_bvn,
      is_completed_kyc,
      is_uploaded_identity_card,
      user_national_id_details.image_url
    FROM users
    LEFT JOIN user_national_id_details ON user_national_id_details.user_id = users.user_id 
    WHERE users.user_id = $1`,

  fetchUserClusterDetails: `
    SELECT
      name,
      CONCAT(users.first_name, ' ', users.last_name) AS created_by,
      minimum_monthly_income,
      current_members,
      type
    FROM clusters
    LEFT JOIN cluster_members ON cluster_members.cluster_id = clusters.cluster_id 
    LEFT JOIN users ON users.user_id = clusters.created_by
    WHERE cluster_members.user_id =$1
    AND clusters.is_deleted = FALSE AND cluster_members.is_left = FALSE;
    `,
  fetchClusterMemberDetails: `
  SELECT 
    cluster_id,
    user_id,
    status
  FROM cluster_members
  WHERE is_left = FALSE
  AND user_id = $1
  OR (user_id = $1 AND cluster_id = $2)
  `,
  fetchUserClusterMembers: `
  SELECT 
  CONCAT(users.first_name, ' ', users.last_name) AS member_name,
  cluster_members.created_at,
  cluster_members.status
FROM cluster_members
LEFT JOIN users ON users.user_id = cluster_members.user_id 
WHERE is_left = FALSE
AND cluster_members.cluster_id = $1
  `,
  checkIfClusterExists: `
    SELECT 
        id,
        cluster_id,
        name,
        description, 
        type,
        maximum_members,
        current_members,
        loan_goal_target,
        minimum_monthly_income,
        admin,
        image_url,
        unique_code,
        status,
        loan_status,
        total_loan_obligation,
        join_cluster_closes_at,
        is_deleted
    FROM clusters
    WHERE cluster_id = $1
`,
  fetchClusterById: `
  SELECT
  name,
  CONCAT(users.first_name, ' ', users.last_name) AS created_by,
  minimum_monthly_income,
  current_members,
  type
FROM clusters
LEFT JOIN users ON users.user_id = clusters.created_by
WHERE clusters.cluster_id =$1
  `
};
