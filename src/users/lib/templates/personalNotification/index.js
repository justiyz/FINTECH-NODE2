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

export const loanDisbursementSuccessful = (data) => {
  return `Requested loan facility of ₦${parseFloat(data.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} approved and disbursement completed successfully`;
};

export const partLoanRepaymentSuccessful = (data) => {
  return `Your part loan repayment of ₦${parseFloat(data.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} was processed successfully and balance updated accordingly`;
};

export const fullLoanRepaymentSuccessful = (data) => {
  return `Your full loan repayment of ₦${parseFloat(data.amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} 
  was processed successfully and balance updated accordingly. Congratulations, you did it`;
};

export const cardTokenizationFailedDueToCardExpiration = () => {
  return `Thanks for adding your card details on SeedFi. however, it has been rejected because the card will expire soon. 
  Kindly add a card that will not expire in about three months time.`;
};

export const cardTokenizedSuccessfully = () => {
  return 'Thanks for adding your card details on SeedFi. It has been accepted and saved.';
};

export const cardTokenizationAmountRefundInitiated = () => {
  return 'Thanks for adding your card details on SeedFi. The amount charged on your account will be refunded shortly. Thanks';
};

export const cardTokenizationAmountRefundCouldNotBeInitiated = () => {
  return 'Thanks for adding your card details on SeedFi. There was an error refunding the charge on the card, kindly reach out to our support. Thanks';
};

export const cardTokenizationAmountRefundCompletelyProcessed = () => {
  return 'Thanks for adding your card details on SeedFi. Refund of the amount charged on card has been completed and fully refunded. Thanks';
};

export const cardTokenizationAmountRefundProcessingFailed = () => {
  return 'Thanks for adding your card details on SeedFi. Refund of the amount charged on card could not be completed and it failed, kindly reach out to our support. Thanks';
};
