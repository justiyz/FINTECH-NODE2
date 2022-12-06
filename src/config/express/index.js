import helmet from 'helmet';
import { json, urlencoded } from 'express';
import compression from 'compression';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import loggerInit from '../logger/index.js';
import enums from '../../lib/enums/index.js';
import routes from '../routes/index.js';

const expressConfig = app => {
  let logger;

  switch (app.get('env')) {
  case 'development':
    logger = loggerInit('development');
    break;

  case 'production':
    logger = loggerInit('production');
    break;

  case 'test':
    logger = loggerInit('test');
    break;

  default:
    logger = loggerInit();
  }

  global.logger = logger;
  logger.info(`${enums.CURRENT_TIME_STAMP} Application starting...`);
  logger.info(`${enums.CURRENT_TIME_STAMP} Environment is ${app.get('env')}`);

  app.use(urlencoded({ extended: true }));
  app.use(json());
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(fileUpload());

  app.get('/', (req, res) => {
    res.send({ message: enums.WELCOME });
  });

  // Other routes
  routes(app);

  // error handlers

  // catch 404 and forward to error handler
  app.use((req, res) => res.status(enums.HTTP_NOT_FOUND).json({
    status: enums.ERROR_STATUS,
    code: enums.HTTP_NOT_FOUND,
    message: enums.DEAD_END_MESSAGE
  }));

  // catch server related errors and forward to error handler
  app.use((err, req, res) => {
    res.status(enums.HTTP_INTERNAL_SERVER_ERROR).json({
      status: err.status || enums.ERROR_STATUS,
      message: err.message || enums.SOMETHING_BROKE_MESSAGE
    });
  });
};

export default expressConfig;
