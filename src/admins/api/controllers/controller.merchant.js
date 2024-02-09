import dayjs from 'dayjs';
import momentTZ from 'moment-timezone';
import merchantQueries from '../queries/queries.merchant';
import merchanBankAccountQueries from '../queries/queries.merchant-bank-account';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import * as Hash from '../../lib/utils/lib.util.hash';
import * as AdminHelpers from '../../lib/utils/lib.util.helpers';
import MerchantPayload from '../../lib/payloads/lib.payload.merchant';
import config from '../../../users/config/index';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';
import { fetchBanks, resolveAccount, createTransferRecipient } from '../services/service.paystack';
import { userCreditScoreBreakdown } from '../services/services.seedfiCreditscoring';
import * as Helpers from "../../../users/lib/utils/lib.util.helpers";
import authQueries from "../../../users/api/queries/queries.auth";
import queriesAdmin from "../queries/queries.admin";

const { SEEDFI_NODE_ENV } = config;

/**
 * Create Merchant Admin Record
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*|undefined>}
 */
export const createMerchantAdmin = async (req, res, next) => {
  const { body } = req;
  const expireAt = dayjs().add(10, 'minutes');
  const expirationTime = dayjs(expireAt);
  const signupOtpRequest =  1;
  const otp =  Helpers.generateOtp();
  try {
    body.hash = await Hash.generateAdminResetPasswordToken({ email: body.email });
    const password_string = Helpers.generatePassword(8);
    body.password = await Hash.hashData(password_string);
    body.verification_token_expires = expirationTime;
    body.verification_token = signupOtpRequest;

    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random OTP generated signup.controllers.auth.js`);
    const [ existingOtp ] = await processAnyData(authQueries.getUserByVerificationToken, [ otp ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if OTP is existing in the database signup.controllers.auth.js`);
    if (existingOtp) {
      return createMerchantAdmin(req, res, next);

    }

    const payload = MerchantPayload.createMerchantAdmin(body);
    const result = await processOneOrNoneData(merchantQueries.createMerchantAdmin, payload);
    body.merchant_admin_id = result.merchant_admin_id;
    logger.info(`${enums.CURRENT_TIME_STAMP}::Info: merchant admin successfully created createMerchantAdmin.admin.controller.merchant.js`);

    return ApiResponse.success(
      res,
      enums.MERCHANT_ADMIN_CREATED_SUCCESSFULLY,
      enums.HTTP_OK,
      {
        'admin': result,
        'temp_password': password_string,
        'otpCount': signupOtpRequest,
        'expiration': expirationTime
      });
  } catch (error) {
    const description = descriptions.create_merchant_admin_failed(
      `Eloka Chiejina`,
      `${body.first_name} ${body.last_name}`
    );
    await adminActivityTracking(
      'req.admin.admin_id',
      65,
      'fail',
      description
    );
    error.label = enums.CREATE_MERCHANT_ADMIN_CONTROLLER;
    logger.error(`Create merchant account failed:::${enums.CREATE_MERCHANT_ADMIN_CONTROLLER}`, error.message);
    return next(error);
  }
}

export const merchantAdminLogin = async (req, res, next) => {
  const { body, merchant } = req;
  try {
    // const token = UserHelpers.generateOtp();
    const token = await Hash.generateMerchantAdminAuthToken(merchant);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random token generated completeAdminLoginRequest.admin.controllers.auth.js`);
    const expireAt = momentTZ().add(3, 'minutes');
    const expireTime = momentTZ(expireAt).tz('Africa/Lagos'); // .tz('Africa/Lagos').format('hh:mm a');
    const merchantUpdatePayload = [
      merchant.merchant_admin_id, token, expireTime,
      (Number(merchant.verification_token_request_count) + 1), Number(merchant.invalid_verification_token_count)];
    const [ updatedMerchantAdmin ] = await processAnyData(
      queriesAdmin.updateMerchantLoginToken, merchantUpdatePayload);

    return ApiResponse.success(
      res, enums.MERCHANT_ADMIN_LOGIN_SUCCESSFULLY,
      enums.HTTP_OK,
      { ...updatedMerchantAdmin });
  } catch (error) {
    const description = descriptions.merchant_admin_login_failed(
      `${merchant.first_name} ${merchant.last_name}`,
      `${body.first_name} ${body.last_name}`
    );
    await adminActivityTracking(
      'req.admin.admin_id',
      65,
      'fail',
      description
    );
    error.label = enums.CREATE_MERCHANT_ADMIN_CONTROLLER;
    logger.error(`Create merchant account failed:::${enums.CREATE_MERCHANT_ADMIN_CONTROLLER}`, error.message);
    return next(error);
  }
};


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
    req.body.secret_key = await Hash.encrypt({ email: req.body.email });
    const payload = MerchantPayload.createMerchant(req.body);
    const { merchant_id } = await processOneOrNoneData(
      merchantQueries.createMerchant,
      payload
    );
    req.body.merchant_id = merchant_id;
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: merchant successfully created createMerchant.admin.controller.merchant.js`);
    const description = descriptions.create_merchant(`${admin.first_name} ${admin.last_name}`, `${req.body.business_name}`);
    await adminActivityTracking(
      admin.admin_id,
      65,
      'success',
      description
    );
    const bankAccountAdded = await addMerchantBankAccount(admin, req.body);
    if (bankAccountAdded !== true) {
      return ApiResponse.error(
        res,
        'Error occured adding merchant bank account',
        enums.HTTP_INTERNAL_SERVER_ERROR,
      );
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
      enums.FETCHED_MERCHANT_SUCCESSFULLY,
      enums.HTTP_OK,
      result
    );
  } catch (error) {
    error.label = enums.FETCH_MERCHANT_CONTROLLER;
    logger.error(`Fetch merchants failed:::${enums.FETCH_MERCHANT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * Fetch single merchant by ID
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {Object} - Return a single merchants details.
 * @memberof AdminMerchantController
 */
export const fetchSingleMerchant = async (req, res, next) => {
  try {
    const { admin } = req;
    const merchantId = req.params.merchant_id;
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Initiate request to fetch single merchant from DB fetchSingleMerchant.admin.controllers.merchant.js`);
    const merchant = await processOneOrNoneData(
      merchantQueries.fetchSingleMerchant,
      [ merchantId ]
    );
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Successfully fetched merchant from the DB fetchSingleMerchant.admin.controllers.merchant.js`);
    return ApiResponse.success(
      res,
      enums.FETCHED_MERCHANT_SUCCESSFULLY,
      enums.HTTP_OK,
      merchant
    );
  } catch (error) {
    error.label = 'MerchantController::fetchSingleMerchant';
    logger.error(`Fetch single merchant failed:::MerchantController::fetchSingleMerchant`, error.message);
    return next(error);
  }
};

/**
 * Fetch users for a specific merchant
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {Object} - Return a list of users.
 * @memberof AdminMerchantController
 */
export const fetchMerchantUsers = async (req, res, next) => {
  try {
    const { query, admin } = req;
    const merchantId = req.params.merchant_id;
    const payload  = MerchantPayload.fetchMerchantUsers(query);
    const [ users, [ usersCount ] ] = await Promise.all([
      processAnyData(merchantQueries.fetchMerchantUsers, [merchantId, ...payload]),
      processAnyData(merchantQueries.fetchMerchantUsersCount, [merchantId, ...payload])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: successfully fetched users from the DB fetchMerchantUsers.admin.controllers.merchant.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(usersCount.total_count),
      total_pages: AdminHelpers.calculatePages(Number(usersCount.total_count), Number(req.query.per_page) || 10),
      users
    };
    return ApiResponse.success(
      res,
      enums.USERS_FETCHED_SUCCESSFULLY,
      enums.HTTP_OK,
      data
    );
  } catch (error) {
    error.label = 'MerchantController::fetchMerchantUsers';
    logger.error(`Fetching merchant users failed:::MerchantController::fetchMerchantUsers`, error.message);
    return next(error);
  }
};

/**
 * Fetch merchant loans
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {Object} - Returns a paginated list of merchant loans.
 * @memberof AdminMerchantController
 */
export const fetchMerchantLoans = async (req, res, next) => {
  try {
    const { query, admin } = req;
    const { count } = await processOneOrNoneData(
      merchantQueries.countMerchantLoans,
      MerchantPayload.countMerchantLoans(req)
    );
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: successfully counted merchant loans from the DB fetchMerchantLoans.admin.controllers.merchant.js`);
    const payload = MerchantPayload.fetchMerchantLoans(req);
    const loans = await processAnyData(
      merchantQueries.fetchMerchantLoans,
      payload
    );
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: successfully fetched merchant loans from the DB fetchMerchantLoans.admin.controllers.merchant.js`);
    const result = {
      page: parseFloat(query.page || 1),
      total_count: Number(count),
      total_pages: AdminHelpers.calculatePages(Number(count), Number(payload[1])),
      loans
    };
    return ApiResponse.success(
      res,
      'Loan(s) fetched successfully',
      enums.HTTP_OK,
      result
    );
  } catch (error) {
    error.label = 'MerchantController::fetchMerchantLoans';
    logger.error(`Fetching merchant loans failed:::${error.label}`, error.message);
    return next(error);
  }
};

/**
 * fetch merchant user credit score breakdown
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user credit score breakdown.
 * @memberof AdminMerchantController
 */
export const fetchUserCreditScoreBreakdown = async(req, res, next) => {
  try {
    const { admin, user } = req;
    const payload = {
      first_name: user.first_name,
      last_name: user.last_name,
      bvn: user.bvn && user.bvn.length > 11 ? await Hash.decrypt(user.bvn) : user.bvn,
      date_of_birth: user.date_of_birth,
      phone_number: user.phone_number,
      gender: user.gender
    }
    const result = await userCreditScoreBreakdown(payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: checked if user credit score breakdown is available from the creditscoring service fetchUserCreditScoreBreakdown.admin.controller.merchant.js`);
    if (result.status !== 200 || !(result.data?.credit_score)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: error occured fetching user credit score breakdown from creditscoring service fetchUserCreditScoreBreakdown.admin.controllers.merchant.js`);
      return ApiResponse.error(
        res,
        'Error occured fetching user credit score breakdown',
        enums.HTTP_BAD_GATEWAY,
        result.data
      );
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully retreived creditscore breakdown from creditscoring service fetchUserCreditScoreBreakdown.admin.controllers.merchant.js`);
    return ApiResponse.success(
      res,
      'User credit score breakdown fetched successfully',
      enums.HTTP_OK,
      result.data
    );
  } catch (error) {
    error.label = 'AdminMerchantController::fetchUserCreditScoreBreakdown';
    logger.error(`Error fetching user credit score breakdown:::${error.label}`, error.message);
    return next(error);
  }
};

/**
 * fetch merchant user repayment schedule
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user payment history.
 * @memberof AdminMerchantController
 */
export const fetchUserRepaymentSchedule = async(req, res, next) => {
  try {
    const { admin, user } = req;
    const activeLoan = await processOneOrNoneData(
      merchantQueries.fetchMerchantUserActiveLoan,
      [user.user_id]
    );
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully retreived payment schedules from the DB fetchUserRepaymentSchedule.admin.controllers.merchant.js`);
    const data = await processAnyData(
      merchantQueries.fetchMerchantUserLoanRepaymentSchedule,
      [activeLoan?.loan_id]
    );
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: successfully retreived payment schedules from the DB fetchUserRepaymentSchedule.admin.controllers.merchant.js`);
    return ApiResponse.success(
      res,
      'User repayment schedule fetched successfully',
      enums.HTTP_OK,
      data
    );
  } catch (error) {
    error.label = 'AdminMerchantController::fetchUserRepaymentSchedule';
    logger.error(`Error fetching user payment schedule from DB:::${error.label}`, error.message);
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
    error.label = 'MerchantController::fetchAvailableBankList';
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
        'Incorrect account number',
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
      address,
      orr_score_threshold,
      processing_fee,
      insurance_fee,
      advisory_fee,
      customer_loan_max_amount,
      merchant_loan_limit,
      account_details_added,
    } = req.body;

    const updatedMerchantDetails = await processOneOrNoneData(
      merchantQueries.updateMerchant,
      [
        merchant.merchant_id,
        business_name || merchant.business_name,
        status || merchant.status,
        phone_number || merchant.phone_number,
        interest_rate || merchant.interest_rate,
        address || merchant.address,
        orr_score_threshold || merchant.orr_score_threshold,
        processing_fee || merchant.processing_fee,
        insurance_fee || merchant.insurance_fee,
        advisory_fee || merchant.advisory_fee,
        customer_loan_max_amount || merchant.customer_loan_max_amount,
        merchant_loan_limit || merchant.merchant_loan_limit
      ]
    );
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: confirm that merchant details has been edited and updated in the DB. updateMerchant.admin.controllers.merchant.js`);

    if (account_details_added) {
      req.body.merchant_id = merchant.merchant_id;
      const updateSuccessful = await addMerchantBankAccount(admin, req.body);
      if (updateSuccessful !== true) {
        return ApiResponse.error(
          res,
          'Error occured updating merchant bank account',
          enums.HTTP_INTERNAL_SERVER_ERROR,
        );
      }
    }

    return ApiResponse.success(
      res,
      enums.MERCHANT_UPDATED_SUCCESSFULLY,
      enums.HTTP_OK,
      updatedMerchantDetails
    );
  } catch (error) {
    error.label = 'MerchantController::updateMerchant';
    logger.error(`Update merchant details failed:::${error.label}`, error.message);
    return next(error);
  }
};

/**
 * Create merchant bank account details
 * @param {Object} admin - Admin details.
 * @param {Object} payload - Bank account details to be created.
 * @returns {Promise<Boolean | Error>}
 * @memberof AdminMerchantController
 */
const addMerchantBankAccount = async (admin, payload, newAccount = false) => {
  try {
    // create transfer recipient
    const { account_name, account_number, bank_code, existingBankAccount } = payload;
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: initiate request to generate recipient code addMerchantBankAccount.admin.controllers.merchant.js`);
    const { data } = await createTransferRecipient({
      account_name,
      account_number,
      bank_code,
    });
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Merchant paystack transfer recipient code generated addMerchantBankAccount.admin.controllers.merchant.js`);
    payload.transfer_recipient_code = data.recipient_code;
    const bankAccountDetails = MerchantPayload.addMerchantBankAccount(payload);
    if (!existingBankAccount) {
      // create merchant bank account
      await processAnyData(
        merchanBankAccountQueries.addBankAccount,
        bankAccountDetails
      );
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Merchant bank account created successfully addMerchantBankAccount.admin.controllers.merchant.js`);
    } else {
      // update merchant bank account
      await processOneOrNoneData(
        merchanBankAccountQueries.updateBankAccount,
        bankAccountDetails
      );
      logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: Merchant bank account updated successfully addMerchantBankAccount.admin.controllers.merchant.js`);
    }

    return true;
  } catch (error) {
    error.label = 'MerchantController::addMerchantBankAccount';
    logger.error(`Add merchant bank account failed:::MerchantController::addMerchantBankAccount`, error.message);
    return error;
  }
};

/**
 * Update merchant user details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {Object}
 * @memberof AdminMerchantController
 */
export const updateMerchantUser = async (req, res, next) => {
  try {
    const { admin, user, merchant } = req;
    const { status } = req.body;
    await processOneOrNoneData(
      merchantQueries.updateMerchantUsers,
      [
        merchant.merchant_id,
        user.user_id,
        status || user.status,
      ]
    );
    logger.info(`${enums.CURRENT_TIME_STAMP},${admin.admin_id}::Info: confirm that merchant user details has been edited and updated in the DB. updateMerchantUser.admin.controllers.merchant.js`);
    return ApiResponse.success(
      res,
      'User updated successfully',
      enums.HTTP_OK,
    );
  } catch (error) {
    error.label = 'MerchantController::updateMerchantUser';
    logger.error(`Update merchant user details failed:::${error.label}`, error.message);
    return next(error);
  }
};
