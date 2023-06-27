export const rejectDebitCard = () => {
  return 'The debit card you add has been rejected, kindly insert a debit card that will not expire in 3 months time';
};

export const cardTokenizationSuccessful = () => {
  return 'The debit card you added has been accepted and saved successfully';
};

export const cardTokenizationRefundInitiated = () => {
  return 'Refund for the amount charged on adding of card has been initiated successfully';
};

export const cardTokenizationAmountRefundInitiationFailed = () => {
  return 'Refund for the amount charged on adding of card failed to be initiated';
};

export const cardTokenizationAmountRefundSuccessful = () => {
  return 'Refund for the amount charged on adding of card is completed and amount fully refunded';
};

export const cardTokenizationAmountRefundFailed = () => {
  return 'Refund for the amount charged on adding of card failed and could not be completed kindly reach out to our support. Thanks';
};

export const successfulLoanDisbursement = () => {
  return 'Requested loan facility approved and disbursement completed';
};

export const successfulLoanRepayment = () => {
  return 'Your loan repayment is processed successfully';
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
  return `Your request to join ${clusterName} cluster has been declined`;
};

export const joinClusterRequestClusterJoiningClosed = (clusterName) => {
  return `Your request to join ${clusterName} cluster cannot be completed as cluster can no longer accept new members`;
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

export const clusterDeletedSuccessfully = (cluster) => {
  return `Cluster ${cluster.name} has been deleted successfully based on consensus.`;
};

export const failedCardDebit = () => {
  return 'Your card could not be debited for the loan repayment.';
};

export const clusterNewAdminSelectionAccepted = (user, clusterName) => {
  return `${user.first_name} ${user.last_name} accepted your request to be the admin for ${clusterName} cluster`;
};

export const clusterNewAdminSelectionDeclined = (user, clusterName) => {
  return `${user.first_name} ${user.last_name} declined your request to be the admin for ${clusterName} cluster`;
};

export const failedYouVerifyAddressVerification = () => {
  return 'Your address verification processing failed';
};

export const successfulYouVerifyAddressVerification = () => {
  return 'Your address verification processing is successful';
};

export const userTierUpgraded = () => {
  return 'Your tier has been successfully upgraded to tier 2';
};

export const nonPerformingUsers = () => {
  return 'Your loan is over due, kindly login to make your payment';
};
