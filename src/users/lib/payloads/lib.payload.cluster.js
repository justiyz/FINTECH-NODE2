export default {
  createClusterPayload: (body, user) => [ 
    body.name.trim().toLowerCase(), 
    body.description.trim().toLowerCase(), 
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
    body.type,
    type,
    invitedUser?.user_id || null
  ]
};
