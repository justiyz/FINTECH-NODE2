export default {
  createCluster: `
  INSERT INTO clusters(
    name,
    description,
    type,
    maximum_members,
    current_members,
    loan_goal_target,
    minimum_monthly_income,
    is_created_by_admin,
    unique_code,
    company_name,
    company_address,
    company_type,
    company_contact_number,
    interest_type,
    percentage_interest_type_value,
    created_by
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
  RETURNING *`,

  fetchClustersDetails:
    `SELECT
          id,
          cluster_id,
          name,
          status,
          description,
          type,
          maximum_members,
          loan_status,
          status,
          is_created_by_admin,
          created_at
    FROM clusters 
    WHERE (name ILIKE TRIM($1) OR $1 IS NULL) AND (status = $2 OR $2 IS NULL) AND (loan_status = $3 OR $3 IS NULL)
    AND (type = $4 OR $4 IS NULL)
    AND is_deleted = false
    ORDER BY created_at DESC
    OFFSET $5
    LIMIT $6
`,

  fetchClusterCount: `
    SELECT COUNT(cluster_id) AS total_count
    FROM clusters
    WHERE (name ILIKE TRIM($1) OR $1 IS NULL) AND (status = $2 OR $2 IS NULL) AND (loan_status = $3 OR $3 IS NULL)
    AND (type = $4 OR $4 IS NULL)
    AND is_deleted = false
`,

  fetchAdminCreatedClustersDetails: `
      SELECT
          id,
          cluster_id,
          name,
          status,
          description,
          type,
          maximum_members,
          loan_status,
          status,
          is_created_by_admin,
          created_at
    FROM clusters 
    WHERE (name ILIKE TRIM($1) OR $1 IS NULL) AND (status = $2 OR $2 IS NULL) AND (loan_status = $3 OR $3 IS NULL)
    AND (type = $4 OR $4 IS NULL)
    AND is_deleted = false  AND is_created_by_admin = true
    ORDER BY created_at DESC
    OFFSET $5
    LIMIT $6
`,

  fetchAdminCreatedClustersCount: `
    SELECT COUNT(cluster_id) AS total_count
    FROM clusters
    WHERE (name ILIKE TRIM($1) OR $1 IS NULL) AND (status = $2 OR $2 IS NULL) AND (loan_status = $3 OR $3 IS NULL)
    AND (type = $4 OR $4 IS NULL) AND is_created_by_admin = true
    AND is_deleted = false
`,

  fetchSingleClusterDetails: `
    SELECT  
        id,
        cluster_id,
        status,
        name as cluster_name,
        type,
        total_loan_obligation, 
        loan_amount,
        to_char(DATE (created_at)::date, 'Mon DD YYYY') As created_date,
        description,
        current_members,
        is_created_by_admin,
        company_name,
        company_address,
        company_type,
        company_contact_number,
        interest_type,
        percentage_interest_type_value
    FROM clusters
    WHERE cluster_id = $1 AND is_deleted = false
`,
  fetchClusterMembersDetails: `
    SELECT 
        CONCAT(first_name, ' ', last_name) as name,
        to_char(DATE (cluster_members.created_at)::date, 'Mon DD YYYY') As date_joined,
        cluster_members.user_id,
        cluster_members.is_admin,
        cluster_members.is_left,
        cluster_members.loan_status,
        cluster_members.status
    FROM cluster_members
    LEFT JOIN users
    ON cluster_members.user_id = users.user_id
    WHERE cluster_id = $1 AND is_left = false
    `,

  adminInviteClusterMember: `
    INSERT INTO cluster_invitees(
         cluster_id,
         inviter_id,
         invitee,
         invitation_mode,
         invitee_id
       ) VALUES ($1, $2, $3, $4, $5)
       RETURNING *
    `,

  activateOrDeactivateCluster: `
      UPDATE clusters
      SET  updated_at = NOW(),
       status = $2
      WHERE cluster_id = $1
      RETURNING id, cluster_id, name, description,  type, status, is_deleted
    `,

  deleteClusterMember: `
    UPDATE cluster_members
    SET  updated_at = NOW(),
     is_left = TRUE,
     status = 'inactive'
    WHERE cluster_id = $1 AND user_id = $2
    RETURNING cluster_id, user_id, status, is_left;
    `,
    
  reduceClusterMembersCount: `
    UPDATE clusters
    SET 
      updated_at = NOW(),
      current_members = current_members::int - 1
    WHERE cluster_id = $1`,

  fetchClusterMember: `
      SELECT 
        id,
        cluster_id,
        user_id,
        status,
        loan_status,
        loan_obligation,
        is_admin,
        is_left
      FROM cluster_members
      WHERE cluster_id = $1 
      AND user_id = $2
      AND is_left = FALSE
  `,

  fetchActiveClusters: `
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
        is_deleted,
        current_members,
        is_created_by_admin,
        company_name,
        company_address,
        company_type,
        company_contact_number,
        interest_type,
        percentage_interest_type_value
    FROM clusters
    WHERE (cluster_id = $1 OR unique_code = $1 OR name = $1)
    AND is_deleted = FALSE`,

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
        is_deleted,
        current_members,
        is_created_by_admin,
        company_name,
        company_address,
        company_type,
        company_contact_number,
        interest_type,
        percentage_interest_type_value
    FROM clusters
    WHERE cluster_id = $1
    OR unique_code = $1 OR name = $1`,

  fetchActiveClusterMembers: `
  SELECT 
    cluster_members.id,
    cluster_members.cluster_id,
    cluster_members.user_id,
    cluster_members.status,
    cluster_members.loan_status,
    cluster_members.loan_obligation,
    cluster_members.is_admin,
    users.email,
    users.phone_number,
    cluster_members.is_left
  FROM cluster_members
  LEFT JOIN users ON users.user_id = cluster_members.user_id
  WHERE cluster_id = $1
  AND is_left = FALSE`,

  checkForOutstandingClusterLoanDecision: `
    SELECT * 
    FROM cluster_member_loans 
    WHERE loan_id = $1
    AND (is_taken_loan_request_decision = false OR status = 'in review')`,

  updateGeneralLoanApplicationCanDisburseLoan: `
    UPDATE cluster_loans
    SET 
      updated_at = NOW(),
      can_disburse_loan = true
    WHERE loan_id = $1`,
    
  fetchClustersInvitees: `
    SELECT 
      cluster_id,
      invitee,
      invitation_mode,
      to_char(DATE(created_at)::date, 'Mon DD YYYY') AS date,
      is_joined,
      is_declined,
      inviter_id 
    FROM cluster_invitees
    WHERE cluster_id = $1
    AND is_joined = false
    ORDER BY is_declined`,

  editClusterInterests: `
    UPDATE clusters
    SET  
      updated_at = NOW(),
      interest_type = $2,
      percentage_interest_type_value = $3
    WHERE cluster_id = $1
    RETURNING id, cluster_id, company_name, status, name, interest_type, percentage_interest_type_value, updated_at`
};


