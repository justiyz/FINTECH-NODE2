import * as authEmail from './template';

const getTemplate = (type, data) => {
  switch (type) {
  case 'login': return authEmail.login(data);
  default: return '';
  }
};

export default getTemplate;
