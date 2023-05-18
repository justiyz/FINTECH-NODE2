export const declinedUtilityBillNotification = () => {
  return 'Your uploaded utility bill was declined, kindly try again to verify your utility bill';
};
export const approvedUtilityBillNotification = () => {
  return 'Your uploaded utility bill has been approved';
};

export const tierUpgradedSuccessfully = (first_name) => {
  return `Hi ${first_name}, You have been successfully upgraded to tier 2. We hope you will enjoy the benefits and privileges that comes with this upgrade. Cheers`;
};
  
export const inviteClusterMember = (data) => {
  return `${data.inviter} is inviting you to join ${data.name} Cluster loan group`;
};
