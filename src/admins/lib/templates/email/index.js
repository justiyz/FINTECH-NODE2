import * as authEmail from './authTemplates';

const getTemplate = (type, data) => {
  switch (type) {
  case 'login': return authEmail.login(data);
  case 'forgotPassword': return authEmail.forgotPassword(data);
  case 'adminInviteMail': return authEmail.adminInviteMail(data);
  default: return '';
  }
};

export default getTemplate;
