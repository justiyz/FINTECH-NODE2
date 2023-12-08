import dayjs from 'dayjs';
import crypto from 'crypto';
import path from 'path';
import AuthQueries from '../queries/queries.auth';
import userQueries from '../queries/queries.user';
import loanQueries from '../queries/queries.loan';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import { resolveAccount } from '../services/service.paystack';
import { dojahBvnVerificationCheck } from '../services/service.dojah';
import { createUserYouVerifyCandidate, createUserYouVerifyCandidateUsingProfile } from '../services/service.youVerify';
import { userActivityTracking } from '../../lib/monitor';
import * as S3 from '../../api/services/services.s3';
import * as Hash from '../../lib/utils/lib.util.hash';
import config from '../../config';
import UserPayload from '../../lib/payloads/lib.payload.user';
import * as zeehService from '../services/services.zeeh';

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
    const [ user ] = payload.startsWith('+') ? await processAnyData(userQueries.getUserByPhoneNumber, [ payload.trim() ]) :
      await processAnyData(userQueries.getUserByEmail, [ payload.trim().toLowerCase() ]);
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
    if (user && (user.status === 'suspended' || user.is_deleted || user.status === 'deactivated')) {
      const userStatus = user.is_deleted ? 'deleted, kindly contact support team'  : `${user.status}, kindly contact support team`;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user account is ${userStatus} in the database
      validateUnAuthenticatedUser.middlewares.user.js`);
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
export const validateRefreshToken = async(req, res, next) => {
  try {
    const { query: { refreshToken },  user } = req;
    const [ userRefreshToken ] = await processAnyData(userQueries.fetchUserRefreshToken, [ user.user_id ]);
    if (refreshToken !== userRefreshToken.refresh_token) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that refresh token does not match the one in the database
      validateRefreshToken.middlewares.user.js`);
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has been previously uploaded selfie image
      isUploadedImageSelfie.middlewares.user.js`);
      userActivityTracking(user.user_id, 17, 'fail');
      return ApiResponse.error(res, enums.SELFIE_IMAGE_PREVIOUSLY_UPLOADED, enums.HTTP_FORBIDDEN, enums.IS_UPLOADED_IMAGE_SELFIE_MIDDLEWARE);
    }
    if (!user.is_uploaded_selfie_image && type === 'confirm') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms that user has not previously uploaded selfie image
      isUploadedImageSelfie.middlewares.user.js`);
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
    const allExistingBvns = await processAnyData(userQueries.fetchAllExistingBvns, []);
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
export const verifyBvn = async(req, res, next) => {
  try {
    const { body: { bvn },  user } = req;
    const data = await zeehService.zeehBVNVerificationCheck(bvn.trim(), user);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: response returned from verify bvn external API call verifyBvn.middlewares.user.js`);
    if (data.status !== 'success') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's bvn verification failed verifyBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.USER_BVN_NOT_MATCHING_RETURNED_BVN, enums.HTTP_BAD_REQUEST, enums.VERIFY_BVN_MIDDLEWARE);
    }
    // eslint-disable-next-line max-len
    // if (user.first_name.trim().toLowerCase() !== data.data.entity.first_name.replace(/\s+/g, '').trim().toLowerCase() || user.first_name.trim().toLowerCase() !== data.data.first_name.replace(/\s+/g, '').trim().toLowerCase()) {
    if (user.first_name.trim().toLowerCase() !== data.data.firstName.replace(/\s+/g, '').trim().toLowerCase()) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's first name don't match bvn first name verifyBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.USER_BVN_NOT_MATCHING_RETURNED_BVN, enums.HTTP_BAD_REQUEST, enums.VERIFY_BVN_MIDDLEWARE);
    }
    if (user.last_name.trim().toLowerCase() !== data.data.lastName.replace(/\s+/g, '').trim().toLowerCase()) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's last name don't match bvn last name verifyBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.USER_BVN_NOT_MATCHING_RETURNED_BVN, enums.HTTP_BAD_REQUEST, enums.VERIFY_BVN_MIDDLEWARE);
    }
    if (user.middle_name !== null && user.middle_name.trim().toLowerCase() !== data.data.middleName.replace(/\s+/g, '').trim().toLowerCase()) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's middle name don't match bvn middle name verifyBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.USER_BVN_NOT_MATCHING_RETURNED_BVN, enums.HTTP_BAD_REQUEST, enums.VERIFY_BVN_MIDDLEWARE);
    }
    if (user.gender.trim().toLowerCase() !== data.data.gender.trim().toLowerCase()) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's gender does not match bvn returned gender verifyBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.USER_BVN_NOT_MATCHING_RETURNED_BVN, enums.HTTP_BAD_REQUEST, enums.VERIFY_BVN_MIDDLEWARE);
    }
    if (dayjs(user.date_of_birth.trim()).format('YYYY-MM-DD') !== dayjs(data.data.dateOfBirth.trim()).format('YYYY-MM-DD')) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's date of birth does not match bvn returned date of birth verifyBvn.middlewares.user.js`);
      userActivityTracking(user.user_id, 5, 'fail');
      return ApiResponse.error(res, enums.USER_BVN_NOT_MATCHING_RETURNED_BVN, enums.HTTP_BAD_REQUEST, enums.VERIFY_BVN_MIDDLEWARE);
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
 * check if user bvn has been previously flagged as blacklisted
 * @param {String} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkIfBvnFlaggedBlacklisted = async(req, res, next) => {
  try {
    const { body, user } = req;
    const allExistingBlacklistedBvns = await processAnyData(userQueries.fetchAllExistingBlacklistedBvns, []);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched all existing blacklisted bvns checkIfBvnFlaggedBlacklisted.middlewares.user.js`);
    const plainBlacklistedBvns = [];
    const decryptBvns = allExistingBlacklistedBvns.forEach(async(data) => {
      const decryptedBvn = await Hash.decrypt(decodeURIComponent(data.bvn));
      plainBlacklistedBvns.push(decryptedBvn);
    });
    await Promise.all([ decryptBvns ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully decrypted all encrypted blacklisted bvns checkIfBvnFlaggedBlacklisted.middlewares.user.js`);
    if (plainBlacklistedBvns.includes(body.bvn.trim())) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: sent bvn has been previously flagged blacklisted checkIfBvnFlaggedBlacklisted.middlewares.user.js`);
      await processOneOrNoneData(userQueries.blacklistUser, [ user.user_id ]);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: sent bvn is clean and is not on blacklisted bvns list checkIfBvnFlaggedBlacklisted.middlewares.user.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 5, 'fail');
    error.label = enums.CHECK_IF_BVN_FLAGGED_BLACKLISTED_MIDDLEWARE;
    logger.error(`checking if sent bvn has not been blacklisted failed:::${enums.CHECK_IF_BVN_FLAGGED_BLACKLISTED_MIDDLEWARE}`, error.message);
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
 * check if more than two cards already saved
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkIfMaximumDebitCardsSaved = async(req, res, next) => {
  try {
    const { user } = req;
    const [ existingCardsCount ] = await processAnyData(userQueries.checkMaximumExistingCardsCounts, [ user.user_id ]);
    if (Number(existingCardsCount.count) >= 2) {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${user.user_id}:::Info: user already has up to two debit cards saved checkIfMaximumDebitCardsSaved.middlewares.user.js`);
      userActivityTracking(req.user.user_id, 26, 'fail');
      return ApiResponse.error(res, enums.DEBIT_CARDS_LIMITS_REACHED, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_MAXIMUM_DEBIT_CARDS_SAVED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user is yet to save up to two debit cards saved checkIfMaximumDebitCardsSaved.middlewares.user.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 26, 'fail');
    error.label = enums.CHECK_IF_MAXIMUM_DEBIT_CARDS_SAVED_MIDDLEWARE;
    logger.error(`checking if user has saved up to two debit cards failed::${enums.CHECK_IF_MAXIMUM_DEBIT_CARDS_SAVED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if more than three bank account already saved
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkIfMaximumBankAccountsSaved = async(req, res, next) => {
  try {
    const { user } = req;
    const [ existingAccountsCount ] = await processAnyData(userQueries.checkMaximumExistingAccountCounts, [ user.user_id ]);
    if (Number(existingAccountsCount.count) >= 3) {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${user.user_id}:::Info: user already has up to three bank accounts saved
      checkIfMaximumBankAccountsSaved.middlewares.user.js`);
      userActivityTracking(req.user.user_id, 27, 'fail');
      return ApiResponse.error(res, enums.BANK_ACCOUNTS_LIMITS_REACHED, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_MAXIMUM_BANK_ACCOUNTS_SAVED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user is yet to save up to three bank accounts checkIfMaximumBankAccountsSaved.middlewares.user.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 27, 'fail');
    error.label = enums.CHECK_IF_MAXIMUM_BANK_ACCOUNTS_SAVED_MIDDLEWARE;
    logger.error(`checking if user has saved more up to three bank accounts failed::${enums.CHECK_IF_MAXIMUM_BANK_ACCOUNTS_SAVED_MIDDLEWARE}`, error.message);
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
    const [ existingAccount ] = await processAnyData(userQueries.checkIfAccountExisting, [ user.user_id, account_number.trim(), bank_code.trim() ]);
    if (existingAccount) {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${user.user_id}:::Info: account has already been saved by user in the DB checkAccountPreviouslySaved.middlewares.user.js`);
      userActivityTracking(req.user.user_id, 27, 'fail');
      return ApiResponse.error(res, enums.ACCOUNT_DETAILS_PREVIOUSLY_SAVED, enums.HTTP_BAD_REQUEST, enums.CHECK_ACCOUNT_PREVIOUSLY_SAVED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account has not been saved previously by user in the DB
    checkAccountPreviouslySaved.middlewares.user.js`);
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
    const accountDetailsName = accountNumberDetails.data.account_name.trim().toLowerCase().split(',').join('').split(' ');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account names converted to an array checkAccountOwnership.middlewares.user.js`);
    if (user.middle_name !== null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has middle name saved checkAccountOwnership.middlewares.user.js`);
      if ((accountDetailsName.includes(user.first_name.toLowerCase()) &&
        accountDetailsName.includes(user.middle_name.toLowerCase()) &&
        accountDetailsName.includes(user.last_name.toLowerCase())
      ) ||
      (accountDetailsName.includes(user.first_name.toLowerCase()) &&
      accountDetailsName.includes(user.last_name.toLowerCase())
      )) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user names match account details names checkAccountOwnership.middlewares.user.js`);
        return next();
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user names don't match account details names checkAccountOwnership.middlewares.user.js`);
      userActivityTracking(req.user.user_id, 27, 'fail');
      return ApiResponse.error(res, enums.ACCOUNT_USER_NOT_OWNED_BY_USER, enums.HTTP_FORBIDDEN, enums.CHECK_ACCOUNT_OWNERSHIP_MIDDLEWARE);
    }
    if (accountDetailsName.includes(user.first_name.toLowerCase()) && accountDetailsName.includes(user.last_name.toLowerCase())) {
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
    const data = await resolveAccount(accountNumberChoice.trim(), bankCodeChoice.trim(), user);
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
    if (user.loan_status !== 'inactive') {
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
    const { user, params: { id, payment_channel_id }, query: { payment_channel } } = req;
    if (!payment_channel || payment_channel === 'bank') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      no query payment type sent or query payment type sent is to check for bank repayment checkIfAccountDetailsExists.middlewares.user.js`);
      const [ accountIdExists ] = await processAnyData(userQueries.fetchBankAccountDetailsByUserId, [ user.user_id ]);
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
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
    query payment type is sent and payment query type sent is to check for card repayment checkIfAccountDetailsExists.middlewares.user.js`);
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account is already set to disbursement account
      checkAccountCurrentChoicesAndTypeSent.middlewares.user.js`);
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
    const [ tokenUser ] = await processAnyData(AuthQueries.getUserByVerificationToken, [ verifyValue ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if correct verification token is sent verifyEmailVerificationToken.middlewares.user.js`);
    if (!tokenUser) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: sent token is invalid verifyEmailVerificationToken.middlewares.user.js`);
      return SEEDFI_NODE_ENV === 'test' ? ApiResponse.error(res, enums.EMAIL_EITHER_VERIFIED_OR_INVALID_TOKEN,
        enums.HTTP_BAD_REQUEST, enums.VERIFY_EMAIL_VERIFICATION_TOKEN_MIDDLEWARE) :
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
 * @param {string} type - a type to know which of the response to return
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const isUploadedVerifiedId  = (type = '') => async(req, res, next) => {
  try {
    const { user } = req;
    if (req.user.is_uploaded_identity_card && type === 'complete') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      decoded that User valid id has been uploaded to the DB. isUploadedVerifiedId.middlewares.user.js`);
      return ApiResponse.error(res, enums.CHECK_USER_ID_VERIFICATION, enums.HTTP_FORBIDDEN, enums.IS_UPDATED_VERIFICATION_ID_MIDDLEWARE);
    }
    if (!req.user.is_uploaded_identity_card && type === 'confirm') {
      logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info:
      decoded that User valid id has not been uploaded yet to the DB. isUploadedVerifiedId.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_VALID_ID_NOT_UPLOADED, enums.HTTP_FORBIDDEN, enums.IS_UPDATED_VERIFICATION_ID_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.IS_UPDATED_VERIFICATION_ID_MIDDLEWARE;
    logger.error(`checking if user valid id upload is or is not already existing failed::${enums.IS_UPDATED_VERIFICATION_ID_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check user address verification
 * @param {string} type - a type to know which of the response to return
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const isVerifiedAddressDetails  = (type = '') => async(req, res, next) => {
  try {
    const { user, userAddressDetails } = req;
    if (userAddressDetails && userAddressDetails.is_verified_address && type === 'complete') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      decoded that User address has been verified in the DB. isVerifiedAddressDetails.middlewares.user.js`);
      return ApiResponse.error(res, enums.CHECK_USER_ADDRESS_VERIFICATION, enums.HTTP_FORBIDDEN, enums.IS_VERIFIED_ADDRESS_DETAILS_MIDDLEWARE);
    }
    if ((!userAddressDetails || !userAddressDetails.is_verified_address) && type === 'confirm') {
      logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info:
      decoded that User address has not been verified yet in the DB. isVerifiedAddressDetails.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_ADDRESS_NOT_VERIFIED, enums.HTTP_FORBIDDEN, enums.IS_VERIFIED_ADDRESS_DETAILS_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.IS_VERIFIED_ADDRESS_DETAILS_MIDDLEWARE;
    logger.error(`checking if user address is or is not already verified failed::${enums.IS_VERIFIED_ADDRESS_DETAILS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user utility bill has been previously verified
 * @param {string} type - a type to know which of the response to return
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const isVerifiedUtilityBill  = (type = '') => async(req, res, next) => {
  try {
    const { user, userAddressDetails } = req;
    if (userAddressDetails && userAddressDetails.is_verified_utility_bill && type === 'complete') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      decoded that User utility bill has been verified in the DB. isVerifiedUtilityBill.middlewares.user.js`);
      return ApiResponse.error(res, enums.CHECK_USER_UTILITY_BILL_VERIFICATION, enums.HTTP_FORBIDDEN, enums.IS_VERIFIED_UTILITY_BILL_MIDDLEWARE);
    }
    if (userAddressDetails && !userAddressDetails.can_upload_utility_bill && type === 'complete') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      decoded that User utility bill is still under verification and cannot be updated yet. isVerifiedUtilityBill.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_UTILITY_BILL_VERIFICATION_PENDING, enums.HTTP_FORBIDDEN, enums.IS_VERIFIED_UTILITY_BILL_MIDDLEWARE);
    }
    if ((!userAddressDetails || !userAddressDetails.is_verified_utility_bill) && type === 'confirm') {
      logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info:
      decoded that User utility bill is yet to be verified in the DB. isVerifiedUtilityBill.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_UTILITY_BILL_NOT_VERIFIED, enums.HTTP_FORBIDDEN, enums.IS_VERIFIED_UTILITY_BILL_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.IS_VERIFIED_UTILITY_BILL_MIDDLEWARE;
    logger.error(`checking if user uploaded utility bill is verified failed::${enums.IS_VERIFIED_UTILITY_BILL_MIDDLEWARE}`, error.message);
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

export const createUserAddressYouVerifyCandidate = async(req, res, next) => {
  try {
    const { user, body } = req;
    const [ userAddressDetails ] = await processAnyData(userQueries.fetchUserAddressDetails, [ user.user_id ]);
    if (userAddressDetails && userAddressDetails.you_verify_candidate_id !== null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has previously created on youVerify
      createUserAddressYouVerifyCandidate.middlewares.user.js`);
      if (userAddressDetails.you_verify_address_verification_status === 'pending') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user address verification still pending
      createUserAddressYouVerifyCandidate.middlewares.user.js`);
        return ApiResponse.error(res, enums.USER_ADDRESS_VERIFICATION_STILL_PENDING, enums.HTTP_FORBIDDEN, enums.CREATE_USER_ADDRESS_YOU_VERIFY_CANDIDATE_MIDDLEWARE);
      }
      if (!userAddressDetails.is_editable) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user address verification cannot be edited at this point
      createUserAddressYouVerifyCandidate.middlewares.user.js`);
        return ApiResponse.error(res, enums.USER_ADDRESS_CANNOT_BE_UPDATED, enums.HTTP_FORBIDDEN, enums.CREATE_USER_ADDRESS_YOU_VERIFY_CANDIDATE_MIDDLEWARE);
      }
      req.userAddressDetails = userAddressDetails;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not been previously created on youVerify
    createUserAddressYouVerifyCandidate.middlewares.user.js`);
    const payload = UserPayload.addressVerification(body, user);
    !userAddressDetails ? await processOneOrNoneData(userQueries.createUserAddressDetails, payload) :
      await processOneOrNoneData(userQueries.updateUserAddressDetailsOnCreation, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user address details saved in the DB but still unverified
        createUserAddressYouVerifyCandidate.middlewares.user.js`);
    let userBvn = await processOneOrNoneData(loanQueries.fetchUserBvn, [ user.user_id ]);
    userBvn = await Hash.decrypt(decodeURIComponent(userBvn.bvn));
    const result = await createUserYouVerifyCandidate(user, userBvn);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user candidate details creation has been initiated with youVerify
    createUserAddressYouVerifyCandidate.middlewares.user.js`);
    if (result && result.statusCode === 201 && result.message.toLowerCase() === 'candidate created successfully!') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user candidate details successfully created with youVerify
    createUserAddressYouVerifyCandidate.middlewares.user.js`);
      await processOneOrNoneData(userQueries.updateYouVerifyCandidateId, [ user.user_id, result.data.id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user youVerify candidate id saved in the DB but still unverified
        createUserAddressYouVerifyCandidate.middlewares.user.js`);
      req.userYouVerifyCandidateDetails = result.data;
      return next();
    }
    if (result && result.statusCode !== 201) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's candidate address creation failed about to retry
      createUserAddressYouVerifyCandidate.middlewares.user.js`);
      const retryResult = await createUserYouVerifyCandidateUsingProfile(user);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's candidate address creation retried
      createUserAddressYouVerifyCandidate.middlewares.user.js`);
      if (retryResult && retryResult.statusCode === 201 && retryResult.message.toLowerCase() === 'candidate created successfully!') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user candidate details successfully created with youVerify
      createUserAddressYouVerifyCandidate.middlewares.user.js`);
        await processOneOrNoneData(userQueries.updateYouVerifyCandidateId, [ user.user_id, retryResult.data.id ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user youVerify candidate id saved in the DB but still unverified
        createUserAddressYouVerifyCandidate.middlewares.user.js`);
        req.userYouVerifyCandidateDetails = retryResult.data;
        return next();
      }
      userActivityTracking(req.user.user_id, 83, 'fail');
      // const errorMessage = !retryResult.response.data ? enums.USER_YOU_VERIFY_ADDRESS_VERIFICATION_CANNOT_PROCEED : retryResult.response.data.message;
      // const errorCode = !retryResult.response.data ? enums.HTTP_FORBIDDEN : retryResult.response.data.statusCode;
      return ApiResponse.error(res, enums.USER_YOU_VERIFY_ADDRESS_VERIFICATION_CANNOT_PROCEED , enums.HTTP_FORBIDDEN,
        enums.CREATE_USER_ADDRESS_YOU_VERIFY_CANDIDATE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user candidate details could not be created with youVerify
    createUserAddressYouVerifyCandidate.middlewares.user.js`);
    userActivityTracking(req.user.user_id, 83, 'fail');
    return ApiResponse.error(res, enums.USER_YOU_VERIFY_ADDRESS_VERIFICATION_ISSUES, enums.HTTP_SERVICE_UNAVAILABLE,
      enums.CREATE_USER_ADDRESS_YOU_VERIFY_CANDIDATE_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CREATE_USER_ADDRESS_YOU_VERIFY_CANDIDATE_MIDDLEWARE;
    logger.error(`creating user youVerify candidate failed::${enums.CREATE_USER_ADDRESS_YOU_VERIFY_CANDIDATE_MIDDLEWARE}`, error.message);
    return ApiResponse.error(res, enums.USER_YOU_VERIFY_ADDRESS_VERIFICATION_CANNOT_PROCEED, enums.HTTP_FORBIDDEN, enums.CREATE_USER_ADDRESS_YOU_VERIFY_CANDIDATE_MIDDLEWARE);
  }
};

/**
 * uploading utility bill document to s3
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminUserMiddleware
 */
export const uploadUtilityBillDocument = async(req, res, next) => {
  try {
    const { files, user, body } = req;
    if (!files || (files && !files.document)) {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${user.user_id}:::Info: no file is being selected for upload uploadUtilityBillDocument.middlewares.user.js`);
      return ApiResponse.error(res, enums.UPLOAD_DOCUMENT_VALIDATION, enums.HTTP_BAD_REQUEST, enums.UPLOAD_UTILITY_BILL_DOCUMENT_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},  ${user.user_id}:::Info: to be uploaded file is existing uploadUtilityBillDocument.middlewares.user.js`);
    const fileExt = path.extname(files.document.name);
    if (files.document.size > 3197152) { // 3 MB
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${user.user_id}:::Info: file size is greater than 3MB uploadUtilityBillDocument.middlewares.user.js`);
      return ApiResponse.error(res, enums.FILE_SIZE_TOO_BIG, enums.HTTP_BAD_REQUEST, enums.UPLOAD_UTILITY_BILL_DOCUMENT_MIDDLEWARE);
    }
    const acceptedImageFileTypes = [ '.png', '.jpg', '.jpeg' ];
    if (!acceptedImageFileTypes.includes(fileExt)) {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${user.user_id}:::Info: document type is not a jpeg, jpg or png file uploadUtilityBillDocument.middlewares.user.js`);
      return ApiResponse.error(res, enums.UPLOAD_AN_IMAGE_DOCUMENT_VALIDATION, enums.HTTP_BAD_REQUEST, enums.UPLOAD_UTILITY_BILL_DOCUMENT_MIDDLEWARE);
    }
    const url = `files/user-documents/${user.user_id}/utility-bills/${files.document.name}`;
    if (config.SEEDFI_NODE_ENV === 'test') {
      req.document = encodeURIComponent(
        await Hash.encrypt({
          document_url: 'https://p-i.s3.us-west-2.amazonaws.com/files/user-documents/user-af4922be60fd1b85068ed/land%20ownership%20proof.doc',
          document_extension: fileExt
        })
      );
      return next();
    }
    const payload = Buffer.from(files.document.data, 'binary');
    logger.info(`${enums.CURRENT_TIME_STAMP},  ${user.user_id}:::Info: upload payload and url set uploadUtilityBillDocument.middlewares.user.js`);
    const contentType = body.type === 'file' ? 'application/pdf' : 'image/png';
    const data  = await S3.uploadFile(url, payload, contentType);
    logger.info(`${enums.CURRENT_TIME_STAMP},  ${user.user_id}:::Info:file uploaded to amazon s3 bucket uploadUtilityBillDocument.middlewares.user.js`);
    req.document = encodeURIComponent(
      await Hash.encrypt({ document_url: data.Location, document_extension: fileExt })
    );
    return next();
  } catch (error) {
    error.label = enums.UPLOAD_UTILITY_BILL_DOCUMENT_MIDDLEWARE;
    logger.error(`uploading utility bill document to amazon s3 failed::${enums.UPLOAD_UTILITY_BILL_DOCUMENT_MIDDLEWARE}`, error.message);
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

export const checkIfBvnIsVerified = async(req, res, next) => {
  try {
    const { user, body } = req;
    if ((user.is_verified_bvn) && (body.first_name ||  body.last_name || body.middle_name || body.date_of_birth || body.gender)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      successfully checked if BVN is verified checkIfBvnIsVerified.middlewares.user.js`);
      return ApiResponse.error(res, enums.DETAILS_CAN_NOT_BE_UPDATED, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_BVN_IS_VERIFIED_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_BVN_IS_VERIFIED_MIDDLEWARE;
    logger.error(`checking if BVN is verified failed::${enums.CHECK_IF_BVN_IS_VERIFIED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};


/**
 * check if card exists in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkIfCardOrUserExist = async(req, res, next) => {
  try {
    const { user, params: { id, payment_channel_id }, query: { payment_channel } } = req;
    if (!payment_channel || payment_channel === 'card') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      no query payment type sent or query payment type sent is to check for card repayment checkIfCardOrUserExist.middlewares.user.js`);
      const query_params = [ id || payment_channel_id, user.user_id ];
      const userCard = await processOneOrNoneData(userQueries.fetchCardsByIdOrUserId, query_params);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      successfully fetched a user's card checkIfCardOrUserExist.middlewares.user.js`);
      if (userCard === null) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      successfully confirmed card does not exist in the DB checkIfCardOrUserExist.middlewares.user.js`);
        return ApiResponse.error(res, enums.CARD_DOES_NOT_EXIST, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CARD_EXISTS_MIDDLEWARE);
      }
      if (user.user_id !== userCard.user_id) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      successfully confirmed the card does not belong to user checkIfCardOrUserExist.middlewares.user.js`);
        return ApiResponse.error(res, enums.CARD_DOES_NOT_BELONG_TO_USER, enums.HTTP_FORBIDDEN, enums.CHECK_IF_CARD_EXISTS_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      successfully confirmed the card exists and belongs to user checkIfCardOrUserExist.middlewares.user.js`);
      req.userDebitCard = userCard;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
    query payment type is sent and query payment type sent is to check for bank repayment checkIfCardOrUserExist.middlewares.user.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_CARD_EXISTS_MIDDLEWARE;
    logger.error(`checking if card exists failed::${enums.CHECK_IF_CARD_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if card to be set default is already set as default card
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkIfCardAlreadyDefaultCard = async(req, res, next) => {
  try {
    const { user, userDebitCard } = req;
    if (userDebitCard.is_default) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      to be updated card is already default card checkIfCardOrUserExist.middlewares.user.js`);
      return ApiResponse.error(res, enums.CARD_ALREADY_SET_DEFAULT, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CARD_ALREADY_DEFAULT_CARD_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_CARD_ALREADY_DEFAULT_CARD_MIDDLEWARE;
    logger.error(`checking if card to be set default already default card failed::${enums.CHECK_IF_CARD_ALREADY_DEFAULT_CARD_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user has updated advanced kyc
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkUserAdvancedKycUpdate = async(req, res, next) => {
  try {
    const { user, userEmploymentDetails } = req;
    if (!userEmploymentDetails || userEmploymentDetails.monthly_income === null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not updated income range in the DB checkUserAdvancedKycUpdate.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_ADVANCED_KYC_NOT_COMPLETED('monthly income'), enums.HTTP_FORBIDDEN, enums.CHECK_USER_ADVANCED_KYC_UPDATE_MIDDLEWARE);
    }
    if (user.number_of_children === null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not updated number of dependents in the DB checkUserAdvancedKycUpdate.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_ADVANCED_KYC_NOT_COMPLETED('number of children'), enums.HTTP_FORBIDDEN, enums.CHECK_USER_ADVANCED_KYC_UPDATE_MIDDLEWARE);
    }
    if (user.marital_status === null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not updated marital status in the DB checkUserAdvancedKycUpdate.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_ADVANCED_KYC_NOT_COMPLETED('marital status'), enums.HTTP_FORBIDDEN, enums.CHECK_USER_ADVANCED_KYC_UPDATE_MIDDLEWARE);
    }
    if (!userEmploymentDetails || userEmploymentDetails.employment_type === null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not updated employment type in the DB checkUserAdvancedKycUpdate.middlewares.user.js`);
      return ApiResponse.error(res, enums.USER_ADVANCED_KYC_NOT_COMPLETED('employment type'), enums.HTTP_FORBIDDEN, enums.CHECK_USER_ADVANCED_KYC_UPDATE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has update all advanced kyc in the DB checkUserAdvancedKycUpdate.middlewares.user.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_USER_ADVANCED_KYC_UPDATE_MIDDLEWARE;
    logger.error(`checking if user has done advanced kyc in the DB failed::${enums.CHECK_USER_ADVANCED_KYC_UPDATE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user has previously added next of kin details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkIfUserHasPreviouslyCreatedNextOfKin = async(req, res, next) => {
  try {
    const { user } = req;
    const nextOfKin = await processOneOrNoneData(userQueries.getUserNextOfKin, user.user_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched user next of kin checkIfUserHasPreviouslyCreatedNextOfKin.middlewares.user.js`);
    if (nextOfKin) {
      return ApiResponse.error(res, enums.CANNOT_CHANGE_NEXT_OF_KIN, enums.HTTP_FORBIDDEN, enums.CHECK_IF_USER_HAS_FILLED_NEXT_OF_KIN_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_USER_HAS_FILLED_NEXT_OF_KIN_MIDDLEWARE;
    logger.error(`checking if user has previously filled next of kin details in the DB failed::${enums.CHECK_IF_USER_HAS_FILLED_NEXT_OF_KIN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check user profile next update
 * @param {Request} type - The request from the endpoint.
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const userProfileNextUpdate = (type = '')=> async(req, res, next) => {
  try {
    const {user, userEmploymentDetails, body} = req;
    if (type === 'employment') {
      if (!userEmploymentDetails) {
        return ApiResponse.error(res, enums.EMPLOYMENT_DETAILS_NOT_PREVIOUSLY_SET, enums.HTTP_FORBIDDEN, enums.USER_PROFILE_NEXT_UPDATE_MIDDLEWARE);
      }
      const canUpdate = dayjs().isAfter(dayjs(userEmploymentDetails.employment_next_update));
      if (!canUpdate) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Info: user can only update their
        details once in three months in the  DB userProfileNextUpdate.middlewares.user.js`);
        return ApiResponse.error(res, enums.USER_PROFILE_NEXT_UPDATE(type), enums.HTTP_FORBIDDEN, enums.USER_PROFILE_NEXT_UPDATE_MIDDLEWARE);
      }
      return next();
    }
    if ((user.next_profile_update !== null) && ((parseFloat(body.number_of_children) !== parseFloat(user.number_of_children)) ||
    (body.marital_status.toLowerCase() !== user.marital_status?.toLowerCase()))) {
      const canUpdate = dayjs().isAfter(dayjs(user.next_profile_update));
      if (!canUpdate) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Info: user can only update their
        details once in three months in the  DB userProfileNextUpdate.middlewares.user.js`);
        return ApiResponse.error(res, enums.USER_PROFILE_NEXT_UPDATE(type), enums.HTTP_FORBIDDEN, enums.USER_PROFILE_NEXT_UPDATE_MIDDLEWARE);
      }
      return next();
    }
    return next();
  } catch (error) {
    error.label = enums.USER_PROFILE_NEXT_UPDATE_MIDDLEWARE;
    logger.error(`checking user profile next update in the DB failed::${enums.USER_PROFILE_NEXT_UPDATE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * verify the legibility of the webhook response if from YouVerify
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const youVerifyWebhookVerification = async(req, res, next) => {
  try {
    if (config.SEEDFI_NODE_ENV === 'test') {
      return next();
    }
    const webhookSigningKey = config.SEEDFI_YOU_VERIFY_WEBHOOK_SIGNING_KEY;
    const hash = crypto.createHmac('sha256', webhookSigningKey).update(JSON.stringify(req.body)).digest('hex');
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully saved the hash generated using the signing key into a variable "hash"
    and the webhook signing key from the config into the variable "secret" youVerifyWebhookVerification.middlewares.user.js`);
    if (!hash) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decodes that no hash is returned in
      the headers of the response youVerifyWebhookVerification.middlewares.user.js`);
      return ApiResponse.error(res, enums.NO_AUTHORIZATION, enums.HTTP_FORBIDDEN, enums.YOU_VERIFY_WEBHOOK_VERIFICATION_MIDDLEWARE);
    }
    if (hash !== req.headers['x-youverify-signature']) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decodes that the youVerify authorization token is
      invalid youVerifyWebhookVerification.middlewares.user.js`);
      return ApiResponse.error(res, enums.INVALID_AUTHORIZATION, enums.HTTP_FORBIDDEN, enums.YOU_VERIFY_WEBHOOK_VERIFICATION_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decodes that youVerify authorization token is a valid one from
      youVerify youVerifyWebhookVerification.middlewares.user.js`);
    return next();
  } catch (error) {
    error.label = enums.YOU_VERIFY_WEBHOOK_VERIFICATION_MIDDLEWARE;
    logger.error(`verification of youVerify webhook hash failed:::${enums.YOU_VERIFY_WEBHOOK_VERIFICATION_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * verify the webhook event type and the user
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const verifyUserAndAddressResponse = async(req, res, next) => {
  try {
    const { body } = req;
    if (body.event.toLowerCase() === 'address.completed') {
      const [ userAddressDetails ] = await processAnyData(userQueries.fetchUserAddressDetails, [ body.data.candidate.candidateId.trim() ]);
      if (!userAddressDetails) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, Info: no user exists for the candidate ID that was sent with the webhook
      verifyUserAndAddressResponse.middlewares.user.js`);
        return ApiResponse.error(res, enums.NON_EXISTING_USER_CANDIDATE_ID_SENT, enums.HTTP_BAD_REQUEST, enums.VERIFY_USER_AND_ADDRESS_RESPONSE_MIDDLEWARE);
      }
      if (userAddressDetails.you_verify_address_verification_status === 'verified') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${userAddressDetails.user_id}:::Info: successfully candidates address has been previously verified by
      youVerify verifyUserAndAddressResponse.middlewares.user.js`);
        return ApiResponse.error(res, enums.USER_ADDRESS_PREVIOUSLY_VERIFIED, enums.HTTP_CONFLICT, enums.VERIFY_USER_AND_ADDRESS_RESPONSE_MIDDLEWARE);
      }
      req.userAddressDetails = userAddressDetails;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decodes that the webhook event sent is not valid
    verifyUserAndAddressResponse.middlewares.user.js`);
    return ApiResponse.error(res, enums.INVALID_YOU_VERIFY_WEBHOOK_EVENT, enums.HTTP_FORBIDDEN, enums.VERIFY_USER_AND_ADDRESS_RESPONSE_MIDDLEWARE);

  } catch (error) {
    error.label = enums.VERIFY_USER_AND_ADDRESS_RESPONSE_MIDDLEWARE;
    logger.error(`verification of webhook details sent failed:::${enums.VERIFY_USER_AND_ADDRESS_RESPONSE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user belongs to any cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkIfUserBelongsToAnyCluster = async(req, res, next) => {
  try {
    const { user } = req;
    const activeClusterMembership = await processAnyData(userQueries.checkUserClusterMembership, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched user cluster membership list checkIfUserBelongsToAnyCluster.middlewares.user.js`);
    if (activeClusterMembership.length > 0) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user still belongs to a cluster checkIfUserBelongsToAnyCluster.middlewares.user.js`);
      userActivityTracking(req.user.user_id, 108, 'fail');
      return ApiResponse.error(res, enums.ACTION_CANNOT_BE_DONE('kindly exit all clusters'), enums.HTTP_FORBIDDEN, enums.CHECK_IF_USER_BELONGS_TO_ANY_CLUSTER_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does not belongs to a cluster checkIfUserBelongsToAnyCluster.middlewares.user.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 108, 'fail');
    error.label = enums.CHECK_IF_USER_BELONGS_TO_ANY_CLUSTER_MIDDLEWARE;
    logger.error(`checking if user belongs to a cluster in the DB failed::${enums.CHECK_IF_USER_BELONGS_TO_ANY_CLUSTER_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user is on any active loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof UserMiddleware
 */
export const checkIfUserOnAnyActiveLoan = async(req, res, next) => {
  try {
    const { user } = req;
    const activeClusterLoan = await processAnyData(userQueries.checkUserClusterLoanActiveness, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched user active cluster loan lists checkIfUserOnAnyActiveLoan.middlewares.user.js`);
    if (activeClusterLoan.length > 0) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has active cluster loan application checkIfUserOnAnyActiveLoan.middlewares.user.js`);
      return ApiResponse.error(res, enums.ACTION_CANNOT_BE_DONE('kindly complete/cancel existing cluster loans'), enums.HTTP_FORBIDDEN,
        enums.CHECK_IF_USER_ON_ANY_ACTIVE_LOAN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does have active cluster loan application checkIfUserOnAnyActiveLoan.middlewares.user.js`);
    const activeIndividualLoan = await processAnyData(userQueries.checkUserIndividualLoanActiveness, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched user active individual loan lists checkIfUserOnAnyActiveLoan.middlewares.user.js`);
    if (activeIndividualLoan.length > 0) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has active individual loan application checkIfUserOnAnyActiveLoan.middlewares.user.js`);
      return ApiResponse.error(res, enums.ACTION_CANNOT_BE_DONE('kindly complete/cancel existing individual loans'), enums.HTTP_FORBIDDEN,
        enums.CHECK_IF_USER_ON_ANY_ACTIVE_LOAN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does have active individual loan application checkIfUserOnAnyActiveLoan.middlewares.user.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_USER_ON_ANY_ACTIVE_LOAN_MIDDLEWARE;
    logger.error(`checking if user have active individual/cluster loan application in the DB failed::${enums.CHECK_IF_USER_ON_ANY_ACTIVE_LOAN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};



