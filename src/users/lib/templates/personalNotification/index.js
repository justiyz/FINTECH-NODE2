export const requestToJoinClusterNotification = (user, cluster) => {
  return `${user.first_name} ${user.last_name} wants to join ${cluster.name} loan group. She needs your approval to accept her into the Cluster group`;
};
