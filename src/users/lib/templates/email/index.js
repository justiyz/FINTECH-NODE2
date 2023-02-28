import * as email from './lib.template';

const getTemplate = (type, data) => {
  switch (type) {
  case 'forgotPassword': return email.forgotPassword(data);
  case 'verifyEmail': return email.verifyEmail(data);
  case 'requestVerifyEmail': return email.requestVerifyEmail(data);
  case 'rejectedDebitCard': return email.rejectedDebitCard(data);
  case 'loanDisbursement': return email.loanDisbursement(data);
  default: return '';
  }
};

export default getTemplate;
