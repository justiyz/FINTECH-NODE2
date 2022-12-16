import Response from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';

const { HTTP_UNPROCESSABLE_ENTITY, VALIDATE_DATA_MIDDLEWARE } = enums;

/**
 * Joi validation of request parameters
 * @param {function} schema - the Joi schema
 * @param {string} type - the request type
 * @returns {object} - Returns an object (error or response).
 * @memberof ModelMiddleware
 */
const validateData = (schema, type) => async(req, res, next) => {
  try {
    const getType = {
      payload: req.body,
      params: req.params,
      query: req.query,
      headers: req.headers,
      file: req.files
    };

    const options = { language: { key: '{{key}} ' } };
    const data = getType[type];

    const isValid = await schema.validate(data, options);
    if (!isValid.error) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully validates ${getType[type]} validateData.middlewares.model.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: failed to validate ${getType[type]} validateData.middlewares.model.js`);
    const { message } = isValid.error.details[0];
    return Response.error(res, message.replace(/["]/gi, ''), HTTP_UNPROCESSABLE_ENTITY, VALIDATE_DATA_MIDDLEWARE);
  } catch (error) {
    error.label = VALIDATE_DATA_MIDDLEWARE;
    logger.error(`Joi validation for the incoming request failed:::${enums.VALIDATE_DATA_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

export default validateData;
