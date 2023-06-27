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
    WHERE admin_resources.name = $1
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
      id, loan_id, user_id, status
    FROM  personal_loan_payment_schedules
    WHERE status = 'over due'
    AND NOW()::DATE > (proposed_payment_date + interval '$1 day')::DATE
    `,
  fetchAdminSetEnvDetails: `
    SELECT 
      id,
      env_id,
      name,
      value
    FROM admin_env_values_settings
    WHERE name = $1`
};
