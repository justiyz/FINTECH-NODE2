export default {
  createAdminActivityLogs: `
    INSERT INTO merchant_admin_activity_logs (
        merchant_admin_id, 
        activity_type,
        activity_status,
        description
    )VALUES($1, $2, $3, $4)`
};
