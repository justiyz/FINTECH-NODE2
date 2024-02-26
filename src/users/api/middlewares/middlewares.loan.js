import loanQueries from '../queries/queries.loan';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import config from '../../config';
import AdminMailService from '../../../admins/api/services/services.email';
import * as Hash from '../../lib/utils/lib.util.hash';
import { userActivityTracking } from '../../lib/monitor';
import { fetchSeedfiPaystackBalance, createTransferRecipient } from '../services/service.paystack';
import adminShopQueries from '../../../admins/api/queries/queries.shop';
import {CHECK_AVAILABLE_TICKET_UNITS, CHECK_AVAILABLE_TICKET_UNITS_MESSAGE} from '../../lib/enums/lib.enum.labels';
import {LOAN_APPLICATION_NOT_EXISTING_FOR_USER} from '../../lib/enums/lib.enum.messages';
const { SEEDFI_ENCODING_AUTHENTICATION_SECRET, SEEDFI_BCRYPT_SALT_ROUND } = config;
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application exists and belongs to authenticated user
      checkUserLoanApplicationExists.middlewares.loan.js`);
      req.existingLoanApplication = existingLoanApplication;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application does not exist for authenticated user
    checkUserLoanApplicationExists.middlewares.loan.js`);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_NOT_EXISTING_FOR_USER, enums.HTTP_BAD_REQUEST, enums.CHECK_USER_LOAN_APPLICATION_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_USER_LOAN_APPLICATION_EXISTS_MIDDLEWARE;
    logger.error(`checking if loan application exists failed::${enums.CHECK_USER_LOAN_APPLICATION_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check loan payment exists by id
 * @param {Request} type - The type of loan payment if personal or cluster.
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkUserLoanPaymentExists  = (type = '') => async(req, res, next) => {
  try {
    const { params: { loan_payment_id }, user } = req;
    const [ existingLoanPayment ] = type === 'personal' ? await processAnyData(loanQueries.fetchUserPersonalLoanPaymentDetails, [ loan_payment_id, user.user_id ]) :
      await processAnyData(loanQueries.fetchUserClusterLoanPaymentDetails, [ loan_payment_id, user.user_id ]);
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
      const amountRequestingType = config.SEEDFI_NODE_ENV === 'development' ? 100 : parseFloat(existingLoanApplication.amount_requested);
      // paystack will not process any amount greater than 1 million in test environment
      if (amountRequestingType > balance) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user requested amount is greater than seedfi balance with paystack
        checkSeedfiPaystackBalance.middlewares.loan.js`);
        const data = {
          email: config.SEEDFI_ADMIN_EMAIL_ADDRESS,
          currentBalance: `₦${balance}`
        };
        await AdminMailService('Insufficient Paystack Balance', 'insufficientBalance', { ...data });
        userActivityTracking(req.user.user_id, 44, 'fail');
        return ApiResponse.error(res, enums.USER_PAYSTACK_LOAN_DISBURSEMENT_ISSUES, enums.HTTP_SERVICE_UNAVAILABLE, enums.CHECK_SEEDFI_PAYSTACK_BALANCE_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user requested amount is less than seedfi balance with paystack
      checkSeedfiPaystackBalance.middlewares.loan.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: seedfi balance  could not be retrieved successfully checkSeedfiPaystackBalance.middlewares.loan.js`);
    if (result.response.status !== 200) {
      userActivityTracking(user.user_id, 44, 'fail');
      return ApiResponse.error(res, result.response.data.message, enums.HTTP_BAD_REQUEST, enums.CHECK_SEEDFI_PAYSTACK_BALANCE_MIDDLEWARE);
    }
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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: response gotten from calling paystack to generate user transfer recipient code
    generateLoanDisbursementRecipient.middlewares.loan.js`);
    if (result.status === true && result.message === 'Transfer recipient created successfully') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user transfer recipient code generated successfully
      generateLoanDisbursementRecipient.middlewares.loan.js`);
      const userPaystackTransferRecipient = result.data.recipient_code;
      req.userTransferRecipient = userPaystackTransferRecipient;
      return next();
    }

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user transfer recipient code failed to be generated generateLoanDisbursementRecipient.middlewares.loan.js`);
    if (result.response.status !== 200) {
      userActivityTracking(user.user_id, 44, 'fail');
      return ApiResponse.error(res, result.response.data.message, enums.HTTP_BAD_REQUEST, enums.GENERATE_LOAN_DISBURSEMENT_RECIPIENT_MIDDLEWARE);
    }
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
 * generate paystack recipient for bnpl loan to be credited
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const generateBNPLLoanDisbursementRecipient = async(req, res, next) => {
  try {
    const { user } = req;
    // const [ userDisbursementAccountDetails ] = await processAnyData(loanQueries.fetchUserDisbursementAccount, [ user.user_id ]);

    const userDisbursementAccountDetails = {
      id: 'loan_disbursement_account_id',
      user_id: 'user_id',
      bank_name: SEEDFI_LOAN_DISBURSEMENT_BANK_NAME,
      bank_code: SEEDFI_LOAN_DISBURSEMENT_BANK_CODE,
      account_number: SEEDFI_LOAN_DISBURSEMENT_ACCOUNT_NUMBER,
      account_name: SEEDFI_LOAN_DISBURSEMENT_ACCOUNT_NAME,
      is_default: true,
      is_disbursement_account: true
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user disbursement account fetched successfully generateLoanDisbursementRecipient.middlewares.loan.js`);
    const result = await createTransferRecipient(userDisbursementAccountDetails);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: response gotten from calling paystack to generate user transfer recipient code
    generateLoanDisbursementRecipient.middlewares.loan.js`);
    if (result.status === true && result.message === 'Transfer recipient created successfully') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user transfer recipient code generated successfully
      generateLoanDisbursementRecipient.middlewares.loan.js`);
      const userPaystackTransferRecipient = result.data.recipient_code;
      req.userTransferRecipient = userPaystackTransferRecipient;
      return next();
    }

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user transfer recipient code failed to be generated generateLoanDisbursementRecipient.middlewares.loan.js`);
    if (result.response.status !== 200) {
      userActivityTracking(user.user_id, 44, 'fail');
      return ApiResponse.error(res, result.response.data.message, enums.HTTP_BAD_REQUEST, enums.GENERATE_LOAN_DISBURSEMENT_RECIPIENT_MIDDLEWARE);
    }
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is currently approved
      checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      if ((existingLoanApplication.max_possible_approval !== null) &&
      (parseFloat(existingLoanApplication.amount_requested) > parseFloat(existingLoanApplication.max_possible_approval))) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: system allowable amount has not been accepted by user so disbursement cannot
        be processed checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
        userActivityTracking(req.user.user_id, 44, 'fail');
        return ApiResponse.error(res, enums.LOAN_AMOUNT_GREATER_THAN_SYSTEM_MAXIMUM_AMOUNT, enums.HTTP_FORBIDDEN,
          enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
      }
      return next();
    }
    if (existingLoanApplication.status === 'in review') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is still pending
      checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      userActivityTracking(req.user.user_id, 44, 'fail');
      return ApiResponse.error(res, enums.LOAN_APPLICATION_STILL_AWAITS_APPROVAL, enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
    }
    if (existingLoanApplication.status === 'declined') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is declined
      checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
      userActivityTracking(req.user.user_id, 44, 'fail');
      return ApiResponse.error(res, enums.LOAN_APPLICATION_DECLINED, enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application status is ${existingLoanApplication.status}
    checkIfLoanApplicationStatusIsCurrentlyApproved.middlewares.loan.js`);
    userActivityTracking(req.user.user_id, 44, 'fail');
    return ApiResponse.error(res, enums.LOAN_APPLICATION_PREVIOUSLY_DISBURSED(existingLoanApplication.status),
      enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_CURRENTLY_APPROVED_MIDDLEWARE);
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
    if (existingLoanApplication.status === 'pending' || existingLoanApplication.status === 'approved' || existingLoanApplication.status === 'in review') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is still pending
      checkIfLoanApplicationStatusIsStillPending.middlewares.loan.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is no longer pending
    checkIfLoanApplicationStatusIsStillPending.middlewares.loan.js`);
    userActivityTracking(req.user.user_id, 43, 'fail');
    return ApiResponse.error(res, enums.LOAN_APPLICATION_CANCELLING_FAILED_DUE_TO_CURRENT_STATUS(existingLoanApplication.status),
      enums.HTTP_FORBIDDEN, enums.CHECK_LOAN_APPLICATION_STATUS_IS_STILL_PENDING_MIDDLEWARE);
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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user active personal loan application from the db
    checkIfUserHasActivePersonalLoan.middlewares.loan.js`);
    if (existingActiveLoanApplication) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that user has an existing active personal loan
      checkIfUserHasActivePersonalLoan.middlewares.loan.js`);
      if (existingActiveLoanApplication.status === 'approved') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that user has ${existingActiveLoanApplication.status} existing personal loan
        checkIfUserHasActivePersonalLoan.middlewares.loan.js`);
        userActivityTracking(req.user.user_id, 37, 'fail');
        return ApiResponse.error(res, enums.LOAN_APPLICATION_FAILED_FOR_EXISTING_APPROVED_LOAN_REASON,
          enums.HTTP_BAD_REQUEST, enums.CHECK_IF_USER_HAS_ACTIVE_PERSONAL_LOAN_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that user has ${existingActiveLoanApplication.status} existing personal loan
      checkIfUserHasActivePersonalLoan.middlewares.loan.js`);
      const statusType = existingActiveLoanApplication.status === 'processing' || existingActiveLoanApplication.status === 'pending' ?
        `a ${existingActiveLoanApplication.status} personal loan application` :
        `an ${existingActiveLoanApplication.status} personal loan`;
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.LOAN_APPLICATION_FAILED_DUE_TO_EXISTING_ACTIVE_LOAN(statusType),
        enums.HTTP_BAD_REQUEST, enums.CHECK_IF_USER_HAS_ACTIVE_PERSONAL_LOAN_MIDDLEWARE);
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
  const { user, body } = req;
  try {
    const [ tierOneMaximumLoanAmountDetails, tierTwoMaximumLoanAmountDetails, tierOneMinimumLoanAmountDetails, tierTwoMinimumLoanAmountDetails,
      maximumLoanTenorDetails, minimumLoanTenorDetails, tierOneMaximumAmountForNoCreditHistoryDetails, tierTwoMaximumAmountForNoCreditHistoryDetails ] = await Promise.all([
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'tier_one_maximum_loan_amount' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'tier_two_maximum_loan_amount' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'tier_one_minimum_loan_amount' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'tier_two_minimum_loan_amount' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'maximum_loan_tenor' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'minimum_loan_tenor' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'tier_one_max_amount_for_no_credit_history' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'tier_two_max_amount_for_no_credit_history' ])
    ]);
    if ((Number(body.duration_in_months || body.new_loan_duration_in_month) < Number(minimumLoanTenorDetails.value)) && body.loan_reason != 'Salary advance loan') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user applying for a loan with a duration less than allowable minimum tenor or applying for a salary advance loan
      validateLoanAmountAndTenor.middleware.loan.js`);
      return ApiResponse.error(res, enums.USER_REQUESTS_FOR_LOAN_TENOR_LESSER_THAN_ALLOWABLE, enums.HTTP_BAD_REQUEST, enums.VALIDATE_LOAN_AMOUNT_AND_TENOR_MIDDLEWARE);
    }
    if (Number(body.duration_in_months || body.new_loan_duration_in_month) > Number(maximumLoanTenorDetails.value)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user applying for a loan with a duration greater than allowable maximum tenor
      validateLoanAmountAndTenor.middleware.loan.js`);
      return ApiResponse.error(res, enums.USER_REQUESTS_FOR_LOAN_TENOR_GREATER_THAN_ALLOWABLE, enums.HTTP_BAD_REQUEST, enums.VALIDATE_LOAN_AMOUNT_AND_TENOR_MIDDLEWARE);
    }
    if (Number(user.tier) === 1) {
      req.maximumAmountForNoCreditHistoryDetails = parseFloat(tierOneMaximumAmountForNoCreditHistoryDetails.value);
      req.userMinimumAllowableAMount = parseFloat(tierOneMinimumLoanAmountDetails.value);
      req.userMaximumAllowableAmount = parseFloat(tierOneMaximumLoanAmountDetails.value);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: set tier 1 user maximum allowable loan amount
      validateLoanAmountAndTenor.middleware.loan.js`);
      return next();
    }
    if (Number(user.tier) === 2) {
      req.maximumAmountForNoCreditHistoryDetails = parseFloat(tierTwoMaximumAmountForNoCreditHistoryDetails.value);
      req.userMinimumAllowableAMount = parseFloat(tierTwoMinimumLoanAmountDetails.value);
      req.userMaximumAllowableAmount = parseFloat(tierTwoMaximumLoanAmountDetails.value);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: set tier 2 user maximum allowable loan amount
      validateLoanAmountAndTenor.middleware.loan.js`);
      return next();
    }
  } catch (error) {
    error.label = enums.VALIDATE_LOAN_AMOUNT_AND_TENOR_MIDDLEWARE;
    logger.error(`validating loan application amount and tenor failed::${enums.VALIDATE_LOAN_AMOUNT_AND_TENOR_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if based on user employment type and loan count, limits apply
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkIfEmploymentTypeLimitApplies = async(req, res, next) => {
  try {
    const { userEmploymentDetails, user } = req;
    const [ userPreviousPersonalLoanCounts ] = await processAnyData(loanQueries.fetchUserPreviousPersonalLoanCounts, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: count of user past individual loans fetched checkIfEmploymentTypeLimitApplies.middleware.loan.js`);
    const [ userPreviousClusterLoanCounts ] = await processAnyData(loanQueries.fetchUserPreviousClusterLoanCounts, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: count of user past cluster loans fetched checkIfEmploymentTypeLimitApplies.middleware.loan.js`);
    const totalPreviousLoanCount = (parseFloat(userPreviousPersonalLoanCounts.count) + parseFloat(userPreviousClusterLoanCounts.count));
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: total count of past loans estimated checkIfEmploymentTypeLimitApplies.middleware.loan.js`);
    if (parseFloat(totalPreviousLoanCount) >= 2) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has taken 2 or more loans previously checkIfEmploymentTypeLimitApplies.middleware.loan.js`);
      req.previousLoanCount = parseFloat(totalPreviousLoanCount);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user is yet to take up to 2 previous loans checkIfEmploymentTypeLimitApplies.middleware.loan.js`);
    const [ employedUserLoanAmountLimit, selfEmployedUserLoanAmountLimit, unemployedUserLoanAmountLimit, retiredUserLoanAmountLimit,
      studentUserLoanAmountLimit, tierOneMaximumLoanAmountDetails, tierTwoMaximumLoanAmountDetails ] = await Promise.all([
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'employed_loan_amount_percentage_limit' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'self_employed_loan_amount_percentage_limit' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'unemployed_loan_amount_percentage_limit' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'retired_loan_amount_percentage_limit' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'student_loan_amount_percentage_limit' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'tier_one_maximum_loan_amount' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'tier_two_maximum_loan_amount' ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: constant limit values fetched from the DB checkIfEmploymentTypeLimitApplies.middleware.loan.js`);
    const tierMaximumLoanAmountChoice = Number(user.tier) === 1 ? tierOneMaximumLoanAmountDetails : tierTwoMaximumLoanAmountDetails;
    const employedUserAllowableAmount = ((parseFloat(employedUserLoanAmountLimit.value) / 100) * (parseFloat(tierMaximumLoanAmountChoice.value)));
    const selfEmployedUserAllowableAmount = ((parseFloat(selfEmployedUserLoanAmountLimit.value) / 100) * (parseFloat(tierMaximumLoanAmountChoice.value)));
    const unemployedUserAllowableAmount = ((parseFloat(unemployedUserLoanAmountLimit.value) / 100) * (parseFloat(tierMaximumLoanAmountChoice.value)));
    const retiredUserAllowableAmount = ((parseFloat(retiredUserLoanAmountLimit.value) / 100) * (parseFloat(tierMaximumLoanAmountChoice.value)));
    const studentUserAllowableAmount = ((parseFloat(studentUserLoanAmountLimit.value) / 100) * (parseFloat(tierMaximumLoanAmountChoice.value)));
    if (userEmploymentDetails.employment_type === 'employed') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: employed user is applying for a loan greater than ${parseFloat(employedUserLoanAmountLimit.value)}%
      of tier ${parseFloat(user.tier)} amount limit checkIfEmploymentTypeLimitApplies.middleware.loan.js`);
      req.previousLoanCount = parseFloat(totalPreviousLoanCount);
      req.userMaximumAllowableAmount = parseFloat(employedUserAllowableAmount);
      return next();
    }
    if (userEmploymentDetails.employment_type === 'self employed') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: self employed user is applying for a loan greater than
      ${parseFloat(selfEmployedUserLoanAmountLimit.value)}% of tier ${parseFloat(user.tier)} amount limit checkIfEmploymentTypeLimitApplies.middleware.loan.js`);
      req.previousLoanCount = parseFloat(totalPreviousLoanCount);
      req.userMaximumAllowableAmount = parseFloat(selfEmployedUserAllowableAmount);
      return next();
    }
    if (userEmploymentDetails.employment_type === 'unemployed') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: unemployed user is applying for a loan greater than ${parseFloat(unemployedUserLoanAmountLimit.value)}%
      of tier ${parseFloat(user.tier)} amount limit checkIfEmploymentTypeLimitApplies.middleware.loan.js`);
      req.previousLoanCount = parseFloat(totalPreviousLoanCount);
      req.userMaximumAllowableAmount = parseFloat(unemployedUserAllowableAmount);
      return next();
    }
    if (userEmploymentDetails.employment_type === 'retired') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: retired user is applying for a loan greater than ${parseFloat(retiredUserLoanAmountLimit.value)}%
      of tier ${parseFloat(user.tier)} amount limit checkIfEmploymentTypeLimitApplies.middleware.loan.js`);
      req.previousLoanCount = parseFloat(totalPreviousLoanCount);
      req.userMaximumAllowableAmount = parseFloat(retiredUserAllowableAmount);
      return next();
    }
    if (userEmploymentDetails.employment_type === 'student') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: student user is applying for a loan greater than ${parseFloat(studentUserLoanAmountLimit.value)}%
      of tier ${parseFloat(user.tier)} amount limit checkIfEmploymentTypeLimitApplies.middleware.loan.js`);
      req.previousLoanCount = parseFloat(totalPreviousLoanCount);
      req.userMaximumAllowableAmount = parseFloat(studentUserAllowableAmount);
      return next();
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_EMPLOYMENT_TYPE_LIMIT_APPLIES_MIDDLEWARE;
    logger.error(`validating user employment type loan amount limit based on number of previous loans
    failed::${enums.CHECK_IF_EMPLOYMENT_TYPE_LIMIT_APPLIES_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user bvn not on blacklisted bvn list
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkIfUserBvnNotBlacklisted = async(req, res, next) => {
  try {
    const { user } = req;
    const userBvn = await processOneOrNoneData(loanQueries.fetchUserBvn, [ user.user_id ]);
    const userDecryptedBvn = await Hash.decrypt(decodeURIComponent(userBvn.bvn));
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched user bvn checkIfUserBvnNotBlacklisted.middlewares.loan.js`);
    const allBlackListedBvns = await processAnyData(loanQueries.fetchAllBlackListedBvnsBlacklistedBvn, []);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched platform blacklisted bvns checkIfUserBvnNotBlacklisted.middlewares.loan.js`);
    await Promise.all(
      allBlackListedBvns.map(async(data) => {
        const decryptedBvn = await Hash.decrypt(decodeURIComponent(data.bvn));
        data.bvn = decryptedBvn;
        return data;
      })
    );
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
    successfully decrypted bvn coming from the database checkIfUserBvnNotBlacklisted.middlewares.loan.js`);
    if (allBlackListedBvns.find((data) => data.bvn === userDecryptedBvn)) {
      return ApiResponse.error(res, enums.BLACKLISTED_BVN_USER_DENIED_LOAN_APPLICATION, enums.HTTP_FORBIDDEN, enums.CHECK_IF_USER_BVN_NOT_BLACKLISTED_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_USER_BVN_NOT_BLACKLISTED_MIDDLEWARE;
    logger.error(`checking if user bvn is not on blacklisted bvn lists in the DB failed::${enums.CHECK_IF_USER_BVN_NOT_BLACKLISTED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check loan reschedule extension id sent
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkRescheduleExtensionExists = async(req, res, next) => {
  try {
    const { query: { extension_id }, user } = req;
    const [ existingRescheduleExtension ] = await processAnyData(loanQueries.fetchIndividualLoanReschedulingDurationById, [ extension_id.trim() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if loan rescheduling extension exists checkRescheduleExtensionExists.middlewares.loan.js`);
    if (existingRescheduleExtension) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan rescheduling extension exists checkRescheduleExtensionExists.middlewares.loan.js`);
      req.loanRescheduleExtensionDetails = existingRescheduleExtension;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan rescheduling extension does not exists checkRescheduleExtensionExists.middlewares.loan.js`);
    userActivityTracking(req.user.user_id, 94, 'fail');
    return ApiResponse.error(res, enums.LOAN_RESCHEDULING_EXTENSION_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_RESCHEDULE_EXTENSION_EXISTS_MIDDLEWARE);
  } catch (error) {
    userActivityTracking(req.user.user_id, 94, 'fail');
    error.label = enums.CHECK_RESCHEDULE_EXTENSION_EXISTS_MIDDLEWARE;
    logger.error(`checking if loan rescheduling extension exists failed::${enums.CHECK_RESCHEDULE_EXTENSION_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

async function getAvailableTicketUnits(ticketCategoryId) {
  return await processOneOrNoneData(adminShopQueries.getTicketUnitsAvailable, ticketCategoryId);
}
export const checkAvailableNumberOfTicketsBeforePurchase = async(req, res, next) => {
  try {
    const tickets = req.body.tickets;
    for (const ticket in tickets) {
      const { ticket_category_id, units } = tickets[ticket];
      const availableTickets = await getAvailableTicketUnits(ticket_category_id);
      if (units > availableTickets.units) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}::: Requested tickets[${units}] more than available tickets [${availableTickets.units}].`);
        return ApiResponse.error(
          res,
          enums.REQUESTED_NUMBER_OF_TICKETS_NOT_AVAILABLE,
          enums.HTTP_UNAUTHORIZED,
          enums.TICKET_PURCHASE_SHOP_CONTROLLER
        );
      }
    }
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 120, 'fail');
    error.label = enums.CHECK_AVAILABLE_TICKET_UNITS;
    logger.error(`available tickets not enough to fulfill order::${enums.CHECK_AVAILABLE_TICKET_UNITS_MESSAGE}`, error.message);
    return next(error);
  }
};

/**
 * check loan application status is currently ongoing or over due
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkIfOngoingLoanApplication = async(req, res, next) => {
  try {
    const { existingLoanApplication, user } = req;
    if (existingLoanApplication.status === 'ongoing') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application is an ongoing loan checkIfOngoingLoanApplication.middlewares.loan.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application is not an ongoing loan checkIfOngoingLoanApplication.middlewares.loan.js`);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_CANCELLING_FAILED_DUE_TO_CURRENT_STATUS(existingLoanApplication.status), enums.HTTP_FORBIDDEN,
      enums.CHECK_IF_ONGOING_LOAN_APPLICATION_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_ONGOING_LOAN_APPLICATION_MIDDLEWARE;
    logger.error(`checking if loan application is an ongoing one failed::${enums.CHECK_IF_ONGOING_LOAN_APPLICATION_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check loan reschedule request exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkLoanReschedulingRequest = async(req, res, next) => {
  try {
    const { params: { reschedule_id, loan_id }, user } = req;
    const [ loanRescheduleRequest ] = await processAnyData(loanQueries.fetchLoanRescheduleRequest, [ reschedule_id, loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if loan reschedule request exists checkLoanReschedulingRequest.middlewares.loan.js`);
    if (loanRescheduleRequest) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan reschedule request exists checkLoanReschedulingRequest.middlewares.loan.js`);
      if (loanRescheduleRequest.is_accepted) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan reschedule request has been previously processed
        checkLoanReschedulingRequest.middlewares.loan.js`);
        userActivityTracking(req.user.user_id, 75, 'fail');
        return ApiResponse.error(res, enums.LOAN_RESCHEDULE_REQUEST_PREVIOUSLY_PROCESSED_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_LOAN_RESCHEDULING_REQUEST_MIDDLEWARE);
      }
      req.loanRescheduleRequest = loanRescheduleRequest;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan reschedule request does not exists checkLoanReschedulingRequest.middlewares.loan.js`);
    userActivityTracking(req.user.user_id, 75, 'fail');
    return ApiResponse.error(res, enums.LOAN_RESCHEDULE_REQUEST_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_LOAN_RESCHEDULING_REQUEST_MIDDLEWARE);
  } catch (error) {
    userActivityTracking(req.user.user_id, 75, 'fail');
    error.label = enums.CHECK_LOAN_RESCHEDULING_REQUEST_MIDDLEWARE;
    logger.error(`checking if loan rescheduling request exists failed::${enums.CHECK_LOAN_RESCHEDULING_REQUEST_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check renegotiation amount is less than or equal to allowable amount
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const validateRenegotiationAmount = async(req, res, next) => {
  try {
    const { body, existingLoanApplication, user } = req;
    if (existingLoanApplication.max_possible_approval === null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan application does not have system maximum allowable loan amount value in the DB
      validateRenegotiationAmount.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 74, 'fail');
      return ApiResponse.error(res, enums.SYSTEM_MAXIMUM_ALLOWABLE_AMOUNT_HAS_NULL_VALUE, enums.HTTP_FORBIDDEN,
        enums.VALIDATE_RENEGOTIATION_AMOUNT_MIDDLEWARE);
    }
    if (parseFloat(existingLoanApplication.max_possible_approval) < parseFloat(body.new_loan_amount)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: system maximum allowable loan amount in the DB is lesser than the renegotiation amount
      validateRenegotiationAmount.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 74, 'fail');
      return ApiResponse.error(res, enums.RENEGOTIATION_AMOUNT_GREATER_THAN_ALLOWABLE_AMOUNT, enums.HTTP_FORBIDDEN,
        enums.VALIDATE_RENEGOTIATION_AMOUNT_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 74, 'fail');
    error.label = enums.VALIDATE_RENEGOTIATION_AMOUNT_MIDDLEWARE;
    logger.error(`checking if loan renegotiation amount is acceptable failed::${enums.VALIDATE_RENEGOTIATION_AMOUNT_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if applying user has cluster loan discounts
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */
export const checkIfUserHasClusterDiscount = async(req, res, next) => {
  try {
    const { user } = req;
    const [ userClusterDiscounts ] = await processAnyData(loanQueries.userAdminCreatedCluster, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: query to check if user has admin cluster loan discounts returns
    checkIfUserHasClusterDiscount.middlewares.loan.js`);
    const [ userBelongsToAPublicClusterType ] = await processAnyData(loanQueries.userNonAdminCreatedCluster, [ user.user_id, 'public' ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: query to check if user belongs to a public cluster returns
    checkIfUserHasClusterDiscount.middlewares.loan.js`);
    if (!userClusterDiscounts) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user does not have any admin cluster loan discounts
      checkIfUserHasClusterDiscount.middlewares.loan.js`);
      if (userBelongsToAPublicClusterType) {
        const [ fetchPublicClusterLoanDiscount ] = await processAnyData(loanQueries.fetchAdminSetEnvDetails, [ 'public_cluster_discount_interest_rate' ]);
        const interestRateValue =  parseFloat(fetchPublicClusterLoanDiscount.value);
        const userLoanDiscount = {
          interest_rate_type: 'discount',
          interest_rate_value: interestRateValue
        };
        req.clusterType = 'public';
        req.userLoanDiscount = userLoanDiscount;
        return next();
      }
      const userLoanDiscount = {
        interest_rate_type: null,
        interest_rate_value: null
      };
      req.clusterType = 'none';
      req.userLoanDiscount = userLoanDiscount;
      return next();
    }
    const userLoanDiscount = {
      interest_rate_type: userClusterDiscounts.interest_type,
      interest_rate_value: parseFloat(userClusterDiscounts.percentage_interest_type_value)
    };
    req.clusterType = 'admin_cluster';
    req.userLoanDiscount = userLoanDiscount;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: user has admin cluster loan discounts checkIfUserHasClusterDiscount.middlewares.loan.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_USER_HAS_CLUSTER_DISCOUNT_MIDDLEWARE;
    logger.error(`checking if user has admin cluster loan discount failed::${enums.CHECK_IF_USER_HAS_CLUSTER_DISCOUNT_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if applying user has cluster loan discounts
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof LoanMiddleware
 */

export const additionalUserChecksForLoan = async(req, res, next) => {
  try {
    const { user } = req;
    const [ userDefaultAccountDetails ] = await processAnyData(loanQueries.fetchUserDefaultBankAccount, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user default bank account details from the db additionalUserChecksForLoan.middlewares.loan.js`);
    if ((user.status === 'inactive') || (user.status === 'blacklisted')) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user status is inactive checkUserLoanEligibility.controllers.loan.js`);
      return ApiResponse.error(res, enums.USER_STATUS_INACTIVE_OR_BLACKLISTED(user.status), enums.HTTP_FORBIDDEN, enums.ADDITIONAL_USER_CHECKS_FOR_LOAN_MIDDLEWARE);
    }
    if (!userDefaultAccountDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not set default account in the db additionalUserChecksForLoan.middlewares.loan.js`);
      return ApiResponse.error(res, enums.NO_DEFAULT_BANK_ACCOUNT, enums.HTTP_FORBIDDEN, enums.ADDITIONAL_USER_CHECKS_FOR_LOAN_MIDDLEWARE);
    }
    const [ userDefaultDebitCardDetails ] = await processAnyData(loanQueries.fetchUserDefaultDebitCard, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user default debit card details from the db additionalUserChecksForLoan.middlewares.loan.js`);
    if (!userDefaultDebitCardDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not set default debit card in the db additionalUserChecksForLoan.middlewares.loan.js`);
      return ApiResponse.error(res, enums.NO_DEFAULT_DEBIT_CARD, enums.HTTP_FORBIDDEN, enums.ADDITIONAL_USER_CHECKS_FOR_LOAN_MIDDLEWARE);
    }
    req.userDefaultAccountDetails = userDefaultAccountDetails;
    return next();
  } catch (error) {
    error.label = enums.ADDITIONAL_USER_CHECKS_FOR_LOAN_MIDDLEWARE;
    logger.error(`running additional checks on user for loan application failed::${enums.ADDITIONAL_USER_CHECKS_FOR_LOAN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
