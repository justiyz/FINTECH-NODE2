import dayjs from 'dayjs';
import momentTZ from 'moment-timezone';
import merchantQueries from '../queries/queries.merchant';
import merchanBankAccountQueries from '../queries/queries.merchant-bank-account';
import roleQueries from '../queries/queries.role';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import MailService from '../services/services.email';
import * as Hash from '../../lib/utils/lib.util.hash';
import * as UserHelpers from '../../../users/lib/utils/lib.util.helpers';
import * as AdminHelpers from '../../lib/utils/lib.util.helpers';
import MerchantPayload from '../../lib/payloads/lib.payload.merchant';
import config from '../../../users/config/index';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';
import { fetchBanks, resolveAccount, createTransferRecipient } from '../services/service.paystack';

const { SEEDFI_NODE_ENV } = config;

/**
 * Create merchant account
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {String} - Returns success message.
 * @memberof AdminMerchantController
 */
export const createMerchant = async (req, res, next) => {
  try {
    const { admin } = req;
    const payload = MerchantPayload.createMerchant(req.body);
    const { merchant_id } = await processOneOrNoneData(
      merchantQueries.createMerchant,
      payload
    );
    req.body.merchant_id = merchant_id;
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: merchant successfully created createMerchant.admin.controllers.merchant.js`);
    const description = descriptions.create_merchant(
      `${admin.first_name} ${admin.last_name}`,
      `${req.body.business_name}`
    );
    await adminActivityTracking(
      admin.admin_id,
      65,
      'success',
      description
    );
    if (req.body.account_details_added) {
      await createMerchantBankAccount(admin, req.body);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Complete request CreateMerchant.admin.controllers.merchant.js`);
    return ApiResponse.success(
      res,
      enums.MERCHANT_CREATED_SUCCESSFULLY,
      enums.HTTP_OK,
    );
  } catch (error) {
    const description = descriptions.create_merchant_failed(
      `${req.admin.first_name} ${req.admin.last_name}`,
      `${req.body.business_name}`
    );
    await adminActivityTracking(
      req.admin.admin_id,
      65,
      'fail',
      description
    );
    error.label = enums.CREATE_MERCHANT_CONTROLLER;
    logger.error(`Create merchant account failed:::${enums.CREATE_MERCHANT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * Generate merchant secret key
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {Object} - Returns a new merchant secret key.
 * @memberof AdminMerchantController
 */
export const generateMerchantKey = async (req, res, next) => {
  try {
    const { email } = req.body;
    const payload = { email };
    const secretKey = await Hash.encrypt(payload);
    logger.info(`${enums.CURRENT_TIME_STAMP},Info: Complete request generateMerchantKeyRequest.merchant.controllers.auth.js`);
    return ApiResponse.success(
      res,
      enums.MERCHANT_KEY_GENERATED_SUCCESSFULLY,
      enums.HTTP_OK,
      { secretKey }
    );
  } catch (error) {
    logger.error(`Generate merchant key failed:::${enums.CREATE_MERCHANT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch, filter and search all merchants with pagination
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {Object} - Returns merchant details.
 * @memberof AdminMerchantController
 */
export const fetchMerchants = async (req, res, next) => {
  try {
    const { admin } = req;
    const page = req.query.page || 1;
    const perPage = req.query.per_page || 20;
    const offset = perPage * page - perPage;
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Calculated offset for fetching merchants fetchMerchants.admin.controllers.merchant.js`);
    const merchants = await processAnyData(
      merchantQueries.fetchAndSearchMerchants,
      [
        req.query.search,
        req.query.status,
        offset,
        perPage
      ]
    );
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Successfully fetched merchants from the DB fetchMerchants.admin.controllers.merchant.js`);
    const count = merchants.length !== 0 ? merchants[0].total : 0;
    if (Array.isArray(merchants)) {
      merchants.forEach((item) => delete item.total);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Format result for request fetchMerchants.admin.controllers.merchant.js`);
    const result =  {
      page: parseFloat(page),
      total_count: Number(count),
      total_pages: AdminHelpers.calculatePages(Number(count), Number(perPage)),
      merchants
    };
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Complete request to fetch all merchants fetchMerchants.admin.controllers.merchant.js`);
    return ApiResponse.success(
      res,
      enums.FETCHED_MERCHANTS_SUCCESSFULLY,
      enums.HTTP_OK,
      result
    );
  } catch (error) {
    logger.error(`Fetch merchants failed:::${enums.FETCH_MERCHANT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch available bank lists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response of the details of the list of available banks
 * @memberof AdminMerchantController
 */
export const fetchAvailableBankList = async (req, res, next) => {
  try {
    const { admin } = req;
    const data = await fetchBanks();
    logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ admin.admin_id }:::Info: bank lists returned from paystack fetchAvailableBankList.controller.merchant.js`);
    return ApiResponse.success(
      res,
      data.message,
      enums.HTTP_OK,
      data.data
    );
  } catch (error) {
    error.label = enums.FETCH_BANKS_CONTROLLER;
    logger.error(`fetching list of banks from paystack failed:::MerchantController::fetchAvailableBankList`, error.message);
    return next(error);
  }
};

/**
 * fetch name attached to a bank account number
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminMerchantController
 */
export const resolveBankAccountNumber = async(req, res, next) => {
  try {
    const { admin, query } = req;
    const accountNumber = query.account_number;
    const bankCode = query.bank_code;
    const data = await resolveAccount(
      accountNumber.trim(),
      bankCode.trim(),
    );
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: account number resolve response returned from paystack resolveBankAccountNumberName.admin.controllers.merchant.js`);
    if (data?.status !== true) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: account number not resolved successfully by paystack resolveBankAccountNumberName.admin.controllers.merchant.js`);
      return ApiResponse.error(
        res,
        'Could not resolve account number',
        enums.HTTP_UNPROCESSABLE_ENTITY,
        'MerchantController::resolveBankAccountNumber'
      );
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: account number resolved successfully by paystack resolveBankAccountNumberName.admin.controllers.merchant.js`);
    return ApiResponse.success(
      res,
      data.message,
      enums.HTTP_OK,
      data.data
    );    
  } catch (error) {
    error.label = 'MerchantController::resolveBankAccountNumberName';
    logger.error(`Resolving bank account name from paystack failed:::MerchantController::resolveBankAccountNumberName`, error.message);
    return next(error);
  }
};

/**
 * Update merchant details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {Object} - Returns updated merchant details.
 * @memberof AdminMerchantController
 */
export const updateMerchant = async (req, res, next) => {
  try {
    const { admin, merchant } = req;
    const {
      business_name,
      status,
      phone_number,
      interest_rate,
      address
    } = req.body;

    const updatedMerchantDetails = await processAnyData(
      merchantQueries.updateMerchant,
      [
        merchant.merchant_id,
        business_name || merchant.business_name,
        status || merchant.status,
        phone_number || merchant.phone_number,
        interest_rate || merchant.interest_rate,
        address || merchant.address
      ]
    );
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: confirm that merchant details has been edited and updated in the DB. updateMerchant.admin.controllers.merchant.js`);

    return ApiResponse.success(
      res,
      enums.MERCHANT_UPDATED_SUCCESSFULLY,
      enums.HTTP_OK,
      updatedMerchantDetails
    );
  } catch (error) {
    logger.error(`Update merchant details failed:::${enums.FETCH_MERCHANT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * Create merchant bank account details
 * @param {Object} admin - Admin details.
 * @param {Object} payload - Bank account details to be created.
 * @returns {Promise<void | Error>}
 * @memberof AdminMerchantController
 */
const createMerchantBankAccount = async (admin, payload) => {
  try {
    // create transfer recipient
    const { account_name, account_number, bank_code } = payload;
    const { data } = await createTransferRecipient({
      account_name,
      account_number,
      bank_code,
    });
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Merchant paystack transfer recipient code generated CreateMerchantBankAccount.admin.controllers.merchant.js`);
    payload.transfer_recipient_code = data.recipient_code;
    // create merchant bank account
    const bankAccountDetails = MerchantPayload.addMerchantBankAccount(payload);
    await processAnyData(
      merchanBankAccountQueries.addBankAccount,
      bankAccountDetails
    );
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Merchant bank account saved successfully CreateMerchantBankAccount.admin.controllers.merchant.js`);
  } catch (error) {
    error.label = 'MerchantController::CreateMerchantBankAccount';
    logger.error(`creating merchant bank account failed:::MerchantController::CreateMerchantBankAccount`, error.message);
    return error;
  } 
};
