import merchantQueries from '../queries/queries.merchant';
import merchantBankAccountQueries from '../queries/queries.merchant-bank-account';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { resolveAccount } from '../services/service.paystack';

/**
 * Validate merchant details before creation
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminMerchantMiddleware
 */
export const validateCreateMerchant = async (req, res, next) => {
  try {
    const { admin } = req;
    const { email, phone_number, merchant_loan_limit, customer_loan_max_amount } = req.body;
    const existingMerchant = await processOneOrNoneData(
      merchantQueries.fetchMerchantByEmailAndPhoneNo,
      [email, phone_number]
    );
    if (existingMerchant) {
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Confirmed that email ${email} and phone number ${phone_number} already exists validateCreateMerchant.admin.middlewares.merchant.js`);
      return ApiResponse.error(
        res,
        'Merchant with this email or phone number already exists',
        enums.HTTP_UNPROCESSABLE_ENTITY
      )
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Confirmed that email ${email} and phone number ${phone_number} does not exist validateCreateMerchant.admin.middlewares.merchant.js`);
    if (customer_loan_max_amount >= merchant_loan_limit) {
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: validation failed, merchant limit less than customer limit validateCreateMerchant.admin.middlewares.merchant.js`);
      return ApiResponse.error(
        res,
        'Merchant limit cannot be less than customer limit',
        enums.HTTP_UNPROCESSABLE_ENTITY
      );
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: validation successful, merchant limit greater than customer limit validateCreateMerchant.admin.middlewares.merchant.js`);
    return next();
  } catch (error) {
    logger.error(`validating merchant details failed::AdminMerchantMiddleware::validateCreateMerchant`, error.message);
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
 * Check if merchant exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminMerchantMiddleware
 */
export const checkIfMerchantUserExists = async (req, res, next) => {
  try {
    const { admin } = req;
    const userId = req.query.user_id || req.body.user_id;
    const merchantId = req.params.merchant_id;
    const user = await processOneOrNoneData(
      merchantQueries.fetchMerchantUserById,
      [userId, merchantId]
    );
    if (!user) {
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: successfully confirmed that user with ID ${userId} does not exist checkIfMerchantUserExists.admin.middlewares.merchant.js`);
      return ApiResponse.error(
        res,
        enums.ACCOUNT_NOT_EXIST('User'),
        enums.HTTP_NOT_FOUND
      )
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: successfully confirmed that user with ID ${userId} exists checkIfMerchantUserExists.admin.middlewares.merchant.js`);
    req.user = user;
    return next();
  } catch (error) {
    logger.error(`checking if queried user id exists in the DB failed::AdminMerchantMiddleware::checkIfMerchantUserExists`, error.message);
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

    if (type === 'create' || accountDetailsAdded) {
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
      req.body.account_name = data.account_name;
    }

    if (type === 'update' && accountDetailsAdded) {
      const merchantId = req.params.merchant_id;
      const existingBankAccount = await processOneOrNoneData(
        merchantBankAccountQueries.findMerchantBankAccount,
        [merchantId]
      );
      req.body.existingBankAccount = existingBankAccount;
    }
   
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Merchant bank account validation successful validateMerchantBankAccount.admin.middlewares.merchant.js`);
    return next();
  } catch (error) {
    logger.error(`Validating merchant bank account details before creating merchant failed:::AdminMerchantMiddleware::validateMerchantBankAccount`, error.message);
    return next(error);
  }
};
