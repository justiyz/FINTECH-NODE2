import status from 'http-status';
import enums from '../enums/index';

export default {
  success: (res, message, code, data) => res.status(code).json({
    status: enums.SUCCESS_STATUS,
    message,
    code,
    data: data || []
  }),

  error: (res, message = '', code = enums.HTTP_INTERNAL_SERVER_ERROR, label = '') => {
    const msg = code === 500 ? enums.SERVER_ERROR : message;
    logger.error(`${message} - ${code} - ${label}`);
    return res.status(code).json({
      status: enums.ERROR_STATUS,
      error: status[`${code}_NAME`],
      message: msg,
      code
    });
  }
};
