import v1Routes from './v1.js';

const route = (app) => {
  app.use('/api/v1', v1Routes);
};

export default route;
