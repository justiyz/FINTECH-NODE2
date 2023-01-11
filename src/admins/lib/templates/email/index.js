import * as authEmail from './template';

const getTemplate = (type, data) => {
  switch (type) {
  case 'login': return authEmail.login(data);
  case 'forgotPassword': return authEmail.forgotPassword(data);
  default: return '';
  }
};

export default getTemplate;
