export default {
  fetchAdminsForNotification: `
    SELECT  
        admins.id,
        admins.admin_id,
        admin_resources.name,
        admins.role_type
    FROM admins
    LEFT JOIN admin_user_permissions ON admin_user_permissions.admin_id = admins.admin_id
    LEFT JOIN admin_resources ON admin_resources.resource_id = admin_user_permissions.resource_id
    WHERE admin_resources.name = $1 OR admins.role_type = 'SADM'
    `,
  fetchInViewLoanApplication: `
    SELECT
    id,
    loan_id,
    user_id,
    status
    FROM  personal_loans
    WHERE status = 'in review'
    AND user_id = $1;
    `,
  nonPerformingLoans: `
    SELECT
      personal_loan_payment_schedules.id,
      personal_loan_payment_schedules.loan_id, 
      personal_loan_payment_schedules.user_id, 
      personal_loan_payment_schedules.status,
      users.fcm_token,
      CONCAT(users.first_name, ' ', users.last_name) AS user_name
    FROM  personal_loan_payment_schedules
    LEFT JOIN users ON users.user_id = personal_loan_payment_schedules.user_id
    WHERE personal_loan_payment_schedules.status = 'over due'
    AND NOW()::DATE > (personal_loan_payment_schedules.proposed_payment_date + interval '$1 day')::DATE
    `,

  nonPerformingClusterLoans: `
    SELECT
    cluster_member_loan_payment_schedules.id, cluster_member_loan_payment_schedules.loan_id, users.user_id,  users.fcm_token,
    cluster_member_loan_payment_schedules.status, CONCAT(users.first_name, ' ', users.last_name) AS user_name
    FROM  cluster_member_loan_payment_schedules
    LEFT JOIN users ON users.user_id = cluster_member_loan_payment_schedules.user_id
    WHERE cluster_member_loan_payment_schedules.status = 'over due'
    AND NOW()::DATE > (cluster_member_loan_payment_schedules.proposed_payment_date + interval '$1 day')::DATE
    `,
  
  fetchAdminSetEnvDetails: `
    SELECT 
      id,
      env_id,
      name,
      value
    FROM admin_env_values_settings
    WHERE name = $1`,
    
  fetchEndingPromo: `
    SELECT id, promo_id, name, end_date
    FROM system_promos
    WHERE status IN ('cancelled', 'inactive')
      AND is_deleted = false
      AND current_date + interval '1 day' = end_date;
 `
};
