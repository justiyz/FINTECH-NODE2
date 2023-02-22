import loanQueries from '../queries/queries.loan';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import { userActivityTracking } from '../../lib/monitor';

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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is still pending checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      userActivityTracking(req.user.user_id, 42, 'fail');
      return ApiResponse.error(res, enums.LOAN_APPLICATION_STILL_AWAITS_APPROVAL, enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
    }
    if (existingLoanApplication.status === 'declined') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is declined checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      userActivityTracking(req.user.user_id, 42, 'fail');
      return ApiResponse.error(res, enums.LOAN_APPLICATION_DECLINED, enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
    }
    if (existingLoanApplication.status === 'approved') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is currently approved checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application status is ${existingLoanApplication.status} checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
    userActivityTracking(req.user.user_id, 42, 'fail');
    return ApiResponse.error(res, enums.LOAN_APPLICATION_PREVIOUSLY_DISBURSED(existingLoanApplication.status), enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
  } catch (error) {
    userActivityTracking(req.user.user_id, 42, 'fail');
    error.label = enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE;
    logger.error(`checking if loan application status is currently approved failed::${enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check loan application status is currently still pending
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkIfLoanApplicationStatusIsStillPending = async(req, res, next) => {
  try {
    const { existingLoanApplication, user } = req;
    if (existingLoanApplication.status === 'pending' || existingLoanApplication.status === 'approved') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is still pending checkIfLoanApplicationStatusIsStillPending.middlewares.loan.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is no longer pending checkIfLoanApplicationStatusIsStillPending.middlewares.loan.js`);
    userActivityTracking(req.user.user_id, 43, 'fail');
    return ApiResponse.error(res, enums.LOAN_APPLICATION_CANCELLING_FAILED_DUE_TO_CURRENT_STATUS(existingLoanApplication.status), enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_STILL_PENDING_MIDDLEWARE);
  } catch (error) {
    userActivityTracking(req.user.user_id, 43, 'fail');
    error.label = enums.CHECK_LOAN_APPLICATION_STATUS_IS_STILL_PENDING_MIDDLEWARE;
    logger.error(`checking if loan application status is still pending failed::${enums.CHECK_LOAN_APPLICATION_STATUS_IS_STILL_PENDING_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user has an active personal loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkIfUserHasActivePersonalLoan = async(req, res, next) => {
  try {
    const { user } = req;
    const [ existingActiveLoanApplication ] = await processAnyData(loanQueries.fetchUserActivePersonalLoans, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user active personal loan application from the db checkIfUserHasActivePersonalLoan.middlewares.loan.js`);
    if (existingActiveLoanApplication) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that user has an existing active personal loan checkIfUserHasActivePersonalLoan.middlewares.loan.js`);
      if (existingActiveLoanApplication.status === 'approved') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that user has ${existingActiveLoanApplication.status} existing personal loan checkIfUserHasActivePersonalLoan.middlewares.loan.js`);
        userActivityTracking(req.user.user_id, 37, 'fail');
        return ApiResponse.error(res, enums.LOAN_APPLICATION_FAILED_FOR_EXISTING_APPROVED_LOAN_REASON, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_USER_HAS_ACTIVE_PERSONAL_LOAN_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that user has ${existingActiveLoanApplication.status} existing personal loan checkIfUserHasActivePersonalLoan.middlewares.loan.js`);
      const statusType = existingActiveLoanApplication.status === 'pending' ? `a ${existingActiveLoanApplication.status} personal loan application` : `an ${existingActiveLoanApplication.status} personal loan`;
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.LOAN_APPLICATION_FAILED_DUE_TO_EXISTING_ACTIVE_LOAN(statusType), enums.HTTP_BAD_REQUEST, enums.CHECK_IF_USER_HAS_ACTIVE_PERSONAL_LOAN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms user has no active personal loan checkIfUserHasActivePersonalLoan.middlewares.loan.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 37, 'fail');
    error.label = enums.CHECK_IF_USER_HAS_ACTIVE_PERSONAL_LOAN_MIDDLEWARE;
    logger.error(`checking if user has an active loan failed::${enums.CHECK_IF_USER_HAS_ACTIVE_PERSONAL_LOAN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check loan application amount and tenor
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const validateLoanAmountAndTenor = async(req, res, next) => {
  try {
    const { user, body } = req;
    const [ maximumLoanAmountDetails, maximumLoanTenorDetails, minimumLoanTenorDetails ] = await Promise.all([
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'maximum_loan_amount' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'maximum_loan_tenor' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'minimum_loan_tenor' ])
    ]);
    if ((Number(user.tier) === 1) && (parseFloat(body.amount) > (parseFloat(maximumLoanAmountDetails.value) / 2))) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: tier 1 user applying for an amount greater than maximum allowable maximum amount validateLoanAmountAndTenor.middleware.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.USER_REQUESTS_FOR_LOAN_AMOUNT_GREATER_THAN_ALLOWABLE, enums.HTTP_BAD_REQUEST, enums.VALIDATE_LOAN_AMOUNT_AND_TENOR_MIDDLEWARE);
    }
    if ((Number(user.tier) === 2) && (parseFloat(body.amount) > (parseFloat(maximumLoanAmountDetails.value)))) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: tier 2 user applying for an amount greater than maximum allowable maximum amount validateLoanAmountAndTenor.middleware.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.USER_REQUESTS_FOR_LOAN_AMOUNT_GREATER_THAN_ALLOWABLE, enums.HTTP_BAD_REQUEST, enums.VALIDATE_LOAN_AMOUNT_AND_TENOR_MIDDLEWARE);
    }
    if (Number(body.duration_in_months) < Number(minimumLoanTenorDetails.value)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user applying for a loan with a duration less than allowable minimum tenor validateLoanAmountAndTenor.middleware.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.USER_REQUESTS_FOR_LOAN_TENOR_LESSER_THAN_ALLOWABLE, enums.HTTP_BAD_REQUEST, enums.VALIDATE_LOAN_AMOUNT_AND_TENOR_MIDDLEWARE);
    }
    if (Number(body.duration_in_months) > Number(maximumLoanTenorDetails.value)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user applying for a loan with a duration greater than allowable maximum tenor validateLoanAmountAndTenor.middleware.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.USER_REQUESTS_FOR_LOAN_TENOR_GREATER_THAN_ALLOWABLE, enums.HTTP_BAD_REQUEST, enums.VALIDATE_LOAN_AMOUNT_AND_TENOR_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 37, 'fail');
    error.label = enums.VALIDATE_LOAN_AMOUNT_AND_TENOR_MIDDLEWARE;
    logger.error(`validating loan application amount and tenor failed::${enums.VALIDATE_LOAN_AMOUNT_AND_TENOR_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
