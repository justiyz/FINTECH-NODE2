import loanQueries from '../queries/queries.loan';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import config from '../../config';
import AdminMailService from '../../../admins/api/services/services.email';
import { userActivityTracking } from '../../lib/monitor';
import { fetchSeedfiPaystackBalance, createTransferRecipient } from '../services/service.paystack';

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
 * check loan payment exists by id
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkUserLoanPaymentExists = async(req, res, next) => {
  try {
    const { params: { loan_payment_id }, user } = req;
    const [ existingLoanPayment ] = await processAnyData(loanQueries.fetchUserPersonalLoanPaymentDetails, [ loan_payment_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if loan payment exists in the db checkUserLoanPaymentExists.middlewares.loan.js`);
    if (existingLoanPayment) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan payment exists and belongs to authenticated user checkUserLoanPaymentExists.middlewares.loan.js`);
      req.existingLoanPayment = existingLoanPayment;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan payment does not exist for authenticated user checkUserLoanPaymentExists.middlewares.loan.js`);
    return ApiResponse.error(res, enums.LOAN_PAYMENT_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_USER_LOAN_PAYMENT_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_USER_LOAN_PAYMENT_EXISTS_MIDDLEWARE;
    logger.error(`checking if loan payment exists failed::${enums.CHECK_USER_LOAN_PAYMENT_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check paystack balance before disbursement
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkSeedfiPaystackBalance = async(req, res, next) => {
  try {
    const { user, existingLoanApplication } = req;
    const result = await fetchSeedfiPaystackBalance();
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: response gotten from calling paystack balance check checkSeedfiPaystackBalance.middlewares.loan.js`);
    if (result.status === true && result.message === 'Balances retrieved') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: seedfi balance retrieved successfully checkSeedfiPaystackBalance.middlewares.loan.js`);
      const balance = parseFloat(result.data[0].balance / 100); // paystack returns balance in kobo
      const amountRequestingType = config.SEEDFI_NODE_ENV === 'development' ? 100 : parseFloat(existingLoanApplication.amount_requested); // paystack will not process any amount greater than 1 million in test environment
      if (amountRequestingType > balance) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user requested amount is greater than seedfi balance with paystack checkSeedfiPaystackBalance.middlewares.loan.js`);
        const data = {
          email: config.SEEDFI_ADMIN_EMAIL_ADDRESS,
          currentBalance: `₦${balance}`
        };
        await AdminMailService('Insufficient Paystack Balance', 'insufficientBalance', { ...data });
        userActivityTracking(req.user.user_id, 44, 'fail');
        return ApiResponse.error(res, enums.USER_PAYSTACK_LOAN_DISBURSEMENT_ISSUES, enums.HTTP_SERVICE_UNAVAILABLE, enums.CHECK_SEEDFI_PAYSTACK_BALANCE_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user requested amount is less than seedfi balance with paystack checkSeedfiPaystackBalance.middlewares.loan.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: seedfi balance  could not be retrieved successfully checkSeedfiPaystackBalance.middlewares.loan.js`);
  } catch (error) {
    userActivityTracking(req.user.user_id, 44, 'fail');
    error.label = enums.CHECK_SEEDFI_PAYSTACK_BALANCE_MIDDLEWARE;
    logger.error(`checking seedfi paystack account balance failed::${enums.CHECK_SEEDFI_PAYSTACK_BALANCE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * generate paystack recipient for user to be credited
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const generateLoanDisbursementRecipient = async(req, res, next) => {
  try {
    const { user } = req;
    const [ userDisbursementAccountDetails ] = await processAnyData(loanQueries.fetchUserDisbursementAccount, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user disbursement account fetched successfully generateLoanDisbursementRecipient.middlewares.loan.js`);
    const result = await createTransferRecipient(userDisbursementAccountDetails);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: response gotten from calling paystack to generate user transfer recipient code generateLoanDisbursementRecipient.middlewares.loan.js`);
    if (result.status === true && result.message === 'Transfer recipient created successfully') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user transfer recipient code generated successfully generateLoanDisbursementRecipient.middlewares.loan.js`);
      const userPaystackTransferRecipient = result.data.recipient_code;
      req.userTransferRecipient = userPaystackTransferRecipient;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user transfer recipient code failed to be generated generateLoanDisbursementRecipient.middlewares.loan.js`);
    userActivityTracking(req.user.user_id, 44, 'fail');
    return ApiResponse.error(res, enums.USER_PAYSTACK_LOAN_DISBURSEMENT_ISSUES, enums.HTTP_SERVICE_UNAVAILABLE, enums.GENERATE_LOAN_DISBURSEMENT_RECIPIENT_MIDDLEWARE);
  } catch (error) {
    userActivityTracking(req.user.user_id, 44, 'fail');
    error.label = enums.GENERATE_LOAN_DISBURSEMENT_RECIPIENT_MIDDLEWARE;
    logger.error(`generating user paystack transfer recipient failed::${enums.GENERATE_LOAN_DISBURSEMENT_RECIPIENT_MIDDLEWARE}`, error.message);
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
    if (existingLoanApplication.status === 'approved') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is currently approved checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      return next();
    }
    if (existingLoanApplication.status === 'in review') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is still pending checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      userActivityTracking(req.user.user_id, 44, 'fail');
      return ApiResponse.error(res, enums.LOAN_APPLICATION_STILL_AWAITS_APPROVAL, enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
    }
    if (existingLoanApplication.status === 'declined') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is declined checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      userActivityTracking(req.user.user_id, 44, 'fail');
      return ApiResponse.error(res, enums.LOAN_APPLICATION_DECLINED, enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application status is ${existingLoanApplication.status} checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
    userActivityTracking(req.user.user_id, 44, 'fail');
    return ApiResponse.error(res, enums.LOAN_APPLICATION_PREVIOUSLY_DISBURSED(existingLoanApplication.status), enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
  } catch (error) {
    userActivityTracking(req.user.user_id, 44, 'fail');
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
      const statusType = existingActiveLoanApplication.status === 'processing' || existingActiveLoanApplication.status === 'pending' ? `a ${existingActiveLoanApplication.status} personal loan application` : `an ${existingActiveLoanApplication.status} personal loan`;
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

// /**
//  * check payment reference exists by reference if
//  * @param {Request} req - The request from the endpoint.
//  * @param {Response} res - The response returned by the method.
//  * @param {Next} next - Call the next operation.
//  * @returns {object} - Returns an object (error or response).
//  * @memberof LoanMiddleware
//  */
// export const checkUserPaymentReferenceExists = async(req, res, next) => {
//   try {
//     const { params: { reference_id }, user } = req;
//     const [ paymentRecord ] = await processAnyData(paymentQueries.fetchTransactionByReference, [ body.data.reference || body.data.transaction_reference ]);
//     logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if loan application exists in the db checkUserLoanApplicationExists.middlewares.loan.js`);
//     if (existingLoanApplication) {
//       logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application exists and belongs to authenticated user checkUserLoanApplicationExists.middlewares.loan.js`);
//       req.existingLoanApplication = existingLoanApplication;
//       return next();
//     }
//     logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application does not exist for authenticated user checkUserLoanApplicationExists.middlewares.loan.js`);
//     return ApiResponse.error(res, enums.LOAN_APPLICATION_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_USER_LOAN_APPLICATION_EXISTS_MIDDLEWARE);
//   } catch (error) {
//     error.label = enums.CHECK_USER_LOAN_APPLICATION_EXISTS_MIDDLEWARE;
//     logger.error(`checking if loan application exists failed::${enums.CHECK_USER_LOAN_APPLICATION_EXISTS_MIDDLEWARE}`, error.message);
//     return next(error);
//   }
// };
