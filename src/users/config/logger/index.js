/* eslint-disable new-cap */
import winston from 'winston';
import config from '../';

const { transports } = require('winston');

const httpTransportOptions = {
  host: 'http-intake.logs.datadoghq.com',
  path: `/api/v2/logs?dd-api-key=${config.SEEDFI_DATADOG_API_KEY}&ddsource=nodejs&service=${config.SEEDFI_DATADOG_APPLICATION_NAME}`,
  ssl: true
};

const test = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: './test.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880,
      maxFiles: 50,
      colorize: false
    })
  ],
  exitOnError: false
});

const production = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: './server.log',
      handleExceptions: true,
      json: false,
      maxsize: 5242880,
      maxFiles: 50,
      colorize: false
    }),
    new transports.Http(httpTransportOptions)
  ],
  exitOnError: false
});

const development = winston.createLogger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    }),
    new winston.transports.File({
      level: 'info',
      filename: './development.log',
      handleExceptions: true,
      json: true,
      maxsize: 5242880,
      maxFiles: 100,
      colorize: true
    })
  ],
  exitOnError: false
});

const defaultLogger = {
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true
    }),
    new transports.Http(httpTransportOptions)
  ],
  exitOnError: false
};

const getLogger = (env) => {
  switch (env) {
  case 'production': return production;

  case 'development': return development;

  case 'test': return test;

  default: return new winston.createLogger(defaultLogger);
  }
};

const logger = (env) => {
  let ret = '';

  ret = getLogger(env);

  ret.stream = {
    write: (message /* encoding */) => {
      logger.info(message);
    }
  };

  return ret;
};

export default logger;
