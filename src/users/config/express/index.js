import helmet from 'helmet';
import 'dotenv/config';
import { json, urlencoded } from 'express';
import compression from 'compression';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import loggerInit from '../logger/index';
import enums from '../../lib/enums/index';
import routes from '../routes/index';
import config from '../index';

const expressConfig = app => {
  let logger;

  Sentry.init({
    dsn: process.env.SEEDFI_SENTRY_DSN ?? 'https://5cb4454c9872755170b003956fbc1fe1@o4506989301465088.ingest.us.sentry.io/4506989343997952',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Sentry.Integrations.Express({ app }),
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  // The request handler must be the first middleware on the app
  app.use(Sentry.Handlers.requestHandler());

  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());

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
  logger.debug("Overriding 'Express' logger");
  logger.info(`${enums.CURRENT_TIME_STAMP} Environment is ${process.env.SEEDFI_NODE_ENV}`);

  app.use(urlencoded({ extended: true }));
  app.use(json({ limit: 50000000 })); // set to allow 50mb JSON size
  app.use(cors());
  app.use(helmet());
  app.use(compression());
  app.use(fileUpload());

  // allow certain domains and allow certain HTTP methods
  app.use((req, res, next) => {
    const allowedOrigins = config.SEEDFI_ALLOWABLE_ORIGINS?.split(',').join('').split(' ');
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Origin, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
  });

  app.disable('x-powered-by');

  // Welcome route
  app.get('/', (_req, res) => {
    res.send({ message: enums.WELCOME });
  });

  app.get('/debug-sentry', function mainHandler(req, res) {
    throw new Error('My first Sentry error triggered!');
  });

  // Other routes
  routes(app);

  // The error handler must be registered before any other error middleware and after all controllers
  app.use(Sentry.Handlers.errorHandler());
  // error handlers

  // catch 404 and forward to error handler
  app.use((_req, res) =>
    res.status(enums.HTTP_NOT_FOUND).json({
      status: enums.ERROR_STATUS,
      code: enums.HTTP_NOT_FOUND,
      message: enums.DEAD_END_MESSAGE,
    })
  );

  // catch server related errors and forward to error handler
  app.use((err, _req, res) => {
    res.status(enums.HTTP_INTERNAL_SERVER_ERROR).json({
      status: err.status || enums.ERROR_STATUS,
      message: err.message || enums.SOMETHING_BROKE_MESSAGE,
    });
  });
};

export default expressConfig;
