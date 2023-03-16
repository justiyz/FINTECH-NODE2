export const requestToJoinClusterNotification = (user, cluster) => {
  return `${user.first_name} ${user.last_name} wants to join ${cluster.name} cluster loan group. Your approval is needed`;
};

export const inviteClusterMember = (data) => {
  return `${data.inviter} is inviting you to join ${data.name} Cluster loan group`;
};

export const initiateDeleteCluster = (user, cluster) => {
  return `${user.first_name} ${user.last_name} is requesting to delete ${cluster.name} loan group. Kindly accept or decline this request to permanently delete the Cluster group. `;
};

export const selectNewAdmin = (user, cluster) => {
  return `${user.first_name} ${user.last_name} selected you to be the new cluster admin of ${cluster.name} loan group. Kindly accept or decline this request`;
};
