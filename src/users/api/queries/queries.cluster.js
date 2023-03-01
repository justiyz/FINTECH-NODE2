export default {
  checkIfClusterIsUnique: `
    SELECT 
        id,
        cluster_id,
        name,
        description, 
        type,
        unique_code,
        status,
        loan_status,
        is_deleted
    FROM clusters
    WHERE name = $1
    OR unique_code = $1`,

  fetchClusterGraceOpenPeriod: `
    SELECT
        id,
        env_id,
        name,
        value
    FROM admin_env_values_settings
    WHERE name = $1`,

  createCluster: `
    INSERT INTO clusters(
        name,
        description,
        type,
        maximum_members,
        current_members,
        loan_goal_target,
        minimum_monthly_income,
        created_by,
        admin,
        unique_code,
        join_cluster_closes_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *`,

  createClusterMember: `
    INSERT INTO cluster_members(
        cluster_id,
        user_id,
        is_admin
    ) VALUES ($1, $2, $3)
    RETURNING *`
};

