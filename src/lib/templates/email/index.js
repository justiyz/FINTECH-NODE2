import * as authEmail from './lib.template';

const getTemplate = (type, data) => {
  switch (type) {
  case 'forgotPassword': return authEmail.forgotPassword(data);
  case 'verifyEmail': return authEmail.verifyEmail(data);
  default: return '';
  }
};

export default getTemplate;
