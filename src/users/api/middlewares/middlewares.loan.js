import loanQueries from '../queries/queries.loan';
import { processAnyData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';

/**
 * check loan exists by id
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkUserLoanApplicationExists = async(req, res, next) => {
  try {
    const { params: { loan_id }, user } = req;
    const [ existingLoanApplication ] = await processAnyData(loanQueries.fetchUserLoanDetailsByLoanId, [ loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if loan application exists in the db checkUserLoanApplicationExists.middlewares.loan.js`);
    if (existingLoanApplication) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application exists and belongs to authenticated user checkUserLoanApplicationExists.middlewares.loan.js`);
      req.existingLoanApplication = existingLoanApplication;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application does not exist for authenticated user checkUserLoanApplicationExists.middlewares.loan.js`);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_USER_LOAN_APPLICATION_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_USER_LOAN_APPLICATION_EXISTS_MIDDLEWARE;
    logger.error(`checking if loan application exists failed::${enums.CHECK_USER_LOAN_APPLICATION_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check loan application status is currently approved so as to proceed with disbursement
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkIfLoanApplicationStatusIsCurrentlyApproved = async(req, res, next) => {
  try {
    const { existingLoanApplication, user } = req;
    if (existingLoanApplication.status === 'pending') {
      logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info: loan application status is still pending checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      return ApiResponse.error(res, enums.LOAN_APPLICATION_STILL_AWAITS_APPROVAL, enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
    }
    if (existingLoanApplication.status === 'declined') {
      logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info: loan application status is declined checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      return ApiResponse.error(res, enums.LOAN_APPLICATION_REJECTED, enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
    }
    if (existingLoanApplication.status === 'approved') {
      logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info: loan application status is currently approved checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application status is ${existingLoanApplication.status} checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_PREVIOUSLY_DISBURSED(existingLoanApplication.status), enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE;
    logger.error(`checking if loan application exists failed::${enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
