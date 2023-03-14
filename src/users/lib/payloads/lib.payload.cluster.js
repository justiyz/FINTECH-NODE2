export default {
  createClusterPayload: (body, user) => [ 
    body.name.trim().toLowerCase(), 
    body.description.trim(), 
    body.type,
    body.maximum_members,
    1, // the cluster admin/creator
    body.loan_goal_target,
    body.minimum_monthly_income,
    user.user_id,
    user.user_id,
    body.clusterCode,
    body.join_cluster_closes_at
  ],
  inviteClusterMember: (body, cluster, user, invitedUser, type) => [
    cluster.cluster_id,
    user.user_id,
    body.email?.trim().toLowerCase() || body.phone_number?.trim(),
    type,
    invitedUser?.user_id || null
  ],
  editCluster: (body, cluster, params) => [
    params.cluster_id,
    body.name || cluster.name,
    body.description || cluster.description,
    body.maximum_members || cluster.maximum_members,
    body.loan_goal_target || cluster.loan_goal_target,
    body.minimum_monthly_income || cluster.minimum_monthly_income
  ],
  recordUserVoteDecision: (body, cluster, user, ticket_id) => [
    ticket_id,
    cluster.cluster_id,
    user.user_id,
    cluster.members[0]?.is_admin || false,
    body.decision
  ]
};
