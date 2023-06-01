export default {
  updateAdminProfile: `
    UPDATE admins
    SET 
      updated_at = NOW(),
      is_completed_profile = TRUE,
      first_name = $2,
      last_name = $3,
      phone_number = $4,
      gender = $5
    WHERE admin_id = $1
    RETURNING id, admin_id, first_name, last_name, gender, role_type, image_url, email, is_created_password, is_verified_email, is_completed_profile, status`,

  createAdminUserPermissions: `
    INSERT INTO admin_user_permissions(
      admin_id, resource_id, permissions
    ) VALUES($1, $2, $3)`,

  checkIfResourcePermissionCreated: `
    SELECT permissions
    FROM admin_user_permissions
    WHERE admin_id = $1
    AND resource_id = $2`,

  editAdminUserPermissions: `
    UPDATE admin_user_permissions
    SET 
    updated_at = NOW(),
    permissions = $3
    WHERE admin_id = $1
    AND resource_id = $2`,
    
  getAdminByEmail: `
    SELECT id, admin_id, role_type, email, phone_number, first_name, last_name, gender, image_url,
      is_verified_email, is_created_password, is_completed_profile, status, is_deleted
    FROM admins
    WHERE email = $1`,

  getAdminByPhoneNumber: `
    SELECT id, admin_id, role_type, email, phone_number, first_name, last_name, gender, image_url,
      is_verified_email, is_created_password, is_completed_profile, status, is_deleted
    FROM admins
    WHERE phone_number = $1`,

  getAdminByAdminId: `
    SELECT id, admin_id, role_type, email, phone_number, first_name, last_name, gender, image_url,
      is_verified_email, is_created_password, is_completed_profile, status, is_deleted
    FROM admins
    WHERE admin_id = $1`,

  inviteAdmin: `
    INSERT INTO admins (
      first_name, 
      last_name, 
      email,
      role_type,
      password,
      status
    )VALUES($1, $2, $3, $4, $5, 'active')
    RETURNING admin_id,  first_name, 
    last_name, 
    email`,

  fetchAllAdmin: `
    SELECT 
    count(*) OVER() AS total,
    admin_id,
    admin_roles.name AS role, 
    email, 
    CONCAT(first_name, ' ', last_name) AS name,
    to_char(DATE (admins.created_at)::date, 'Mon DD YYYY') AS date,
    admins.status
    FROM admins
    LEFT JOIN admin_roles ON admin_roles.code = admins.role_type
    WHERE admins.status = $1 OR $1 is null
    AND  admins.created_at::date BETWEEN $2 AND $3
    ORDER BY admins.created_at DESC
    OFFSET $4 LIMIT $5
  `,

  fetchAdmins: `
    SELECT 
    count(*) OVER() AS total,
    admin_id,
    admin_roles.name AS role, 
    email, 
    CONCAT(first_name, ' ', last_name) AS name,
    to_char(DATE (admins.created_at)::date, 'Mon DD YYYY') AS date,
    admins.status
    FROM admins
    LEFT JOIN admin_roles ON admin_roles.code = admins.role_type
    WHERE admins.status = $1 OR $1 is null
    AND  admins.created_at::date BETWEEN $2 AND $3
  `,

  fetchAndSearchAllAdmin: `
      SELECT 
      count(*) OVER() AS total,
      admin_id,
      admin_roles.name AS role, 
      email, 
      CONCAT(first_name, ' ', last_name) AS name,
      to_char(DATE (admins.created_at)::date, 'Mon DD YYYY') AS date,
      admins.status
      FROM admins
      LEFT JOIN admin_roles ON admin_roles.code = admins.role_type
      WHERE (TRIM(CONCAT(admins.first_name, ' ', admins.last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(admins.last_name, ' ', admins.first_name)) ILIKE TRIM($1) 
      OR $1 IS NULL)
      ORDER BY admins.created_at DESC
      OFFSET $2 LIMIT $3
  `,
  fetchAndSearchAdmins: `
      SELECT 
      count(*) OVER() AS total,
      admin_id,
      admin_roles.name AS role, 
      email, 
      CONCAT(first_name, ' ', last_name) AS name,
      to_char(DATE (admins.created_at)::date, 'Mon DD YYYY') AS date,
      admins.status
      FROM admins
      LEFT JOIN admin_roles ON admin_roles.code = admins.role_type
      WHERE (TRIM(CONCAT(admins.first_name, ' ', admins.last_name)) ILIKE TRIM($1) 
      OR TRIM(CONCAT(admins.last_name, ' ', admins.first_name)) ILIKE TRIM($1) 
      OR $1 IS NULL)
      ORDER BY admins.created_at DESC
  `,

  editAdminStatus: `
      UPDATE admins
      SET
      updated_at = NOW(),
      status = $2
      WHERE admin_id = $1
      RETURNING *
    `,

  updateUserRoleType: `
    UPDATE admins
    SET 
      updated_at = NOW(),
      role_type = $2
    WHERE admin_id = $1`,

  totalLoanApproved: `
    SELECT COUNT(status) 
    FROM personal_loans 
    WHERE ((status = 'approved') 
      OR (status = 'processing') 
      OR (status = 'ongoing') 
      OR (status = 'over due') 
      OR (status = 'completed')) 
    AND ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
      OR ($1 IS NULL AND $2 IS NULL))`,

  totalLoanRejected: `
    SELECT COUNT(status) 
    FROM personal_loans 
    WHERE status = 'declined'
    AND ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
      OR ($1 IS NULL AND $2 IS NULL))`,

  totalDisbursedLoan: `
    SELECT SUM(amount) 
    FROM personal_loan_disbursements 
    WHERE ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
      OR ($1 IS NULL AND $2 IS NULL))`,


  totalRegisteredCustomers: `
      SELECT COUNT(user_id) 
      FROM users
      WHERE is_deleted = FALSE 
      AND ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
        OR ($1 IS NULL AND $2 IS NULL)) AND is_completed_kyc = true`,

  fetchDetailsOfPaidLoans: `
    SELECT 
      id,
      loan_repayment_id,
      loan_id,
      user_id,
      repayment_order,
      total_payment_amount,
      payment_at,
      status,
      proposed_payment_date,
      created_at
    FROM personal_loan_payment_schedules
    WHERE status = 'paid'
    AND (payment_at::DATE BETWEEN $1::DATE AND $2::DATE)`,

  fetchDetailsOfUnpaidLoans: `
    SELECT 
      id,
      loan_repayment_id,
      loan_id,
      user_id,
      repayment_order,
      total_payment_amount,
      payment_at,
      status,
      proposed_payment_date,
      created_at
    FROM personal_loan_payment_schedules
    WHERE status != 'paid'
    AND (proposed_payment_date::DATE BETWEEN $1::DATE AND $2::DATE)`,

  totalLoanRepayment: `
    SELECT SUM(total_payment_amount) 
    FROM personal_loan_payment_schedules 
    WHERE status = 'paid'
    AND ((payment_at::DATE BETWEEN $1::DATE AND $2::DATE) 
      OR ($1 IS NULL AND $2 IS NULL))`,

  totalLoanOverDue: `
    SELECT SUM(total_payment_amount) 
    FROM personal_loan_payment_schedules 
    WHERE status = 'over due'
    AND ((proposed_payment_date::DATE BETWEEN $1::DATE AND $2::DATE) 
      OR ($1 IS NULL AND $2 IS NULL))`,

  fetchDetailsOfAppliedLoans: `
    SELECT 
      id,
      loan_id,
      user_id,
      amount_requested,
      loan_tenor_in_months,
      total_repayment_amount,
      status,
      loan_decision,
      created_at
    FROM personal_loans
    WHERE (created_at::DATE BETWEEN $1::DATE AND $2::DATE)`,

  fetchDetailsOfApprovedLoans: `
    SELECT 
      id,
      loan_id,
      user_id,
      amount_requested,
      loan_tenor_in_months,
      total_repayment_amount,
      status,
      loan_decision,
      created_at
    FROM personal_loans
    WHERE ((status = 'approved') 
      OR (status = 'processing') 
      OR (status = 'ongoing') 
      OR (status = 'over due') 
      OR (status = 'completed')) 
    AND (created_at::DATE BETWEEN $1::DATE AND $2::DATE)`,

  fetchTotalClusterCount: `
    SELECT COUNT(cluster_id) 
    FROM clusters
    WHERE is_deleted = FALSE 
    AND ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
      OR ($1 IS NULL AND $2 IS NULL))`,

  fetchPrivateClusterCount: `
    SELECT COUNT(cluster_id) 
    FROM clusters
    WHERE type = 'private'
    AND is_deleted = FALSE 
    AND ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
      OR ($1 IS NULL AND $2 IS NULL))`,

  fetchPublicClusterCount: `
    SELECT COUNT(cluster_id) 
    FROM clusters
    WHERE type = 'public'
    AND is_deleted = FALSE 
    AND ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
      OR ($1 IS NULL AND $2 IS NULL))`,

  fetchRecentClusters: `
    SELECT
      id,
      cluster_id,
      name,
      description,
      type,
      current_members,
      created_at
    FROM clusters
    WHERE is_deleted = FALSE
    ORDER BY created_at DESC
    LIMIT 10`,

  totalTierOneUsers: `
    SELECT COUNT(user_id) 
    FROM users
    WHERE tier = '1'
    AND is_deleted = FALSE`,

  totalTierTwoUsers: `
    SELECT COUNT(user_id) 
    FROM users
    WHERE tier = '2'
    AND is_deleted = FALSE`,

  totalTierZeroUsers: `
    SELECT COUNT(user_id) 
    FROM users
    WHERE tier = '0'
    AND is_deleted = FALSE AND is_completed_kyc = true`,

  totalActiveLoanUsers: `
    SELECT COUNT(user_id) 
    FROM users
    WHERE loan_status = 'active'
    AND is_deleted = FALSE`,

  totalActiveUsers: `
    SELECT COUNT(user_id) 
    FROM users
    WHERE is_deleted = FALSE AND is_completed_kyc = true`,

  totalOverdueRepayment: `
    SELECT SUM(total_payment_amount) 
    FROM personal_loan_payment_schedules 
    WHERE status = 'over due'
    AND NOW()::DATE > (proposed_payment_date + interval '$1 day')::DATE`,
  
  totalExpectedRepayment: `
    SELECT SUM(total_payment_amount) 
    FROM personal_loan_payment_schedules 
    WHERE (status = 'paid' OR status = 'over due')`,

  fetchAdminSetEnvDetails: `
    SELECT 
      id,
      env_id,
      name,
      value
    FROM admin_env_values_settings
    WHERE name = $1`,

  fetchAndFilterActivityLog: `
    SELECT 
      admin_activity_logs.id,
      CONCAT(admins.first_name, ' ', admins.last_name) AS admin_name,
      admin_roles.name AS role,
      admin_activity_logs.description,
      to_char(admin_activity_logs.created_at AT TIME ZONE 'Africa/Lagos', 'Mon DD, YYYY') AS date,
      to_char(admin_activity_logs.created_at AT TIME ZONE 'Africa/Lagos', 'hh12:mi AM') AS time,
      admin_activity_logs.activity_status
    FROM admin_activity_logs
    LEFT JOIN admins ON admins.admin_id = admin_activity_logs.admin_id
    LEFT JOIN admin_roles ON admin_roles.code = admins.role_type
    WHERE (TRIM(CONCAT(admins.first_name, ' ', admins.last_name)) ILIKE TRIM($1) 
    OR TRIM(CONCAT(admins.first_name, ' ', admins.last_name)) ILIKE TRIM($1) 
    OR $1 IS NULL)
    AND ((admin_activity_logs.created_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL))
      ORDER BY admin_activity_logs.created_at DESC
      OFFSET $4
      LIMIT $5
  `,

  countFetchedActivityLog: `
      SELECT 
        COUNT(admin_activity_logs.id) AS total_count
        FROM admin_activity_logs
        LEFT JOIN admins ON admins.admin_id = admin_activity_logs.admin_id
        LEFT JOIN admin_roles ON admin_roles.code = admins.role_type
        WHERE (TRIM(CONCAT(admins.first_name, ' ', admins.last_name)) ILIKE TRIM($1) 
        OR TRIM(CONCAT(admins.first_name, ' ', admins.last_name)) ILIKE TRIM($1) OR $1 IS NULL)
        AND ((admin_activity_logs.created_at::DATE BETWEEN $2::DATE AND $3::DATE) OR ($2 IS NULL AND $3 IS NULL))
  `,
  averageOrrScore: `
    SELECT 
      AVG(percentage_orr_score::numeric) AS average_value
    FROM personal_loans
    WHERE ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
    OR ($1 IS NULL AND $2 IS NULL));
  `,

  totalObligation: `
    SELECT COUNT(id) AS total_obligation
    FROM personal_loans
    WHERE status = 'completed'
    AND ((created_at::DATE BETWEEN $1::DATE AND $2::DATE)
    OR ($1 IS NULL AND $2 IS NULL))
  `,

  profitReport: `
    SELECT 
      EXTRACT(MONTH FROM personal_loan_disbursements.created_at) AS month,
      SUM(personal_loan_disbursements.amount - personal_loan_payments.amount) AS profit
    FROM personal_loan_disbursements
    LEFT JOIN personal_loan_payments 
    ON  personal_loan_payments.loan_id = personal_loan_disbursements.loan_id
    AND (personal_loan_disbursements.created_at::DATE BETWEEN $1::DATE AND $2::DATE)
    GROUP BY month
  `,

  customerBase: `
  SELECT 
    COUNT(CASE WHEN gender = 'male' THEN 1 END) AS male,
    COUNT(CASE WHEN gender = 'female' THEN 1 END) AS female,
    COUNT(id) AS total_users
   FROM users
   WHERE is_deleted = FALSE 
   AND ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
     OR ($1 IS NULL AND $2 IS NULL))
     AND is_completed_kyc = true;
  `,

  loanTenor: `
  SELECT
  MAX(loan_tenor_in_months) AS highest_month_tenure,
  MIN(loan_tenor_in_months) AS lowest_month_tenure,
  (SELECT COUNT(id) FROM personal_loans WHERE loan_tenor_in_months = (SELECT MAX(loan_tenor_in_months) FROM personal_loans 
  WHERE created_at::DATE BETWEEN $1::DATE AND $2::DATE OR ($1 IS NULL AND $2 IS NULL))) AS count_highest_month,
  (SELECT COUNT(id) FROM personal_loans WHERE loan_tenor_in_months = (SELECT MIN(loan_tenor_in_months) FROM personal_loans 
  WHERE created_at::DATE BETWEEN $1::DATE AND $2::DATE OR ($1 IS NULL AND $2 IS NULL))) AS count_lowest_month
 FROM personal_loans
    WHERE ((created_at::DATE BETWEEN $1::DATE AND $2::DATE)
    OR ($1 IS NULL AND $2 IS NULL));
`,

  averageLoanTenor: `
    SELECT AVG(loan_tenor_in_months::numeric)::numeric(10) 
    FROM personal_loans
    WHERE is_loan_disbursed = 'true'
  `,

  rescheduledLoans: `
    SELECT SUM(total_repayment_amount) 
    FROM personal_loans
    WHERE is_rescheduled = 'true'
    AND ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
    OR ($1 IS NULL AND $2 IS NULL))
  `,

  fetchDetailsOfDisbursedLoans: `
    SELECT 
      disbursement_id,
      user_id,
      payment_id,
      recipient_id,
      status,
      amount,
      created_at   
    FROM personal_loan_disbursements 
    WHERE status = 'success'
    AND (created_at::DATE BETWEEN $1::DATE AND $2::DATE)
`,

  totalClusterGroups: `
    SELECT COUNT(cluster_id)
    FROM clusters
    WHERE is_deleted = 'false'
    AND ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
    OR ($1 IS NULL AND $2 IS NULL)) 
`,

  totalClusterLoanAmount: `
    SELECT SUM(total_loan_obligation)
    FROM clusters
    WHERE is_deleted = 'false'
    AND ((created_at::DATE BETWEEN $1::DATE AND $2::DATE) 
    OR ($1 IS NULL AND $2 IS NULL)) 
  `,

  totalClusterLoanDefaulters: `
      SELECT COUNT(user_id)
      FROM cluster_members
      WHERE loan_status = 'over due'
  `,

  fetchDetailsOftotalDisbursedClusterLoan: `
        SELECT
        cluster_id,
        name,
        type,
        loan_amount
      FROM clusters
      WHERE loan_status = 'active'
      AND (created_at::DATE BETWEEN $1::DATE AND $2::DATE)
  `
};


    
