export const requestToJoinClusterNotification = (user, cluster) => {
  return `${user.first_name} ${user.last_name} wants to join ${cluster.name} loan group. She needs your approval to accept her into the Cluster group`;
};

export const inviteClusterMember = (data) => {
  return `${data.inviter} is inviting you to join ${data.name} Cluster loan group`;
};

export const initiateDeleteCluster = (user, cluster) => {
  return `${user.first_name} ${user.last_name}  is requesting to delete ${cluster.name} loan group. To grant her the permission to permanently delete this Cluster group. `;
};

export const selectNewAdmin = (user, cluster) => {
  return `${user.first_name} ${user.last_name}  have selected you to take over as the new admin of ${cluster.name} loan group. Kindly accept or decline `;
};
