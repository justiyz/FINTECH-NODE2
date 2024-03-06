export default {
  editUserStatus: `
    UPDATE users
    SET
      updated_at = NOW(),
      status = $2
    WHERE user_id = $1`,

  addBlacklistedBvn: `
    INSERT INTO blacklisted_bvns(
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      bvn
    ) VALUES ($1, $2, $3, $4, $5)`,

  removeBlacklistedBvn: `
    DELETE FROM blacklisted_bvns
    WHERE id = $1`,

  resetUserVerificationCount: `
    UPDATE users
    SET
      updated_at = NOW(),
      status = 'active',
      verification_token_request_count = '0',
      invalid_verification_token_count = '0'
    WHERE user_id = $1`,

  restoreDeletedUserAccount: `
    UPDATE users
    SET
      updated_at = NOW(),
      status = 'active',
      verification_token_request_count = '0',
      invalid_verification_token_count = '0',
      is_deleted = FALSE
    WHERE user_id = $1`,

  addUnBlacklistedBvn: `
    INSERT INTO unblacklisted_bvns(
      first_name,
      middle_name,
      last_name,
      date_of_birth,
      bvn
    ) VALUES ($1, $2, $3, $4, $5)`,

  fetchAllExistingBlacklistedBvns: `
      SELECT id, bvn
      FROM blacklisted_bvns
      WHERE bvn IS NOT NULL`,

  getUserByUserId: `
    SELECT id, phone_number, user_id, email, title, first_name, middle_name, last_name, tier, gender,
    TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS name,
      to_char(DATE (date_of_birth)::date, 'DDth Month, YYYY') AS date_of_birth, image_url, bvn,
      is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin,
      is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code,
      number_of_children, marital_status, loan_status, verification_token_request_count, invalid_verification_token_count,
       to_char(DATE (created_at)::date, 'DDth Month, YYYY') AS date_created, (unclaimed_reward_points + claimed_reward_points) AS total_available_reward_points, bvn
    FROM users
    WHERE user_id = $1`,

  getUserByUserEmailOrPhoneNumber: `
    SELECT id, phone_number, user_id, email, title, first_name, middle_name, last_name, tier, gender,
    TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS name,
      to_char(DATE (date_of_birth)::date, 'DDth Month, YYYY') AS date_of_birth, image_url, bvn,
      is_verified_phone_number, is_verified_email, is_verified_bvn, is_uploaded_selfie_image, is_created_password, is_created_pin,
      is_completed_kyc, is_uploaded_identity_card, status, fcm_token, is_deleted, referral_code,
      number_of_children, marital_status, loan_status, verification_token_request_count, invalid_verification_token_count,
       to_char(DATE (created_at)::date, 'DDth Month, YYYY') AS date_created
    FROM users
    WHERE (email = $1 OR phone_number = $1)`,

  getUserEmploymentDetails: `
    SELECT
      user_id,
      employment_type,
      company_name,
      school_name,
      date_started,
      monthly_income,
      next_update AS employment_next_update
    FROM employment_type
    WHERE user_id = $1`,

  getUserAddressDetails: `
    SELECT
      id,
      user_id,
      (CONCAT(house_number, ' ', street, ' ', city, ' city', ' ', lga, ' lga', ' ', state, ' state', ' ', country)) AS address,
      house_number,
      street,
      city,
      state,
      country,
      is_verified_address,
      is_verified_utility_bill,
      address_image_url,
      you_verify_address_verification_status,
      is_editable,
      can_upload_utility_bill,
      type_of_residence,
      rent_amount,
      landmark,
      created_at
    FROM address_verification
    WHERE user_id = $1`,

  fechUserBVNRecord: `
    SELECT bvn
    FROM users
    WHERE user_id = $1
  `,

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
      AND is_deleted = false
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

  fetchUsers: `
      SELECT
        users.id,
        users.user_id,
        TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) AS name,
        users.email,
        users.tier,
        to_char(DATE (users.created_at)::date, 'Mon DD YYYY') As date,
        users.loan_status,
        employment_type.employment_type,
        users.status,
        users.bvn
      FROM users
      LEFT JOIN employment_type
      ON users.user_id = employment_type.user_id
      WHERE (TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.first_name, ' ', users.last_name, ' ', users.middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.last_name, ' ', users.first_name, ' ', users.middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.last_name, ' ', users.middle_name, ' ', users.first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.middle_name, ' ', users.first_name, ' ', users.last_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.middle_name, ' ', users.last_name, ' ', users.first_name)) ILIKE TRIM($1)
        OR email ILIKE TRIM($1)
        OR phone_number ILIKE TRIM($1)
        OR $1 IS NULL)
      AND (users.status = $2 OR $2 IS NULL)
      AND ((users.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
      AND (users.loan_status = $5 OR $5 IS NULL) AND users.is_completed_kyc = true
      ORDER BY users.created_at DESC
      OFFSET $6
      LIMIT $7`,

  fetchAllUsers: `
        SELECT
        users.id,
        users.user_id,
        users.email,
        TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) AS name,
        users.tier,
        to_char(DATE (users.created_at)::date, 'Mon DD YYYY') As date,
        users.loan_status,
        employment_type.employment_type,
        users.status
      FROM users
      LEFT JOIN employment_type
      ON users.user_id = employment_type.user_id
      WHERE (TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.first_name, ' ', users.last_name, ' ', users.middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.last_name, ' ', users.first_name, ' ', users.middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.last_name, ' ', users.middle_name, ' ', users.first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.middle_name, ' ', users.first_name, ' ', users.last_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(users.middle_name, ' ', users.last_name, ' ', users.first_name)) ILIKE TRIM($1)
        OR TRIM(users.email) ILIKE TRIM($1)
        OR TRIM(users.phone_number) ILIKE TRIM($1)
        OR $1 IS NULL)
      AND (users.status = $2 OR $2 IS NULL)
      AND ((users.created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
      AND (users.loan_status = $5 OR $5 IS NULL) AND users.is_completed_kyc = true
      ORDER BY users.created_at DESC
      `,

  fetchUsersCount: `
      SELECT COUNT(user_id) AS total_count
      FROM users
      WHERE (TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(first_name, ' ', last_name, ' ', middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(last_name, ' ', first_name, ' ', middle_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(last_name, ' ', middle_name, ' ', first_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(middle_name, ' ', first_name, ' ', last_name)) ILIKE TRIM($1)
        OR TRIM(CONCAT(middle_name, ' ', last_name, ' ', first_name)) ILIKE TRIM($1)
        OR $1 IS NULL)
      AND (status = $2 OR $2 IS NULL)
      AND ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
      AND (loan_status = $5 OR $5 IS NULL) AND is_completed_kyc = true
    `,

  uploadUserDocument: `
    INSERT INTO user_admin_uploaded_documents (
      user_id,
      uploaded_by,
      document_title,
      image_url
    ) VALUES ($1, $2, $3, $4)
    RETURNING id, user_id, document_title, uploaded_by, created_at`,

  uploadProductImage: `
    INSERT INTO uploaded_documents (
        uploaded_by,
        document_title,
        image_url
    ) VALUES ($1, $2, $3)
    RETURNING id, file_id, image_url, uploaded_by, created_at
  `,

  fetchUploadedUserDocuments: `
      SELECT
        id,
        user_id,
        uploaded_by,
        document_title,
        image_url,
        created_at
      FROM user_admin_uploaded_documents
      WHERE user_id = $1`,

  fetchUserKycDetails: `
    SELECT
      users.user_id,
      users.tier,
      users.is_verified_bvn,
      users.is_completed_kyc,
      users.is_uploaded_identity_card,
      user_national_id_details.image_url AS valid_id_image_url,
      address_verification.is_verified_address,
      address_verification.is_verified_utility_bill,
      address_verification.address_image_url AS utility_bill_image_url
    FROM users
    LEFT JOIN user_national_id_details ON user_national_id_details.user_id = users.user_id
    LEFT JOIN address_verification ON address_verification.user_id = users.user_id
    WHERE users.user_id = $1`,

  declineUserUploadedUtilityBill: `
    UPDATE address_verification
    SET
      updated_at = NOW(),
      address_image_url = null,
      can_upload_utility_bill = TRUE
    WHERE user_id = $1
    RETURNING id, user_id, address_image_url, is_verified_address, is_verified_utility_bill, can_upload_utility_bill, is_editable`,

  approveUserUploadedUtilityBill: `
    UPDATE address_verification
    SET
      updated_at = NOW(),
      is_verified_utility_bill = TRUE,
      can_upload_utility_bill = FALSE
    WHERE user_id = $1
    RETURNING id, user_id, address_image_url, is_verified_address, is_verified_utility_bill, can_upload_utility_bill, is_editable`,

  updateUserTier: `
    UPDATE users
    SET
      updated_at = NOW(),
      tier = $2
    WHERE user_id = $1`,

  fetchUserClusterDetails: `
    SELECT
      clusters.id,
      clusters.cluster_id,
      clusters.name,
      TRIM(CONCAT(users.first_name, ' ', users.middle_name, ' ', users.last_name)) AS created_by,
      clusters.minimum_monthly_income,
      clusters.current_members,
      clusters.type
    FROM clusters
    LEFT JOIN cluster_members ON cluster_members.cluster_id = clusters.cluster_id
    LEFT JOIN users ON users.user_id = clusters.created_by
    WHERE cluster_members.user_id = $1
    AND clusters.is_deleted = FALSE
    AND cluster_members.is_left = FALSE
    AND clusters.is_created_by_admin = FALSE;
`,
  fetchUserClusterDetailsForAdmin: `
    SELECT
      clusters.id,
      clusters.cluster_id,
      clusters.name,
      TRIM(CONCAT('Admin', ' ', admins.first_name, ' ', admins.last_name)) AS created_by,
      clusters.minimum_monthly_income,
      clusters.current_members,
      clusters.type
    FROM clusters
    LEFT JOIN cluster_members ON cluster_members.cluster_id = clusters.cluster_id
    LEFT JOIN admins ON clusters.created_by = admins.admin_id
    WHERE cluster_members.user_id = $1
    AND clusters.is_deleted = FALSE
    AND cluster_members.is_left = FALSE
    AND clusters.is_created_by_admin = TRUE;
`,

  fetchClusterMemberDetails: `
    SELECT
      id,
      cluster_id,
      user_id,
      status
    FROM cluster_members
    WHERE user_id = $1
    AND cluster_id = $2
    AND is_left = FALSE`,

  fetchUserClusterMembers: `
    SELECT
      cluster_members.id,
      cluster_members.cluster_id,
      cluster_members.user_id,
      TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS member_name,
      to_char(DATE (cluster_members.created_at)::date, 'Mon DD, YYYY') As created_at,
      cluster_members.status,
      cluster_members.is_admin,
      cluster_members.is_left
    FROM cluster_members
    LEFT JOIN users ON users.user_id = cluster_members.user_id
    WHERE cluster_members.is_left = FALSE
    AND cluster_members.cluster_id = $1`,

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
        is_deleted
    FROM clusters
    WHERE cluster_id = $1`,

  fetchClusterById: `
    SELECT
      clusters.id,
      clusters.cluster_id,
      clusters.name,
      TRIM(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS created_by,
      clusters.minimum_monthly_income,
      clusters.current_members,
      clusters.type
    FROM clusters
    LEFT JOIN users ON users.user_id = clusters.created_by
    WHERE clusters.cluster_id =$1
  `,

  getUsersForNotifications: `
    SELECT
      id,
      user_id,
      email,
      first_name,
      last_name,
      fcm_token,
      INITCAP(CONCAT(first_name, ' ', middle_name, ' ', last_name)) AS name
    FROM users
    WHERE user_id = $1
    AND is_completed_kyc = TRUE
    AND is_deleted = FALSE
  `,

  fetchUserFcmTOken: `
      SELECT fcm_token
      FROM users
      WHERE user_id = $1`,

  fetchUserRewardHistory: `
        SELECT
            user_id,
            reward_id,
            reward_description,
            to_char(DATE (created_at)::date, 'DD Month, YYYY') AS date_earned,
            type,
            point_reward
        FROM reward_points_tracking
        WHERE user_id = $1
        ORDER BY created_at DESC
        OFFSET $2
        LIMIT $3
  `,

  fetchUserRewardHistoryCount: `
      SELECT COUNT(reward_id) AS total_count
      FROM reward_points_tracking
      WHERE user_id = $1
  `,

  fetchBankAccountDetailsByUserId: `
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
      WHERE user_id =$1
      AND is_deleted = false
      `,

  fetchCardsById: `
      SELECT id, user_id, card_type, is_default, tokenising_platform, auth_token
      FROM user_debit_cards
      WHERE id = $1`,

  updateUserProfile: `
      UPDATE users
      SET
        updated_at = NOW(),
        email = $2,
        phone_number = $3,
        date_of_birth = $4,
        gender = $5,
        number_of_children = $6,
        marital_status = $7,
        first_name = $8,
        middle_name = $9,
        last_name = $10,
        tier = $11
      WHERE user_id = $1
      RETURNING user_id, first_name, middle_name, last_name, date_of_birth, gender, email, phone_number, number_of_children, marital_status, next_profile_update
   `,

  updateEmploymentDetails: `
    UPDATE employment_type
    SET
      updated_at = NOW(),
      employment_type = $2,
      company_name = $3,
      school_name = $4,
      date_started = $5,
      monthly_income = $6
    WHERE user_id = $1
    RETURNING user_id, employment_type, next_update, monthly_income
    `,

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
      rent_amount = $10
    WHERE user_id = $1
    RETURNING *`,

  updateUserNextOfKin: `
    UPDATE next_of_kin
    SET
      updated_at = NOW(),
      first_name = $2,
      last_name = $3,
      phone_number = $4,
      email = $5,
      kind_of_relationship = $6
    WHERE user_id = $1
    RETURNING *`,

  fetchAllDetailsBelongingToUser: `
    SELECT * FROM users WHERE user_id = $1`,

};


