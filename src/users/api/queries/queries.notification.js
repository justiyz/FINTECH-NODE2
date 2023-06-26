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
      personal_loans.id,
      personal_loans.loan_id,
      personal_loans.user_id,
      CONCAT(users.first_name, users.last_name) AS name,
      personal_loans.status,
      users.fcm_token
    FROM  personal_loans
    LEFT JOIN users On users.user_id = personal_loans.user_id
    WHERE personal_loans.status = 'over due';
    `
};
