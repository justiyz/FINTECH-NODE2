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
    RETURNING *`,

  fetchClusters: `
    SELECT 
        cluster_id,
        name,
        type,
        loan_goal_target,
        maximum_members,
        current_members
    FROM clusters
    ORDER BY join_cluster_closes_at DESC`,

  fetchUserClusters: `
    SELECT 
      cluster_id,
      name,
      type,
      loan_goal_target,
      maximum_members,
      current_members
	FROM clusters
	LEFT JOIN users
	ON clusters.created_by = users.user_id
	WHERE users.user_id = $1 AND clusters.is_deleted = 'false'
	ORDER BY clusters.loan_status DESC`,

  fetchUserCreatedClusters:`
   SELECT 
      clusters.cluster_id,
      name,
      type,
      loan_goal_target,
      maximum_members,
      current_members
   FROM clusters
   LEFT JOIN users
   ON clusters.created_by = users.user_id
   LEFT JOIN cluster_members
   ON  clusters.created_by = cluster_members.user_id
   WHERE users.user_id = $1 AND clusters.is_deleted = 'false' AND cluster_members.is_admin = 'true'
   GROUP BY clusters.cluster_id, name, type, loan_goal_target
   ORDER BY clusters.created_at DESC `,

  fetchClusterDetails:`
    SELECT 
      cluster_id,
      name,
      type,
      loan_goal_target,
      maximum_members,
      current_members,
      minimum_monthly_income
   FROM clusters
   WHERE cluster_id = $1 AND is_deleted = 'false'
  `
};

