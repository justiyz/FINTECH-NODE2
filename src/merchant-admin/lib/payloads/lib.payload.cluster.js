export default { 
  fetchClusters: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status || null,
    query.loan_status || null,
    query.type === 'admin_cluster' || query.type === 'private' ? 'private' : !query.type ? null : 'public',
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  createClusterPayload: (body, admin) => [ 
    body.name.trim().toLowerCase(), 
    body.description.trim(), 
    'private',
    body.maximum_members, 
    0,
    body.loan_goal_target || 0,
    0,
    true,
    body.clusterCode,
    body.company_name,
    body.company_address,
    body.company_type,
    body.company_contact_number,
    body.interest_type,
    body.percentage_interest_type_value,
    admin.admin_id
  ],

  clusterInvite: (body, cluster, admin, type, invitedUser) => [
    cluster.cluster_id,
    admin.admin_id,
    body.email?.trim().toLowerCase() || body.phone_number?.trim(),
    type,
    invitedUser?.user_id || null
  ],

  clusterInterestRates: (body, cluster) => [
    cluster.cluster_id,
    body.interest_type || cluster.interest_type,
    body.percentage_interest_type_value || cluster.percentage_interest_type_value
  ]
};

