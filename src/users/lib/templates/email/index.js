import * as email from './lib.template';

const getTemplate = (type, data) => {
  switch (type) {
  case 'forgotPassword': return email.forgotPassword(data);
  case 'verifyEmail': return email.verifyEmail(data);
  case 'requestVerifyEmail': return email.requestVerifyEmail(data);
  case 'rejectedDebitCard': return email.rejectedDebitCard(data);
  case 'loanDisbursement': return email.loanDisbursement(data);
  case 'loanClusterInvite': return email.loanClusterInvite(data);
  case 'failedCardDebit': return email.failedCardDebit(data);
  case 'successfulRepayment': return email.successfulRepayment(data);
  case 'completedRepayment': return email.completedRepayment(data);
  case 'failedChargePayment': return email.failedChargePayment(data);
  case 'failedAddressVerification': return email.failedAddressVerification(data);
  case 'successfulAddressVerification': return email.successfulAddressVerification(data);
  case 'loanRescheduled': return email.loanRescheduled(data);
  default: return '';
  }
};

export default getTemplate;
