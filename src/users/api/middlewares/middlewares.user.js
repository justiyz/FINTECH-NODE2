import * as UserService from '../services/services.user';
import * as AuthService from '../services/services.auth';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import { resolveAccount } from '../../services/service.paystack';
import { bvnVerificationCheck } from '../../services/service.sterling';
import { userActivityTracking } from '../../lib/monitor';
import * as Hash from '../../lib/utils/lib.util.hash';
import config from '../../config';

const { SEEDFI_NODE_ENV } = config;

/**
 * Fetch user details from the database
 * @param {string} type - a type to know which of the response to return
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const validateUnAuthenticatedUser = (type = '') => async(req, res, next) => {
  try {
    const { body } = req;
    const payload = body.phone_number || body.email || req.user.phone_number;
    const [ user ] = payload.startsWith('+') ? await UserService.getUserByPhoneNumber([ payload.trim() ]) : await UserService.getUserByEmail([ payload.trim().toLowerCase() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully fetched users details from the database validateUnAuthenticatedUser.middlewares.user.js`);
    if (user && user.is_verified_phone_number && user.is_created_password && type === 'validate') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user account already exists in
        the database validateUnAuthenticatedUser.middlewares.user.js`);
      return ApiResponse.error(res, enums.ACCOUNT_EXIST, enums.HTTP_BAD_REQUEST, enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE);
    }
    if (user && user.is_verified_phone_number && user.is_created_password && type === 'authenticate') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user account already exists in
        the database validateUnAuthenticatedUser.middlewares.user.js`);
      return ApiResponse.error(res, enums.ACCOUNT_ALREADY_VERIFIED, enums.HTTP_BAD_REQUEST, enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE);
    }
    if (!user && type === 'authenticate') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully confirms that user account does not exists in
        the database validateUnAuthenticatedUser.middlewares.user.js`);
      return ApiResponse.error(res, enums.ACCOUNT_NOT_EXIST('User'), enums.HTTP_BAD_REQUEST, enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE);
    }
    if (!user && (type === 'login' || type === 'verify')) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: confirms that user's email is not existing in the database validateUnAuthenticatedUser.middlewares.user.js`);
      return ApiResponse.error(res,
        type === 'login' ? enums.INVALID_EMAIL_ADDRESS : enums.ACCOUNT_NOT_EXIST('User'),
        enums.HTTP_BAD_REQUEST,
        enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE);
    }
    if (user && type === 'login' && (user.status !== 'active' || user.is_deleted )) {
      // eslint-disable-next-line no-nested-ternary
      const userStatus = user.is_deleted ? 'deleted, kindly contact support team'  : `${user.status}, kindly contact support team`;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user account is ${userStatus} in the database validateUnAuthenticatedUser.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_ACCOUNT_STATUS(userStatus), enums.HTTP_UNAUTHORIZED, enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE);
    }
    req.user = user;
    return next();
  } catch (error) {
    error.label = enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE;
    logger.error(`getting user details from the database failed::${enums.VALIDATE_UNAUTHENTICATED_USER_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * validates user refresh token
 * @param {String} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const validateRefreshToken = async (req, res, next) => {
  try {
    const { query: { refreshToken },  user } = req;
    if (refreshToken !== user.refresh_token) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that refresh token does not match the one in the database validateRefreshToken.middlewares.user.js`);
      return ApiResponse.error(res, enums.INVALID_USER_REFRESH_TOKEN, enums.HTTP_UNAUTHORIZED, enums.VALIDATE_USER_REFRESH_TOKEN_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.VALIDATE_USER_REFRESH_TOKEN_MIDDLEWARE;
    logger.error(`validating user refresh token failed::${enums.VALIDATE_USER_REFRESH_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user selfie image previously uploaded
 * @param {string} type - a type to know which of the response to return
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const isUploadedImageSelfie = (type = '') => async(req, res, next) => {
  try {
    const { user } = req;
    if (user.is_uploaded_selfie_image && type === 'complete') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has been previously uploaded selfie image isUploadedImageSelfie.middlewares.user.js`);
      userActivityTracking(user.user_id, 17, 'fail');
      return ApiResponse.error(res, enums.SELFIE_IMAGE_PREVIOUSLY_UPLOADED, enums.HTTP_FORBIDDEN, enums.IS_UPLOADED_IMAGE_SELFIE_MIDDLEWARE);
    }
    if (!user.is_uploaded_selfie_image && type === 'confirm') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has not previously uploaded selfie image isUploadedImageSelfie.middlewares.user.js`);
      return ApiResponse.error(res, enums.SELFIE_IMAGE_NOT_PREVIOUSLY_UPLOADED, enums.HTTP_FORBIDDEN, enums.IS_UPLOADED_IMAGE_SELFIE_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.IS_UPLOADED_IMAGE_SELFIE_MIDDLEWARE;
    logger.error(`checking if user selfie image previously uploaded failed::${enums.IS_UPLOADED_IMAGE_SELFIE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user bvn previously verified
 * @param {string} type - a type to know which of the response to return
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const isVerifiedBvn = (type = '') => async(req, res, next) => {
  try {
    const { user } = req;
    if (user.is_verified_bvn && type === 'complete') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has previously verified bvn isVerifiedBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.BVN_PREVIOUSLY_VERIFIED, enums.HTTP_FORBIDDEN, enums.IS_VERIFIED_BVN_MIDDLEWARE);
    }
    if (!user.is_verified_bvn && type === 'confirm') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has not previously verified bvn isVerifiedBvn.middlewares.user.js`);
      return ApiResponse.error(res, enums.BVN_NOT_PREVIOUSLY_VERIFIED, enums.HTTP_FORBIDDEN, enums.IS_VERIFIED_BVN_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.IS_VERIFIED_BVN_MIDDLEWARE;
    logger.error(`checking if user bvn previously verified failed::${enums.IS_VERIFIED_BVN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if no previously existing BVN is verified again
 * @param {String} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const isBvnPreviouslyExisting = async(req, res, next) => {
  try {
    const { body, user } = req;
    const allExistingBvns = await UserService.fetchAllExistingBvns();
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched all existing bvns isBvnPreviouslyExisting.middlewares.user.js`);
    const plainBvns = [];
    const decryptBvns = allExistingBvns.forEach(async(data) => {
      const decryptedBvn = await Hash.decrypt(decodeURIComponent(data.bvn));
      plainBvns.push(decryptedBvn);
    });
    await Promise.all([ decryptBvns ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully decrypted all encrypted bvns isBvnPreviouslyExisting.middlewares.user.js`);
    if (plainBvns.includes(body.bvn.trim())) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: sent bvn has been previously used by another user isBvnPreviouslyExisting.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.BVN_USED_BY_ANOTHER_USER, enums.HTTP_BAD_REQUEST, enums.IS_BVN_PREVIOUSLY_EXISTING_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: sent bvn is unique and not previously used by another user isBvnPreviouslyExisting.middlewares.user.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 5, 'fail');
    error.label = enums.IS_BVN_PREVIOUSLY_EXISTING_MIDDLEWARE;
    logger.error(`checking if sent bvn has not been previously used failed:::${enums.IS_BVN_PREVIOUSLY_EXISTING_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * verify user entered bvn
 * @param {String} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const verifyBvn = async (req, res, next) => {
  try {
    const { body: { bvn },  user } = req;
    const data = await bvnVerificationCheck(bvn.trim(), user);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: response returned from verify bvn external API call verifyBvn.middlewares.user.js`);
    if (data.responseCode !== '00') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's bvn verification failed verifyBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, data.responseDesc, enums.HTTP_BAD_REQUEST, enums.VERIFY_BVN_MIDDLEWARE);
    }
    if (user.first_name.toLowerCase() !== data.firstName.toLowerCase()) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's first name don't match bvn first name verifyBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.USER_FIRST_NAME_NOT_MATCHING_BVN_NAME, enums.HTTP_BAD_REQUEST, enums.VERIFY_BVN_MIDDLEWARE);
    }
    if (user.last_name.toLowerCase() !== data.lastName.toLowerCase()) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's last name don't match bvn last name verifyBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.USER_LAST_NAME_NOT_MATCHING_BVN_NAME, enums.HTTP_BAD_REQUEST, enums.VERIFY_BVN_MIDDLEWARE);
    }
    if (user.middle_name !== null && user.middle_name.toLowerCase() !== data.middleName.toLowerCase()) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's middle name don't match bvn middle name verifyBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.USER_MIDDLE_NAME_NOT_MATCHING_BVN_NAME, enums.HTTP_BAD_REQUEST, enums.VERIFY_BVN_MIDDLEWARE);
    }
    if (user.gender.toLowerCase() !== data.gender.toLowerCase()) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's gender does not match bvn returned gender verifyBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.USER_GENDER_NOT_MATCHING_BVN_GENDER, enums.HTTP_BAD_REQUEST, enums.VERIFY_BVN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's bvn verification successful verifyBvn.middlewares.user.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 5, 'fail');
    error.label = enums.VERIFY_BVN_MIDDLEWARE;
    logger.error(`verifying user bvn failed::${enums.VERIFY_BVN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if email is already verified
 * @param {string} type - a type to know which of the response to return
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const isEmailVerified = (type = 'authenticate') => async(req, res, next) => {
  try {
    const { user } = req;
    if (type === 'authenticate' && !user.is_verified_email) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully decoded that user is not verified yet isEmailVerified.middleware.user.js`);
      return ApiResponse.error(res, enums.EMAIL_NOT_VERIFIED, enums.HTTP_BAD_REQUEST, enums.IS_EMAIL_VERIFIED_MIDDLEWARE);
    }
    if (type === 'validate' && user.is_verified_email) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully decoded that user has already been 
      isEmailVerified.middleware.user.js`);
      return ApiResponse.error(res, enums.EMAIL_ALREADY_VERIFIED, enums.HTTP_BAD_REQUEST, enums.IS_EMAIL_VERIFIED_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.IS_EMAIL_VERIFIED_MIDDLEWARE;
    logger.error(`checking user is verified failed:::${enums.IS_EMAIL_VERIFIED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if bank account saved previously
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkAccountPreviouslySaved = async(req, res, next) => {
  try {
    const { user, body: { account_number, bank_code } } = req;
    const [ existingAccount ] = await UserService.checkIfAccountExisting([ user.user_id, account_number.trim(), bank_code.trim() ]);
    if (existingAccount) {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${user.user_id}:::Info: account has already been saved by user in the DB checkAccountPreviouslySaved.middlewares.user.js`);
      userActivityTracking(req.user.user_id, 27, 'fail');
      return ApiResponse.error(res, enums.ACCOUNT_DETAILS_PREVIOUSLY_SAVED, enums.HTTP_BAD_REQUEST, enums.CHECK_ACCOUNT_PREVIOUSLY_SAVED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account has not been saved previously by user in the DB checkAccountPreviouslySaved.middlewares.user.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 27, 'fail');
    error.label = enums.CHECK_ACCOUNT_PREVIOUSLY_SAVED_MIDDLEWARE;
    logger.error(`checking if user previously saved account details failed::${enums.CHECK_ACCOUNT_PREVIOUSLY_SAVED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if bank account details belong to user
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkAccountOwnership = async(req, res, next) => {
  try {
    const { user, accountNumberDetails } = req;
    const accountDetailsName = accountNumberDetails.data.account_name.trim().toLowerCase().replaceAll(',', '').split(' ');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account names converted to an array checkAccountOwnership.middlewares.user.js`);
    if (user.middle_name !== null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has middle name saved checkAccountOwnership.middlewares.user.js`);
      if(accountDetailsName.includes(user.first_name.toLowerCase()) && accountDetailsName.includes(user.middle_name.toLowerCase()) && accountDetailsName.includes(user.last_name.toLowerCase())) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user names match account details names checkAccountOwnership.middlewares.user.js`);
        return next();
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user names don't match account details names checkAccountOwnership.middlewares.user.js`);
      userActivityTracking(req.user.user_id, 27, 'fail');
      return ApiResponse.error(res, enums.ACCOUNT_USER_NOT_OWNED_BY_USER, enums.HTTP_FORBIDDEN, enums.CHECK_ACCOUNT_OWNERSHIP_MIDDLEWARE);
    }
    if(accountDetailsName.includes(user.first_name.toLowerCase()) && accountDetailsName.includes(user.last_name.toLowerCase())) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user names match account details names checkAccountOwnership.middlewares.user.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user names don't match account details names checkAccountOwnership.middlewares.user.js`);
    userActivityTracking(req.user.user_id, 27, 'fail');
    return ApiResponse.error(res, enums.ACCOUNT_USER_NOT_OWNED_BY_USER, enums.HTTP_FORBIDDEN, enums.CHECK_ACCOUNT_OWNERSHIP_MIDDLEWARE);
  } catch (error) {
    userActivityTracking(req.user.user_id, 27, 'fail');
    error.label = enums.CHECK_ACCOUNT_OWNERSHIP_MIDDLEWARE;
    logger.error(`checking if user owns the account to be saved failed::${enums.CHECK_ACCOUNT_OWNERSHIP_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * fetch name attached to a bank account number
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const resolveBankAccountNumberName = async(req, res, next) => {
  try {
    const { user, query, body } = req;
    const accountNumberChoice = query.account_number || body.account_number;
    const bankCodeChoice = query.bank_code || body.bank_code;
    const data = await resolveAccount(accountNumberChoice.trim(), bankCodeChoice.trim());
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account number resolve response returned from paystack resolveBankAccountNumberName.middleware.user.js`);
    if (data.status === true && data.message.trim().toLowerCase() === 'account number resolved') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account number resolve successfully by paystack resolveBankAccountNumberName.middleware.user.js`);
      req.accountNumberDetails = data;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account number not resolve successfully by paystack resolveBankAccountNumberName.middleware.user.js`);
    return ApiResponse.error(res, data.message, enums.HTTP_UNPROCESSABLE_ENTITY, enums.RESOLVE_BANK_ACCOUNT_NUMBER_NAME_MIDDLEWARE);
  } catch (error) {
    error.label = enums.RESOLVE_BANK_ACCOUNT_NUMBER_NAME_MIDDLEWARE;
    logger.error(`Resolving bank account name from paystack failed::${enums.RESOLVE_BANK_ACCOUNT_NUMBER_NAME_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user is on active loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkUserLoanStatus = async(req, res, next) => {
  try {
    const { user } = req;
    if (user.loan_status === 'active') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user is currently on an active loan checkUserLoanStatus.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_IS_ON_AN_ACTIVE_LOAN, enums.HTTP_FORBIDDEN, enums.CHECK_USER_LOAN_STATUS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user is not on an active loan checkUserLoanStatus.middlewares.user.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_USER_LOAN_STATUS_MIDDLEWARE;
    logger.error(`checking if user is on an active loan failed::${enums.CHECK_USER_LOAN_STATUS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user is on active loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkIfAccountDetailsExists = async(req, res, next) => {
  try {
    const { user, params: { id } } = req;
    const [ accountIdExists ] = await UserService.fetchBankAccountDetailsById([ id ]);
    if (!accountIdExists) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account details does not exists checkIfAccountDetailsExists.middlewares.user.js`);
      return ApiResponse.error(res, enums.ACCOUNT_DETAILS_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_ACCOUNT_DETAILS_EXISTS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account details exists in the DB checkIfAccountDetailsExists.middlewares.user.js`);
    if (accountIdExists.user_id !== user.user_id) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account details does not belong to user checkIfAccountDetailsExists.middlewares.user.js`);
      return ApiResponse.error(res, enums.ACCOUNT_DETAILS_NOT_USERS, enums.HTTP_FORBIDDEN, enums.CHECK_IF_ACCOUNT_DETAILS_EXISTS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account details belong to user checkIfAccountDetailsExists.middlewares.user.js`);
    req.accountDetails = accountIdExists;
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_ACCOUNT_DETAILS_EXISTS_MIDDLEWARE;
    logger.error(`checking if account details exists and belong to user failed::${enums.CHECK_IF_ACCOUNT_DETAILS_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if an account current choice values against type sent
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkAccountCurrentChoicesAndTypeSent = async(req, res, next) => {
  const { user, query: { type }, accountDetails } = req;
  try {
    if (accountDetails.is_default && type === 'default') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account is already default checkAccountCurrentChoicesAndTypeSent.middlewares.user.js`);
      userActivityTracking(req.user.user_id, 35, 'fail');
      return ApiResponse.error(res, enums.ACCOUNT_ALREADY_DEFAULT_ACCOUNT, enums.HTTP_BAD_REQUEST, enums.CHECK_ACCOUNT_CURRENT_CHOICE_AND_TYPE_SENT_MIDDLEWARE);
    }
    if (accountDetails.is_disbursement_account && type === 'disbursement') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account is already set to disbursement account checkAccountCurrentChoicesAndTypeSent.middlewares.user.js`);
      userActivityTracking(req.user.user_id, 36, 'fail');
      return ApiResponse.error(res, enums.ACCOUNT_ALREADY_DISBURSEMENT_ACCOUNT, enums.HTTP_BAD_REQUEST, enums.CHECK_ACCOUNT_CURRENT_CHOICE_AND_TYPE_SENT_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account and type sent match checkAccountCurrentChoicesAndTypeSent.middlewares.user.js`);
    return next();
  } catch (error) {
    const operationType = type === 'default' ? 35 : 36;
    userActivityTracking(req.user.user_id, operationType, 'fail');
    error.label = enums.CHECK_ACCOUNT_CURRENT_CHOICE_AND_TYPE_SENT_MIDDLEWARE;
    logger.error(`checking if to be set account choice is already the account choice failed::${enums.CHECK_ACCOUNT_CURRENT_CHOICE_AND_TYPE_SENT_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * verify email verification
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const verifyEmailVerificationToken = async(req, res, next) => {
  try {
    const { query: { verifyValue } } = req;
    const [ tokenUser ] = await AuthService.getUserByVerificationToken(verifyValue);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if correct verification token is sent verifyEmailVerificationToken.middlewares.user.js`);
    if (!tokenUser) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: sent token is invalid verifyEmailVerificationToken.middlewares.user.js`);
      return SEEDFI_NODE_ENV === 'test' ? ApiResponse.error(res, enums.EMAIL_EITHER_VERIFIED_OR_INVALID_TOKEN, enums.HTTP_BAD_REQUEST, enums.VERIFY_EMAIL_VERIFICATION_TOKEN_MIDDLEWARE) :
        res.send(enums.EMAIL_EITHER_VERIFIED_OR_INVALID_TOKEN);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${tokenUser.user_id}:::Info: sent token is valid verifyEmailVerificationToken.middlewares.user.js`);
    req.user = tokenUser;
    return next();
  } catch (error) {
    error.label = enums.VERIFY_EMAIL_VERIFICATION_TOKEN_MIDDLEWARE;
    logger.error(`verify verification token failed::${enums.VERIFY_EMAIL_VERIFICATION_TOKEN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check user id verification
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const isUploadedVerifiedId = async(req, res, next) => {
  try {
    if (req.user.is_uploaded_identity_card) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info:
      decoded that User Id is already verified in the DB. isUploadedVerifiedId.middlewares.user.js`);
      return ApiResponse.error(res, enums.CHECK_USER_ID_VERIFICATION, enums.HTTP_BAD_REQUEST, enums.IS_UPDATED_VERIFICATION_ID_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.IS_UPDATED_VERIFICATION_ID_MIDDLEWARE;
    logger.error(`checking if user email is not already existing failed::${enums.IS_UPDATED_VERIFICATION_ID_MIDDLEWARE}`, error.message);
    return next(error);
  }
};


/**
 * check if user has verified his BVN
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */

export const checkIfBvnIsVerified = async (req, res, next) => {
  try {
    const { user, body } = req;
    if ( (user.is_verified_bvn) && (body.first_name ||  body.last_name || body.middle_name || body.date_of_birth || body.gender) ) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info:
      successfully checked if BVN is verified checkIfBvnIsVerified.admin.middlewares.user.js`);
      return ApiResponse.error(res, enums.DETAILS_CAN_NOT_BE_UPDATED, 400);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_BVN_IS_VERIFIED_MIDDLEWARE;
    logger.error(`checking if BVN is verified failed::${enums.CHECK_IF_BVN_IS_VERIFIED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user has has an active loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */

export const checkIfLoanStatusIsActive = async (req, res, next) => {
  try {
    const { user } = req;
    if ( (user.loan_status === 'active') ) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info:
      successfully checked if loan status is active checkIfLoanStatusIsActive.admin.middlewares.user.js`);
      return ApiResponse.error(res, enums.DETAILS_CAN_NOT_BE_UPDATED, 400);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_LOAN_STATUS_IS_ACTIVE_MIDDLEWARE;
    logger.error(`checking if loan status is active failed::${enums.CHECK_IF_LOAN_STATUS_IS_ACTIVE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};


