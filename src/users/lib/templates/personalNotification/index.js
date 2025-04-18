import * as Hash from '../../utils/lib.util.hash';

export const requestToJoinClusterNotification = (user, cluster) => {
  return `${user.first_name} ${user.last_name} wants to join ${cluster.name} cluster. Your approval is needed`;
};

export const joinClusterRequestAccepted = (cluster) => {
  return `Your request to join ${cluster.name} cluster as a cluster member has been examined and your request has been accepted.
  Therefore, you are now a member of ${cluster.name} cluster.`;
};

export const joinClusterRequestRejected = (cluster) => {
  return `Your request to join ${cluster.name} cluster as a cluster member has been examined and your request has been rejected.
  We are sorry to inform you that you were not accepted to join ${cluster.name} cluster.`;
};

export const inviteClusterMember = (data) => {
  return `${data.inviter} is inviting you to join ${data.name} Cluster`;
};

export const clusterInvitationAcceptance = (user, cluster) => {
  return `${user.first_name} ${user.last_name} whom you invited to join ${cluster.name} Cluster has accepted the invitation to be a member of the cluster`;
};

export const clusterInvitationDeclination = (user, cluster) => {
  return `${user.first_name} ${user.last_name} whom you invited to join ${cluster.name} Cluster has declined the invitation to be a member of the cluster`;
};

export const initiateDeleteCluster = (user, cluster) => {
  return `${user.first_name} ${user.last_name} is requesting to delete ${cluster.name} cluster. 
  Kindly accept or decline this request to permanently delete the Cluster. `;
};

export const selectNewAdmin = (user, cluster) => {
  return `${user.first_name} ${user.last_name} selected you to be the new cluster admin of ${cluster.name} cluster. Kindly accept or decline this request`;
};

export const newAdminSelectionRequestAccepted = (user, cluster) => {
  return `${user.first_name} ${user.last_name} has accepted the request to be the new cluster admin for ${cluster.name} cluster. 
  Therefore, you are no longer the cluster admin.`;
};

export const newAdminSelectionRequestDeclined = (user, cluster) => {
  return `${user.first_name} ${user.last_name} has declined the request to be the new cluster admin for ${cluster.name} cluster. 
  Therefore, You are still the cluster admin.`;
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

export const cardTokenizationFailedDueToNotCardHolderName = () => {
  return `Thanks for adding your card details on SeedFi. however, this added card does not bear your registered name on SeedFi. 
  Kindly add a card that bears your registered name.`;
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

export const failedCardDebit = (data) => {
  return `Your card could not be debited for the loan repayment of
    ₦${parseFloat(data.total_payment_amount).toFixed(2)}, \n
    Card Details \n
    Last 4 Digits: ${Hash.decrypt(decodeURIComponent(data.last_4_digits))}, \n
    Card Type: ${data.card_type} \n
    Kindly fund your account or contact your bank if need be to resolve the issue, or login to seedfi application to do manual repayment.
  `;
};

export const userAddressVerificationFailed = (user, addressDetails) => {
  return `Hello ${user.first_name} ${user.last_name} your address verification processing FAILED for address with the following details:\n
  House Number: ${addressDetails.landmark}\n,
  Landmark: ${addressDetails.house_number}\n,
  Street: ${addressDetails.street}\n,
  City: ${addressDetails.city}\n,
  State: ${addressDetails.state}\n
  
  kindly update your valid address details.`;
};

export const userAddressVerificationSuccessful = (user, addressDetails) => {
  return `Hello ${user.first_name} ${user.last_name} your address verification processing is SUCCESSFUL for address with the following details:\n
  House Number: ${addressDetails.landmark}\n,
  Landmark: ${addressDetails.house_number}\n,
  Street: ${addressDetails.street}\n,
  City: ${addressDetails.city}\n,
  State: ${addressDetails.state}\n`;
};

export const tierUpgradedSuccessfully = (first_name) => {
  return `Hi ${first_name}, You have been successfully upgraded to tier 2. We hope you will enjoy the benefits and privileges that comes with this upgrade. Cheers`;
};

export const initiateClusterLoan = (user, cluster) => {
  return `${user.first_name} ${user.last_name} has requested a cluster loan for ${cluster.name} cluster. 
  Kindly accept or decline this request to be a part of this cluster loan.`;
};

export const userEarnedRewardPointMessage = (point, type) => {
  return `Congratulations you just received ${point} points ${type} bonus`;
};
