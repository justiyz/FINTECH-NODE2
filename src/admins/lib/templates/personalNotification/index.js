export const declinedUtilityBillNotification = () => {
  return 'Your uploaded utility bill was declined, kindly try again to verify your utility bill';
};
export const approvedUtilityBillNotification = () => {
  return 'Your uploaded utility bill has been approved';
};
  
export const inviteClusterMember = (data) => {
  return `${data.inviter} is inviting you to join ${data.name} Cluster loan group`;
};
