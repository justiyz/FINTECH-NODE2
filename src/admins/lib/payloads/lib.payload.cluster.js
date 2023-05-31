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
    body.percentage_interest_type_value
  ],
  clusterInvite: (body, cluster, admin, type, invitedUser) => [
    cluster.cluster_id,
    admin.admin_id,
    body.email?.trim().toLowerCase() || body.phone_number?.trim(),
    type,
    invitedUser?.user_id || null
  ]
};

