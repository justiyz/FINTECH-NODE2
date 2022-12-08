import v1Routes from './v1';

const route = (app) => {
  app.use('/api/v1', v1Routes);
};

export default route;
