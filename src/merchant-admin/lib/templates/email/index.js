import * as authEmail from './authTemplates';
import * as userEmail from './userTemplates';
import * as merchantEmail from './'

const getTemplate = (type, data) => {
  switch (type) {
  case 'login': return authEmail.login(data);
  case 'forgotPassword': return authEmail.forgotPassword(data);
  case 'adminInviteMail': return authEmail.adminInviteMail(data);
  case 'completeKyc': return userEmail.completeKyc(data);
  case 'insufficientBalance': return authEmail.insufficientBalance(data);
  case 'approvedLoan': return userEmail.sendLoanApprovalMail(data);
  case 'declinedLoan': return userEmail.sendLoanDisapprovalMail(data);
  case 'declinedUtilityBill': return userEmail.utilityBillDeclinedMail(data);
  case 'approvedUtilityBill': return userEmail.utilityBillApprovalMail(data);
  case 'adminClusterInvite': return userEmail.adminClusterInvite(data);
  case 'manualLoanApproval': return authEmail.manualLoanApproval(data);
  case 'adminSentNotification': return userEmail.adminSentNotification(data);
  case 'changePassword': return authEmail.changePassword(data);
  case 'resetPassword': return authEmail.resetPassword(data);
  case 'completeMerchantKyc': return authEmail.merchantAdminOnboarding(data);
  case 'createMerchantPassword': return authEmail.createMerchantPassword(data);
  default: return '';
  }
};

export default getTemplate;
