export default {
  createUserActivityLogs: `
        INSERT INTO user_activity_logs (
            user_id, 
            activity_type, 
            activity_status
        )VALUES($1, $2, $3)`
};

