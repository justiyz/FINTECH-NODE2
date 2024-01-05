import merchantQueries from '../queries/queries.merchant';
import merchantBankAccountQueries from '../queries/queries.merchant-bank-account';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import * as Hash from '../../lib/utils/lib.util.hash';
import { resolveAccount } from '../services/service.paystack';

/**
 * Validate merchant secret key before creating a merchant account
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminMerchantMiddleware
 */
export const validateCreateMerchantSecretKey = async (req, res, next) => {
  try {
    const { admin } = req;
    const { secret_key, email } = req.body;
    const payload = await Hash.decrypt(secret_key);
    logger.info(`
      ${enums.CURRENT_TIME_STAMP},${admin.admin_id}:::Info: 
      successfully decoded the secret key validateCreateMerchantSecretKey.admin.middlewares.merchant.js`
    );
    if (!payload.email || payload.email !== email) {
      logger.info(`
        ${enums.CURRENT_TIME_STAMP},${admin.admin_id}:::Info: 
        confirmed that secret key is invalid validateCreateMerchantSecretKey.admin.middlewares.merchant.js`
      );
      return ApiResponse.error(
        res,
        enums.INVALID_MERCHANT_API_KEY,
        enums.HTTP_BAD_REQUEST,
        enums.VALIDATE_CREATE_MERCHANT_SECRET_KEY_MIDDLEWARE
      );
    }
    logger.info(`
      ${enums.CURRENT_TIME_STAMP},${admin.admin_id}:::Info: 
      successfully validated the secret key validateCreateMerchantSecretKey.admin.middlewares.merchant.js`
    );
    return next();
  } catch (error) {
    logger.error(`Validating secret key before creating merchant failed::${enums.VALIDATE_CREATE_MERCHANT_SECRET_KEY_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * Check for duplicate merchant details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminMerchantMiddleware
 */
export const checkForDuplicateMerchant = async (req, res, next) => {
  try {
    const { admin } = req;
    const { email, phone_number } = req.body;
    const existingMerchant = await processOneOrNoneData(
      merchantQueries.fetchMerchantByEmailAndPhoneNo,
      [email, phone_number]
    );
    if (existingMerchant) {
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Confirmed that email ${email} and phone number ${phone_number} already exists checkForDuplicateMerchant.admin.middlewares.merchant.js`);
      return ApiResponse.error(
        res,
        'Merchant with this email or phone number already exists',
        enums.HTTP_UNPROCESSABLE_ENTITY
      )
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Confirmed that email ${email} and phone number ${phone_number} does not exist checkForDuplicateMerchant.admin.middlewares.merchant.js`);
    return next();
  } catch (error) {
    logger.error(`checking for duplicate merchant email or phone number in the DB failed::AdminMerchantMiddleware::checkForDuplicateMerchant`, error.message);
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
export const checkIfMerchantExists = async (req, res, next) => {
  try {
    const { admin } = req;
    const merchantId = req.params.merchant_id;
    const merchant = await processOneOrNoneData(
      merchantQueries.fetchMerchantByMerchantId,
      [merchantId]
    );
    if (!merchant) {
      logger.info(`
        ${enums.CURRENT_TIME_STAMP},${admin.admin_id}:::Info: 
        successfully confirmed that merchant: ${merchantId} does not exist 
        checkIfMerchantExists.admin.middlewares.merchant.js`
      );
      return ApiResponse.error(
        res,
        enums.MERCHANT_NOT_FOUND,
        enums.HTTP_NOT_FOUND
      )
    }
    logger.info(`
      ${enums.CURRENT_TIME_STAMP},${admin.admin_id}:::Info: 
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
 * Check if merchant bank account is valid
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminMerchantMiddleware
 */
export const validateMerchantBankAccount = (type = '') => async (req, res, next) => {
  try {
    const { admin, body } = req;
    const { account_number, bank_name, bank_code } = body;
    // check if account details added
    const accountDetailsAdded = account_number && bank_name && bank_code;
    req.body.account_details_added = accountDetailsAdded;
    if (!accountDetailsAdded) {
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Merchant added without bank account details validateMerchantBankAccount.admin.middlewares.merchant.js`);
      return next();
    }
    // resolve account details
    const { status, data } = await resolveAccount(account_number.trim(), bank_code.trim());
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Merchant bank account details resolved successfully validateMerchantBankAccount.admin.middlewares.merchant.js`);
    if (status !== true) {
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Incorrect merchant bank account number provided validateMerchantBankAccount.admin.middlewares.merchant.js`);
      return ApiResponse.error(
        res,
        'Incorrect account number',
        enums.HTTP_UNPROCESSABLE_ENTITY,
        'MerchantMiddleware::validateMerchantBankAccount'
      );
    }
    // check for duplicate records
    if (type == 'update') {
      const merchantId = req.params.merchant_id;
      const existingBankAccount = await processOneOrNoneData(
        merchantBankAccountQueries.findDuplicateBankAccount,
        [merchantId, bank_code, account_number]
      );

      if (existingBankAccount) {
        return ApiResponse.error(
          res,
          'Bank account already added for this merchant',
          enums.HTTP_BAD_REQUEST,
          'MerchantMiddleware::validateMerchantBankAccount'
        );
      }
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Merchant bank account validation successful validateMerchantBankAccount.admin.middlewares.merchant.js`);
    req.body.account_name = data.account_name;
    return next();
  } catch (error) {
    logger.error(`Validating merchant bank account details before creating merchant failed:::AdminMerchantMiddleware::validateMerchantBankAccount`, error.message);
    return next(error);
  }
};
