import * as authEmail from './authTemplates';
import * as userEmail from './userTemplates';

const getTemplate = (type, data) => {
  switch (type) {
  case 'login': return authEmail.login(data);
  case 'forgotPassword': return authEmail.forgotPassword(data);
  case 'adminInviteMail': return authEmail.adminInviteMail(data);
  case 'completeKyc': return userEmail.completeKyc(data);
  case 'insufficientBalance': return authEmail.insufficientBalance(data);
  case 'approvedLoan': return userEmail.sendLoanApprovalMail(data);
  case 'declinedLoan': return userEmail.sendLoanDisapprovalMail(data);
  default: return '';
  }
};

export default getTemplate;
