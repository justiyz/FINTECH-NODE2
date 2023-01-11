export default {
  createAdminActivityLogs: `
    INSERT INTO admin_activity_logs (
        admin_id, 
        activity_type, 
        activity_status
    )VALUES($1, $2, $3)`
};
