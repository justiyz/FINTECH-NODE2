export const joinClusterNotification = () =>{
  return 'User has accepted your join cluster invite. They now have access to the shared resources and privileges.';
};

export const loanApplicationApproval = () =>{
  return 'An individual loan application requires manual approval. Please review and take appropriate action.';
};

export const loanDisbursement = () =>{
  return 'Loan amount has been disbursed to the customer\'s account. Please update the system and inform the customer.';
};

export const nonPerformingPersonalLoans = (users) =>{
  return `The following individual loans are classified as non-performing. Take necessary actions to resolve the issue. ${users}`;
};

export const nonPerformingClusterLoans = (cluster_name) =>{
  return `The following cluster member loans are classified as non-performing. Take necessary actions to resolve the issue. ${cluster_name}`;
};

export const promoEndingSoonNotification = (promo) => {
  return `The promotion ${promo} is ending soon. Please review its performance and consider extending or deactivating it.`;
};

export const loanApplicationDownTime = () => {
  return 'Please be aware of the system downtime time for loan application and ensure that appropriate measures are taken.';
};
