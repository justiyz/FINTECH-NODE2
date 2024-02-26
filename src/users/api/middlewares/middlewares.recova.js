import loanQueries from '../queries/queries.loan';
import { processAnyData } from '../services/services.db';
import enums from '../../lib/enums';
import ApiResponse from '../../lib/http/lib.http.responses';


/**
 * check loan exists by id
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkLoanExists = async(req, res, next) => {
  try {
    const { params: { loan_reference }, body: {loanReference} } = req;

    const [ loanDetails ] = await processAnyData(loanQueries.fetchLoanDetailsByLoanId, [ loan_reference || loanReference ]);
    logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ 'Recova' }:::Info: successfully fetched loan details checkLoanExists.middleware.recova.js`);
    if (loanDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${ 'Recova' }:::Info: loan  exists
      checkLoanExists.middlewares.recova.js`);
      req.loanDetails = loanDetails;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${ 'Recova' }:::Info: loan does not exist for recova request
    checkLoanExists.middlewares.recova.js`);
    return ApiResponse.error(res, enums.LOAN_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_LOAN_EXISTS_RECOVA_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_LOAN_EXISTS_RECOVA_MIDDLEWARE;
    logger.error(`checking if loan exists failed::${enums.CHECK_LOAN_EXISTS_RECOVA_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
