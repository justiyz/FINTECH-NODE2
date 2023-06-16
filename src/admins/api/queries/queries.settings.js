export default {
  fetchEnvValues: `
        SELECT 
            id,
            env_id,
            name,
            value,
            description,
            created_at
        FROM admin_env_values_settings
        ORDER BY id`,

  updateEnvValues: `
        UPDATE admin_env_values_settings
        SET updated_at = NOW(),
            value = $2
        WHERE env_id = $1  
    `

};
