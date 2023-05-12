export default {
  fetchClusters: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.loan_status,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  createClusterPayload: (body) => [ 
    body.name.trim().toLowerCase(), 
    body.description.trim(), 
    body.type,
    body.maximum_members,
    0, 
    body.loan_goal_target || 0,
    body.minimum_monthly_income,
    true,
    body.clusterCode,
    body.join_cluster_closes_at
  ]
};

