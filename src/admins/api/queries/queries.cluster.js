export default {
  createCluster: `
    INSERT INTO clusters(
        name,
        description,
        type,
        maximum_members,
        current_members,
        loan_goal_target,
        minimum_monthly_income,
        is_created_by_admin,
        unique_code,
        join_cluster_closes_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
  fetchClustersDetails:
    `SELECT
          id,
          cluster_id,
          name,
          description,
          type,
          maximum_members,
          loan_status,
          status,
          created_at
    FROM clusters 
    WHERE (name ILIKE TRIM($1) OR $1 IS NULL) AND (status = $2 OR $2 IS NULL) AND (loan_status = $3 OR $3 IS NULL)
     AND is_deleted = false AND is_created_by_admin = true
    ORDER BY created_at DESC
    OFFSET $4
    LIMIT $5
`,
  fetchClusterCount: `
    SELECT COUNT(cluster_id) AS total_count
    FROM clusters
    WHERE (name ILIKE TRIM($1) OR $1 IS NULL) AND (status = $2 OR $2 IS NULL) AND (loan_status = $3 OR $3 IS NULL)
    AND is_deleted = false AND is_created_by_admin = true
`,
  fetchSingleClusterDetails: `
    SELECT  
        id,
        cluster_id,
        name as cluster_name,
        type,
        loan_amount,
        to_char(DATE (created_at)::date, 'Mon DD YYYY') As created_date,
        description,
        current_members
    FROM clusters
    WHERE cluster_id = $1 AND is_deleted = false
`,
  fetchClusterMembersDetails: `
    SELECT 
        CONCAT(first_name, ' ', last_name) as name,
        to_char(DATE (cluster_members.created_at)::date, 'Mon DD YYYY') As date_joined,
        cluster_members.status
    FROM cluster_members
    LEFT JOIN users
    ON cluster_members.user_id = users.user_id
    WHERE cluster_id = $1 AND is_left = false
    `
};


