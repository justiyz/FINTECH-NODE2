export const rejectDebitCard = () => {
  return 'The debit card you inserted has been rejected, kindly insert a debit card that will not expire in 3 months time';
};

export const successfulLoanDisbursement = () => {
  return 'Request loan facility approved and disbursement completed';
};

export const requestToJoinCluster = (user, cluster) => {
  return `${user.first_name} ${user.last_name} wants to join ${cluster.name} cluster.`;
};

export const userJoinedYourCluster = (user, cluster) => {
  return `${user.first_name} ${user.last_name} has accepted to join ${cluster.name} cluster.`;
};

export const userDeclinedJoiningYourCluster = (user, cluster) => {
  return `${user.first_name} ${user.last_name} has declined to join ${cluster.name} cluster.`;
};

export const joinClusterRequestAccepted = (clusterName) => {
  return `You have been accepted into ${clusterName} cluster`;
};

export const joinClusterRequestRejected = (clusterName) => {
  return `You request to join ${clusterName} cluster has been declined`;
};

export const joinClusterRequestClusterJoiningClosed = (clusterName) => {
  return `You request to join ${clusterName} cluster cannot be completed as cluster can no longer accept new members`;
};

export const clusterMemberInvitation = () => {
  return 'You have been invited to join a cluster';
};

export const userLeftYourCluster = (user, cluster) => {
  return `${user.first_name} ${user.last_name} has left ${cluster.name} cluster.`;
};

export const initiateDeleteCluster = (user, cluster) => {
  return `${user.first_name} ${user.last_name} wants to delete ${cluster.name} cluster.`;
};
