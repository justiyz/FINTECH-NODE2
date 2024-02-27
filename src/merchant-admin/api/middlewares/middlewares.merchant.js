import merchantQueries from '../queries/queries.merchant';
import merchantBankAccountQueries from '../queries/queries.merchant-bank-account';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { resolveAccount } from '../services/service.paystack';
import * as Hash from '../../../users/lib/utils/lib.util.hash';
import userQueries from '../../../users/api/queries/queries.user';
import adminQueries from '../queries/queries.admin';
import authQueries from '../queries/queries.auth';
import * as UserHash from '../../../users/lib/utils/lib.util.hash';
import {adminActivityTracking} from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';
import {
  COMPARE_MERCHANT_PASSWORD_MIDDLEWARE,
  VERIFY_MERCHANT_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE
} from '../../../users/lib/enums/lib.enum.labels';
import {MERCHANT_ACCOUNT_DEACTIVATED} from '../../../users/lib/enums/lib.enum.messages';

/**
 * Validate merchant details before creation
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminMerchantMiddleware
 */
export const validateCreateMerchant = async(req, res, next) => {
  try {
    const { admin } = req;
    const { email, phone_number, merchant_loan_limit, customer_loan_max_amount } = req.body;
    const existingMerchant = await processOneOrNoneData(
      merchantQueries.fetchMerchantByEmailAndPhoneNo,
      [ email, phone_number ]
    );
    if (existingMerchant) {
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}::Info: Confirmed that email ${email} and phone number ${phone_number} already exists validateCreateMerchant.admin.middlewares.merchant.js`);
      return ApiResponse.error(
        res,
        'Merchant with this email or phone number already exists',
        enums.HTTP_UNPROCESSABLE_ENTITY
      );
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}::Info: Confirmed that email ${email} and phone number ${phone_number} does not exist validateCreateMerchant.admin.middlewares.merchant.js`);
    if (+customer_loan_max_amount >= +merchant_loan_limit) {
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}::Info: validation failed, merchant limit less than customer limit validateCreateMerchant.admin.middlewares.merchant.js`);
      return ApiResponse.error(
        res,
        'Merchant limit cannot be less than customer limit',
        enums.HTTP_UNPROCESSABLE_ENTITY
      );
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}::Info: validation successful, merchant limit greater than customer limit validateCreateMerchant.admin.middlewares.merchant.js`);
    return next();
  } catch (error) {
    logger.error('validating merchant details failed::AdminMerchantMiddleware::validateCreateMerchant', error.message);
    return next(error);
  }
};

export const validateMerchantForgotPasswordAndPinToken = async(req, res, next) => {
  try {
    let token = req.headers.authorization;
    if (!token) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that no authentication token was sent with the headers
      validateForgotPasswordAndPinToken.middlewares.auth.js`);
      return ApiResponse.error(res, enums.NO_TOKEN, enums.HTTP_UNAUTHORIZED, enums.GET_AUTH_TOKEN_MIDDLEWARE);
    }
    if (!token.startsWith('Bearer ')) {
      return ApiResponse.error(res, enums.INVALID_TOKEN, enums.HTTP_UNAUTHORIZED, enums.GET_AUTH_TOKEN_MIDDLEWARE);
    }
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully extracts token validateForgotPasswordAndPinToken.middlewares.auth.js`);
    const decoded = Hash.decodeToken(token);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded authentication token sent using the authentication secret
    validateForgotPasswordAndPinToken.middlewares.auth.js`);
    if (decoded.message) {
      if (decoded.message === 'jwt expired') {
        return ApiResponse.error(res, enums.SESSION_EXPIRED, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded authentication token has a message which is an
      error message validateForgotPasswordAndPinToken.middlewares.auth.js`);
      return ApiResponse.error(res, decoded.message, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE);
    }
    if (decoded.email) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded authentication token sent using the authentication secret
      validateForgotPasswordAndPinToken.middlewares.auth.js`);
      const [ user ] = await processAnyData(merchantQueries.fetchSingleMerchantByEmail, [ decoded.email ]);
      req.user = user;
      return next();
    }
  } catch (error) {
    error.label = enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE;
    logger.error(`validating authentication token failed:::${enums.VALIDATE_AUTH_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * Check if merchant exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminMerchantMiddleware
 */
export const checkIfMerchantExists = async(req, res, next) => {
  try {
    const { admin, headers } = req;
    const merchantId = headers['x-merchant-id'];
    const merchant = await processOneOrNoneData(
      merchantQueries.fetchMerchantByMerchantId,
      [ merchantId ]
    );
    if (!merchant) {
      logger.info(`
        ${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}:::Info:
        successfully confirmed that merchant: ${merchantId} does not exist
        checkIfMerchantExists.admin.middlewares.merchant.js`
      );
      return ApiResponse.error(
        res,
        enums.MERCHANT_NOT_FOUND,
        enums.HTTP_NOT_FOUND
      );
    }
    logger.info(`
      ${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}:::Info:
      successfully confirmed that merchant: ${merchantId} exists
      checkIfMerchantExists.admin.middlewares.merchant.js`
    );
    req.merchant = merchant;
    return next();
  } catch (error) {
    logger.error(`checking if queried merchant id exists in the DB failed::${enums.CHECK_IF_MERCHANT_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};


/**
 * Check if merchant admin exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminMerchantMiddleware
 */
export const checkIfMerchantAdminExists = async(req, res, next) => {
  try {
    const { admin, body: {email, phone_number}, params: {merchant_id} } = req;
    const merchantAdmin = await processOneOrNoneData(
      merchantQueries.fetchMerchantAdminByEmailAndPhoneNo,
      [ email, phone_number, merchant_id ]
    );
    if (merchantAdmin) {
      logger.info(`
        ${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}:::Info:
        successfully confirmed that admin for merchant: ${merchant_id} exist
        checkIfMerchantAdminExists.admin.middlewares.merchant.js`
      );
      return ApiResponse.error(
        res,
        enums.MERCHANT_ADMIN_EXIST,
        enums.HTTP_NOT_FOUND
      );
    }
    logger.info(`
      ${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}:::Info:
      successfully confirmed that admin for  merchant: ${merchant_id} does not exist
      checkIfMerchantAdminExists.admin.middlewares.merchant.js`
    );
    return next();
  } catch (error) {
    logger.error(`checking if queried merchant id exists in the DB failed::${enums.CHECK_IF_MERCHANT_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * Check if merchant exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminMerchantMiddleware
 */
export const checkIfMerchantUserExists = async(req, res, next) => {
  try {
    const { admin, headers } = req;
    const userId = req.query.user_id || req.body.user_id;
    const merchantId = headers['x-merchant-id'];
    const user = await processOneOrNoneData(
      merchantQueries.fetchMerchantUserById,
      [ userId, merchantId ]
    );
    if (!user) {
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}::Info: successfully confirmed that user with ID ${userId} does not exist checkIfMerchantUserExists.admin.middlewares.merchant.js`);
      return ApiResponse.error(
        res,
        enums.ACCOUNT_NOT_EXIST('User'),
        enums.HTTP_NOT_FOUND
      );
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}::Info: successfully confirmed that user with ID ${userId} exists checkIfMerchantUserExists.admin.middlewares.merchant.js`);
    req.user = user;
    return next();
  } catch (error) {
    logger.error('checking if queried user id exists in the DB failed::AdminMerchantMiddleware::checkIfMerchantUserExists', error.message);
    return next(error);
  }
};

/**
 * Check if merchant bank account is valid
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminMerchantMiddleware
 */
export const validateMerchantBankAccount = (type = '') => async(req, res, next) => {
  try {
    const { admin, body } = req;
    const { account_number, bank_name, bank_code } = body;
    // check if account details added
    const accountDetailsAdded = account_number && bank_name && bank_code;
    req.body.account_details_added = accountDetailsAdded;

    if (type === 'create' || accountDetailsAdded) {
      // resolve account details
      const { status, data } = await resolveAccount(account_number.trim(), bank_code.trim());
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}::Info: Merchant bank account details resolved successfully validateMerchantBankAccount.admin.middlewares.merchant.js`);
      if (status !== true) {
        logger.info(`${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}::Info: Incorrect merchant bank account number provided validateMerchantBankAccount.admin.middlewares.merchant.js`);
        return ApiResponse.error(
          res,
          'Incorrect account number',
          enums.HTTP_UNPROCESSABLE_ENTITY,
          'MerchantMiddleware::validateMerchantBankAccount'
        );
      }
      req.body.account_name = data.account_name;
    }

    if (type === 'update' && accountDetailsAdded) {
      const merchantId = req.params.merchant_id;
      const existingBankAccount = await processOneOrNoneData(
        merchantBankAccountQueries.findMerchantBankAccount,
        [ merchantId ]
      );
      req.body.existingBankAccount = existingBankAccount;
    }

    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.merchant_admin_id}::Info: Merchant bank account validation successful validateMerchantBankAccount.admin.middlewares.merchant.js`);
    return next();
  } catch (error) {
    logger.error('Validating merchant bank account details before creating merchant failed:::AdminMerchantMiddleware::validateMerchantBankAccount', error.message);
    return next(error);
  }
};

export const compareMerchantPassword = async(req, res, next) => {
  try {
    const { body: { password }, merchant } = req;
    const [ merchantPasswordDetails ] = await processAnyData(merchantQueries.fetchMerchantPassword, [ merchant.merchant_id ]);
    const passwordValid = await UserHash.compareData(password, merchantPasswordDetails.password);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${merchant.merchant_id}:::Info: successfully returned compared passwords response compareMerchantPassword.admin.middlewares.auth.js`);
    if (passwordValid) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${merchant.merchant_id}:::Info: login password matches compareMerchantPassword.admin.middlewares.auth.js`);
      return next();
    }
    await adminActivityTracking(merchant.merchant_id, 9, 'fail', descriptions.login_request_failed(`${merchant.first_name} ${merchant.last_name}`));
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${merchant.merchant_id}:::Info: login password does not match compareMerchantPassword.admin.middlewares.auth.js`);
    return ApiResponse.error(res, enums.INVALID_PASSWORD, enums.HTTP_BAD_REQUEST, enums.COMPARE_MERCHANT_PASSWORD_MIDDLEWARE);
  } catch (error) {
    error.label = enums.COMPARE_MERCHANT_PASSWORD_MIDDLEWARE;
    logger.error(`comparing incoming and already set password in the DB failed:::${enums.COMPARE_MERCHANT_PASSWORD_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

export const verifyMerchantLoginVerificationToken = async(req, res, next) => {
  try {
    const { body: { otp, email } } = req;
    const [ merchant ] = await processAnyData(merchantQueries.getMerchantByEmailV2, [ email.trim().toLowerCase() ]);
    if (!merchant) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decoded that the user with the email does not exist in the DB
      verifyLoginVerificationToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.ACCOUNT_NOT_EXIST('Merchant'), enums.HTTP_UNAUTHORIZED, enums.VERIFY_MERCHANT_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    const  otpMerchant  = await processAnyData(merchantQueries.fetchMerchantByVerificationOTP, [ otp, merchant.merchant_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if correct OTP is sent verifyLoginVerificationToken.admin.middlewares.auth.js`);
    if (!otpMerchant) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: OTP is invalid verifyVerificationToken.middlewares.auth.js`);
      await recordMerchantInvalidOtpInputCount(res, merchant);
      return ApiResponse.error(res, enums.INVALID('OTP code'), enums.HTTP_BAD_REQUEST, enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpMerchant.merchant_id}:::Info: OTP is valid verifyLoginVerificationToken.admin.middlewares.auth.js`);
    if (merchant.invalid_verification_token_count >= 5) {
      await recordMerchantInvalidOtpInputCount(res, merchant);
    }
    const isExpired = new Date().getTime() > new Date(otpMerchant.verification_token_expires).getTime();
    if (isExpired) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpMerchant.merchant_id}:::Info: successfully confirms that verification token has expired
      verifyLoginVerificationToken.admin.middlewares.auth.js`);
      return ApiResponse.error(res, enums.EXPIRED_VERIFICATION_TOKEN, enums.HTTP_FORBIDDEN, enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${otpMerchant.merchant_id}:::Info: successfully confirms that verification token is still active
    verifyLoginVerificationToken.admin.middlewares.auth.js`);
    req.admin = otpMerchant;
    req.merchant = merchant;
    return next();
  } catch (error) {
    error.label = enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE;
    logger.error(`verify login verification token failed::${enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

const recordMerchantInvalidOtpInputCount = async(res, merchant) => {
  await processOneOrNoneData(merchantQueries.updateAdminInvalidOtpCount, [ merchant.merchant_id ]);
  if (merchant.invalid_verification_token_count >= 4) { // at 5th attempt or greater perform action
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: confirms user has entered invalid otp more than required limit recordAdminInvalidOtpInputCount.admin.middlewares.auth.js`);
    await processOneOrNoneData(merchantQueries.deactivateMerchant, [ merchant.merchant_id ]);
    return ApiResponse.error(res, enums.MERCHANT_ACCOUNT_DEACTIVATED, enums.HTTP_UNAUTHORIZED, enums.VERIFY_LOGIN_VERIFICATION_TOKEN_MIDDLEWARE);
  }
};

export const validateUnAuthenticatedMerchant = (type = '') => async(req, res, next) => {
  try {
    const { body } = req;
    const payload = body.email || req.merchant.email;
    const [ merchant ] = await processAnyData(adminQueries.getMerchantByEmailV2, [ payload.trim().toLowerCase() ]);
    if (!merchant && (type === 'login' || type === 'verify')) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: confirms that merchant's email is not existing in the database validateUnAuthenticatedMerchant.admin.middlewares.admin.js`);
      return ApiResponse.error(res, type === 'login' ? enums.INVALID_PASSWORD : enums.ACCOUNT_NOT_EXIST('Merchant'),
        enums.HTTP_BAD_REQUEST, enums.VALIDATE_UNAUTHENTICATED_MERCHANT_MIDDLEWARE);
    }
    if (merchant && (merchant.status !== 'active')) {

      const merchantStatus = merchant.is_deleted ? 'deleted, kindly contact support team'  : `${merchant.status}, kindly contact support team`;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${merchant.admin_id}:::Info: successfully confirms that merchant account is ${merchantStatus} in the database
      validateUnAuthenticatedAdmin.admin.middlewares.admin.js`);
      return ApiResponse.error(res, enums.USER_ACCOUNT_STATUS(merchantStatus), enums.HTTP_UNAUTHORIZED, enums.VALIDATE_UNAUTHENTICATED_ADMIN_MIDDLEWARE);
    }

    req.merchant = merchant;
    return next();
  } catch (error) {
    error.label = enums.VALIDATE_UNAUTHENTICATED_MERCHANT_MIDDLEWARE;
    logger.error(`getting merchants details from the database failed::${enums.VALIDATE_UNAUTHENTICATED_MERCHANT_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

export const validateUnAuthenticatedMerchantV2 = (type = '') => async(req, res, next) => {
  try {
    const { body } = req;
    const payload = body.email || req.merchant.email;
    const [ merchant ] = await processAnyData(adminQueries.getMerchantByEmailV2, [ payload.trim().toLowerCase() ]);
    console.log(merchant);
    if (!merchant && (type === 'login' || type === 'verify')) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: confirms that merchant's email is not existing in the database validateUnAuthenticatedMerchant.admin.middlewares.admin.js`);
      return ApiResponse.error(res, type === 'login' ? enums.INVALID_PASSWORD : enums.ACCOUNT_NOT_EXIST('Merchant'),
        enums.HTTP_BAD_REQUEST, enums.VALIDATE_UNAUTHENTICATED_MERCHANT_MIDDLEWARE);
    }
    if (merchant && (merchant.status !== 'active' || merchant.is_deleted)) {
      const merchantStatus = merchant.is_deleted ? 'deleted, kindly contact support team'  : `${merchant.status}, kindly contact support team`;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${merchant.admin_id}:::Info: successfully confirms that merchant account is ${merchantStatus} in the database
      validateUnAuthenticatedAdmin.admin.middlewares.admin.js`);
      return ApiResponse.error(res, enums.USER_ACCOUNT_STATUS(merchantStatus), enums.HTTP_UNAUTHORIZED, enums.VALIDATE_UNAUTHENTICATED_ADMIN_MIDDLEWARE);
    }
    req.merchant = merchant;
    return next();
  } catch (error) {
    error.label = enums.VALIDATE_UNAUTHENTICATED_MERCHANT_MIDDLEWARE;
    logger.error(`getting merchants details from the database failed::${enums.VALIDATE_UNAUTHENTICATED_MERCHANT_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

