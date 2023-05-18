import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import authQueries from '../queries/queries.auth';
import userQueries from '../queries/queries.user';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import * as Hash from '../../lib/utils/lib.util.hash';
import { userActivityTracking } from '../../lib/monitor';
import config from '../../config';
import { fetchBanks } from '../services/service.paystack';
import { updateNotificationReadBoolean } from '../services/services.firebase';
import { initiateUserYouVerifyAddressVerification } from '../services/service.youVerify';
import { sendUserPersonalNotification, sendPushNotification } from '../services/services.firebase';
import * as PushNotifications from '../../lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates//personalNotification';
import MailService from '../services/services.email';
import UserPayload from '../../lib/payloads/lib.payload.user';

const { SEEDFI_NODE_ENV } = config;

/**
 * update user device fcm token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the users updated fcm token
 * @memberof UserController
 */
export const updateFcmToken = async(req, res, next) => {
  try {
    const {user, body} = req;
    await processOneOrNoneData(userQueries.updateUserFcmToken, [ user.user_id, body.fcm_token ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated user fcm token to the database updateFcmToken.controllers.user.js`);
    const data = {
      user_id: user.user_id,
      fcm_token: body.fcm_token
    };
    return ApiResponse.success(res, enums.USER_FCM_TOKEN_UPDATED, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.UPDATE_USER_FCM_TOKEN_CONTROLLER;
    logger.error(`user token update failed::${enums.UPDATE_USER_FCM_TOKEN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * refresh user auth token using refresh token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the users details
 * @memberof UserController
 */
export const updateUserRefreshToken = async(req, res, next) => {
  try {
    const { user, userEmploymentDetails } = req;
    const token = await Hash.generateAuthToken(user);
    logger.info(`${enums.CURRENT_TIME_STAMP},${user.user_id}::: Info: successfully generated access token updateUserRefreshToken.controllers.user.js`);
    const refreshToken = await Hash.generateRandomString(50);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully generated refresh token updateUserRefreshToken.controllers.user.js`);
    const [ updatedUser ] = await processAnyData(authQueries.loginUserAccount, [ user.user_id, refreshToken ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated new refresh token to the database updateUserRefreshToken.controllers.user.js`);
    const is_updated_advanced_kyc = (userEmploymentDetails?.monthly_income && user?.number_of_children && user?.marital_status && userEmploymentDetails?.employment_type) ? 
      true : false;
    const data = {
      ...updatedUser,
      is_updated_advanced_kyc,
      token
    };
    return ApiResponse.success(res, enums.USER_REFRESH_TOKEN_UPDATED, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.UPDATE_USER_REFRESH_TOKEN_CONTROLLER;
    logger.error(`user token update failed::${enums.UPDATE_USER_REFRESH_TOKEN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update user selfie image
 * @param {String} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns a successful image upload response
 * @memberof UserController
 */
export const updateSelfieImage = async(req, res, next) => {
  try {
    const { user, body } = req;
    const token =  Hash.generateRandomString(50);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random OTP generated updateSelfieImage.controllers.user.j`);
    const [ existingToken ] = await processAnyData(authQueries.getUserByVerificationToken, [ token ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if OTP is existing in the database updateSelfieImage.controllers.user.j`);
    if (existingToken) {
      return updateSelfieImage(req, res, next);
    }
    const [ updateUserSelfie ] = await processAnyData(userQueries.updateUserSelfieImage, [ user.user_id, body.image_url.trim(), token ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated user's selfie image and email verification token to the database 
    updateSelfieImage.controllers.user.js`);
    await MailService('Welcome to SeedFi 🎉', 'verifyEmail', { otp: token, ...user });
    userActivityTracking(user.user_id, 17, 'success');
    return ApiResponse.success(res, enums.USER_SELFIE_IMAGE_UPDATED_SUCCESSFULLY, enums.HTTP_OK, updateUserSelfie);
  } catch (error) {
    userActivityTracking(req.user.user_id, 17, 'fail');
    error.label = enums.UPDATE_SELFIE_IMAGE_CONTROLLER;
    logger.error(`updating user selfie image and email verification token in the DB failed::${enums.UPDATE_SELFIE_IMAGE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update user bvn
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with the users details
 * @memberof UserController
 */
export const updateBvn = async(req, res, next) => {
  try {
    const { body: { bvn }, user } = req;
    const hashedBvn = encodeURIComponent(await Hash.encrypt(bvn.trim()));
    const tierChoice = (user.is_completed_kyc && user.is_uploaded_identity_card) ? '1' : '0'; 
    // user needs to upload valid id, verify bvn and complete basic profile details to move to tier 1
    const tier_upgraded = tierChoice === '1' ? true : false;
    const [ updateBvn ] = await processAnyData(userQueries.updateUserBvn, [ user.user_id, hashedBvn, tierChoice ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated user's bvn and updating user tier to the database updateBvn.controllers.user.js`);
    userActivityTracking(user.user_id, 5, 'success');
    return ApiResponse.success(res, enums.USER_BVN_VERIFIED_SUCCESSFULLY, enums.HTTP_OK, { ...updateBvn, tier_upgraded });
  } catch (error) {
    userActivityTracking(req.user.user_id, 5, 'fail');
    error.label = enums.UPDATE_BVN_CONTROLLER;
    logger.error(`updating user bvn after verification failed::${enums.UPDATE_BVN_CONTROLLER}`, error.message);
    return next(error);
  }
};


/**
 Request email verification
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response
 * @memberof AuthController
 */
export const requestEmailVerification = async(req, res, next) => {
  try {
    const { user } = req;
    const token =  Hash.generateRandomString(50);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: random OTP generated requestEmailVerification.controller.auth.js`);
    const [ existingToken ] = await processAnyData(authQueries.getUserByVerificationToken, [ token ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: checked if OTP is existing in the database requestEmailVerification.controller.auth.js`);
    if (existingToken) {
      return requestEmailVerification(req, res, next);
    }
    const expireAt = dayjs().add(10, 'minutes');
    const expirationTime = dayjs(expireAt);
    const payload = [ user.email, token, expireAt ];
    await processAnyData(userQueries.emailVerificationToken, payload);
    const data ={ user_id: user.user_id, otp: token, otpExpire: expirationTime };
    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.REQUEST_EMAIL_VERIFICATION, enums.HTTP_OK, data);
    }
    await MailService('Verify your email', 'requestVerifyEmail', { otp: token, ...user });
    logger.info(`[${enums.CURRENT_TIME_STAMP}, ${user.user_id},
      Info: email verification has been sent successfully to user mail. requestEmailVerification.controller.auth.js`);
    userActivityTracking(req.user.user_id, 3, 'success');
    return ApiResponse.success(res, enums.REQUEST_EMAIL_VERIFICATION, enums.HTTP_OK);
  } catch (error) {
    userActivityTracking(req.user.user_id, 3, 'fail');
    error.label = enums.REQUEST_EMAIL_VERIFICATION_CONTROLLER;
    logger.error(`updating user email failed:::${enums.REQUEST_EMAIL_VERIFICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch available bank lists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response of the details of the list of available banks
 * @memberof UserController
 */
export const fetchAvailableBankLists = async(req, res, next) => {
  try {
    const { user } = req;
    const data = await fetchBanks();
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: bank lists returned from paystack fetchAvailableBankLists.controller.user.js`);
    return ApiResponse.success(res, data.message, enums.HTTP_OK, data.data);
  } catch (error) {
    error.label = enums.FETCH_BANKS_CONTROLLER;
    logger.error(`fetching list of banks from paystack failed:::${enums.FETCH_BANKS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch name attached to a bank account number
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response of the details of the bank account number
 * @memberof UserController
 */
export const returnAccountDetails = async(req, res, next) => {
  try {
    const { user, accountNumberDetails } = req;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account number resolved successfully returnAccountDetails.controller.user.js`);
    return ApiResponse.success(res, accountNumberDetails.message, enums.HTTP_OK, accountNumberDetails.data);
  } catch (error) {
    error.label = enums.RETURN_ACCOUNT_DETAILS_CONTROLLER;
    logger.error(`resolving bank account name enquiry failed:::${enums.RETURN_ACCOUNT_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * save bank account details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response of the added bank account details
 * @memberof UserController
 */
export const saveAccountDetails = async(req, res, next) => {
  try {
    const { user, body, accountNumberDetails } = req;
    const payload = UserPayload.bankAccountPayload(user, body, accountNumberDetails);
    const [ accountDetails ] = await processAnyData(userQueries.saveBankAccountDetails, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: account number resolved successfully returnAccountDetails.controller.user.js`);
    userActivityTracking(user.user_id, 27, 'success');
    return ApiResponse.success(res, enums.BANK_ACCOUNT_SAVED_SUCCESSFULLY, enums.HTTP_OK, accountDetails);
  } catch (error) {
    userActivityTracking(req.user.user_id, 27, 'fail');
    error.label = enums.SAVE_ACCOUNT_DETAILS_CONTROLLER;
    logger.error(`save bank account details in the DB failed:::${enums.SAVE_ACCOUNT_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch user saved bank account details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response of all users added bank account details
 * @memberof UserController
 */
export const fetchUserAccountDetails = async(req, res, next) => {
  try {
    const { user } = req;
    const accountDetails = await processAnyData(userQueries.fetchBankAccountDetails, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's saved account details fetched successfully fetchUserAccountDetails.controller.user.js`);
    return ApiResponse.success(res, enums.BANK_ACCOUNTS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, accountDetails);
  } catch (error) {
    error.label = enums.FETCH_USERS_ACCOUNT_DETAILS_CONTROLLER;
    logger.error(`fetching all user's bank account details from the DB failed:::${enums.FETCH_USERS_ACCOUNT_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch user saved debit cards
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response of all users added debit cards details
 * @memberof UserController
 */
export const fetchUserDebitCards = async(req, res, next) => {
  try {
    const { user } = req;
    const debitCards = await processAnyData(userQueries.fetchUserDebitCards, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's saved debit cards fetched successfully fetchUserDebitCards.controller.user.js`);
    await Promise.all(
      debitCards.map(async(card) => {
        const decryptedFirst6Digits = await Hash.decrypt(decodeURIComponent(card.first_6_digits));
        card.first_6_digits = decryptedFirst6Digits;
        const decryptedLast4Digits = await Hash.decrypt(decodeURIComponent(card.last_4_digits));
        card.last_4_digits = decryptedLast4Digits;
        card.card_expiry = `${card.expiry_month}/${card.expiry_year.slice(-2)}`;
        delete card.expiry_month;
        delete card.expiry_year;
        return card;
      })
    );
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's saved debit cards formatted successfully fetchUserDebitCards.controller.user.js`);
    return ApiResponse.success(res, enums.DEBIT_CARDS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, debitCards);
  } catch (error) {
    error.label = enums.FETCH_USER_DEBIT_CARDS_CONTROLLER;
    logger.error(`fetching all user's saved debit cards from the DB failed:::${enums.FETCH_USER_DEBIT_CARDS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * delete user saved bank account details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with a message of account deleted
 * @memberof UserController
 */
export const deleteUserAccountDetails = async(req, res, next) => {
  try {
    const { user, params: { id } } = req;
    await processAnyData(userQueries.deleteBankAccountDetails, [ user.user_id, id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's saved account details deleted successfully deleteUserAccountDetails.controller.user.js`);
    userActivityTracking(req.user.user_id, 29, 'success');
    return ApiResponse.success(res, enums.BANK_ACCOUNT_DELETED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    userActivityTracking(req.user.user_id, 29, 'fail');
    error.label = enums.DELETE_USER_ACCOUNT_DETAILS_CONTROLLER;
    logger.error(`delete users saved account details in the DB failed:::${enums.DELETE_USER_ACCOUNT_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update account details choice sent
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response with a message of account deleted
 * @memberof UserController
 */
export const updateAccountDetailsChoice = async(req, res, next) => {
  const { user, params: { id }, query: { type } } = req;
  try {
    if (type === 'default') {
      const [ , [ updatedAccount ] ] = await Promise.all([
        processAnyData(userQueries.setExistingAccountDefaultFalse, [ user.user_id ]),
        processAnyData(userQueries.SetNewAccountDefaultTrue, [ user.user_id, id ])
      ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: saved account default choice updated successfully updateAccountDetailsChoice.controller.user.js`);
      userActivityTracking(req.user.user_id, 35, 'success');
      return ApiResponse.success(res, enums.BANK_ACCOUNT_CHOICE_UPDATED_SUCCESSFULLY(type), enums.HTTP_OK, updatedAccount);
    }
    if (type === 'disbursement') {
      const [ , [ updatedAccount ] ] = await Promise.all([
        processAnyData(userQueries.setExistingAccountDisbursementFalse, [ user.user_id ]),
        processAnyData(userQueries.SetNewAccountDisbursementTrue, [ user.user_id, id ])
      ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: saved account disbursement choice updated successfully updateAccountDetailsChoice.controller.user.js`);
      userActivityTracking(req.user.user_id, 36, 'success');
      return ApiResponse.success(res, enums.BANK_ACCOUNT_CHOICE_UPDATED_SUCCESSFULLY(type), enums.HTTP_OK, updatedAccount);
    }
  } catch (error) {
    const operationType = type === 'default' ? 35 : 36;
    userActivityTracking(req.user.user_id, operationType, 'fail');
    error.label = enums.UPDATE_USER_ACCOUNT_DETAILS_CHOICE_CONTROLLER;
    logger.error(`update account details default or disbursement choice in the DB failed:::${enums.UPDATE_USER_ACCOUNT_DETAILS_CHOICE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * Verify user email address
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response
 * @memberof UserController
 */
export const verifyEmail = async(req, res, next) => {
  try {
    const { user } = req;
    await processAnyData(userQueries.verifyEmail, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    User email address verified in the DB verifyEmail.controller.user.js`);
    userActivityTracking(req.user.user_id, 4, 'success');
    return SEEDFI_NODE_ENV === 'test' ? ApiResponse.success(res, enums.VERIFY_EMAIL, enums.HTTP_OK) : res.redirect(config.SEEDFI_VERIFY_EMAIL_MOBILE_REDIRECT_URL);
  } catch (error) {
    userActivityTracking(req.user.user_id, 4, 'fail');
    error.label = enums.VERIFY_EMAIL_CONTROLLER;
    logger.error(`verifying user email address in the DB failed:::${enums.VERIFY_EMAIL_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * user id verification
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON response
 * @memberof UserController
 */
export const idUploadVerification = async(req, res, next) => {
  try {
    const { user, body } = req; 
    const fileExt = path.extname(body.image_url.trim());
    const document = encodeURIComponent(
      await Hash.encrypt({ document_url: body.image_url.trim(), document_extension: fileExt })
    );
    const payload = UserPayload.imgVerification(user, body);
    await processAnyData(userQueries.updateIdVerification, payload);
    await processAnyData(userQueries.addDocumentTOUserUploadedDocuments, [ user.user_id, 'valid identification', document ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully saved uploaded selfie to user uploaded documents to the database 
    idUploadVerification.controllers.user.js`);
    const tierChoice = (user.is_completed_kyc && user.is_verified_bvn) ? '1' : '0'; 
    // user needs to verify bvn, upload valid id and complete basic profile details to move to tier 1
    const tier_upgraded = tierChoice === '1' ? true : false;
    const [ data ] =  await processAnyData(userQueries.userIdVerification, [ user.user_id, tierChoice ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    user id verification uploaded successfully DB idUploadVerification.controller.user.js`);
    userActivityTracking(req.user.user_id, 18, 'success');
    return ApiResponse.success(res, enums.ID_UPLOAD_VERIFICATION, enums.HTTP_OK, { ...data, tier_upgraded });
  } catch (error) {
    userActivityTracking(req.user.user_id, 18, 'fail');
    error.label = enums.ID_UPLOAD_VERIFICATION_CONTROLLER;
    logger.error(`Id verification failed:::${enums.ID_UPLOAD_VERIFICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * initiate user address verification using youVerify
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user address details.
 * @memberof UserController
 */

export const initiateAddressVerification = async(req, res, next) => {
  try {
    const { body, user, userAddressDetails, userYouVerifyCandidateDetails } = req;
    const candidateId = userAddressDetails ? userAddressDetails.you_verify_candidate_id : userYouVerifyCandidateDetails.id;
    const requestId = uuidv4();
    const result = await initiateUserYouVerifyAddressVerification(user, body, candidateId, requestId);
    if (result && result.statusCode === 201 && result.message.toLowerCase() === 'address requested successfully!') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user candidate details successfully created with youVerify 
      initiateAddressVerification.controller.user.js`);
      const payload = UserPayload.updateAddressVerification(body, user, requestId, candidateId, result.data);
      const updatedUserAddress = await processOneOrNoneData(userQueries.updateUserAddressDetails, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user address details updated in the DB but still awaiting verification
      initiateAddressVerification.controller.user.js`);
      userActivityTracking(req.user.user_id, 83, 'success');
      return ApiResponse.success(res, enums.USER_ADDRESS_UPDATED_SUCCESSFULLY, enums.HTTP_OK, updatedUserAddress);
    }
    if (result && result.statusCode !== 201) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's address verification creation failed initiateAddressVerification.middlewares.user.js`);
      userActivityTracking(req.user.user_id, 83, 'fail');
      return ApiResponse.error(res, result.response.data.message, result.response.data.statusCode, enums.INITIATE_ADDRESS_VERIFICATION_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user address verification could not be initiated with youVerify 
    initiateAddressVerification.controller.user.js`);
    userActivityTracking(req.user.user_id, 83, 'fail');
    return ApiResponse.error(res, enums.USER_YOU_VERIFY_ADDRESS_VERIFICATION_ISSUES, enums.HTTP_SERVICE_UNAVAILABLE, 
      enums.INITIATE_ADDRESS_VERIFICATION_CONTROLLER);
  } catch (error) {
    error.label = enums.INITIATE_ADDRESS_VERIFICATION_CONTROLLER;
    logger.error(`initiating user address verification failed:::${enums.INITIATE_ADDRESS_VERIFICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update user uploaded utility bill
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user details.
 * @memberof UserController
 */
export const updateUploadedUtilityBill = async(req, res, next) => {
  try {
    const { user, document } = req;
    await Promise.all([
      processOneOrNoneData(userQueries.updateUtilityBillDocument, [ user.user_id, document ]),
      processOneOrNoneData(userQueries.addDocumentTOUserUploadedDocuments, [ user.user_id, 'utility bill', document ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user uploaded utility bill document saved in the DB
    updateUploadedUtilityBill.controller.user.js`);
    userActivityTracking(req.user.user_id, 86, 'success');
    return ApiResponse.success(res, enums.USER_UTILITY_BILL_UPDATED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    userActivityTracking(req.user.user_id, 86, 'fail');
    error.label = enums.UPDATE_UPLOADED_UTILITY_BILL_CONTROLLER;
    logger.error(`updating user's uploaded utility bill failed:::${enums.UPDATE_UPLOADED_UTILITY_BILL_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update user address verification status based on youVerify response
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user details.
 * @memberof UserController
 */
export const updateUserAddressVerificationStatus = async(req, res, next) => {
  try {
    const { body, userAddressDetails } = req;
    const [ userDetails ] = await processAnyData(userQueries.getUserByUserId, [ userAddressDetails.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${userDetails.user_id}:::Info: user details fetched from the DB
    updateUserAddressVerificationStatus.controller.user.js`);
    if (body.data.taskStatus.toLowerCase() === 'verified') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${userDetails.user_id}:::Info: user address verification successful
      updateUserAddressVerificationStatus.controller.user.js`);
      await processOneOrNoneData(userQueries.updateAddressVerificationStatus, [ userAddressDetails.user_id, 'verified', false, true ]);
      const tierChoice = (userAddressDetails.is_verified_utility_bill) ? '2' : '1'; 
      // user needs address to have been verified and uploaded utility bill verified to move to tier 2
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${userDetails.user_id}:::Info: user tier value updated
      updateUserAddressVerificationStatus.controller.user.js`);
      await processOneOrNoneData(userQueries.updateUserTierValue, [ userDetails.user_id, tierChoice ]);
      sendPushNotification(userDetails.user_id, PushNotifications.successfulYouVerifyAddressVerification(), userDetails.fcm_token);
      sendUserPersonalNotification(userDetails, `${userDetails.first_name} address verification successful`, 
        PersonalNotifications.userAddressVerificationSuccessful(userDetails, userAddressDetails), 'address-verification-successful', {});
      await MailService('Address verification successful', 'successfulAddressVerification', { ...userDetails, ...userAddressDetails });
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${userDetails.user_id}:::Info: notifications of successful verification sent to user
    updateUserAddressVerificationStatus.controller.user.js`);
      await userActivityTracking(req.userAddressDetails.user_id, 85, 'success');
      if (tierChoice === '2') {
        sendPushNotification(userDetails.user_id, PushNotifications.userTierUpgraded(), userDetails.fcm_token);
        sendUserPersonalNotification(userDetails, 'Tier upgraded successfully', 
          PersonalNotifications.tierUpgradedSuccessfully(userDetails.first_name), 'tier-upgraded-successfully', {});
      }
      return ApiResponse.success(res, enums.USER_ADDRESS_VERIFICATION_SUCCESSFUL, enums.HTTP_OK);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${userDetails.user_id}:::Info: user address verification failed
    updateUserAddressVerificationStatus.controller.user.js`);
    await processOneOrNoneData(userQueries.updateAddressVerificationStatus, [ userAddressDetails.user_id, 'failed', true, false ]);
    sendPushNotification(userDetails.user_id, PushNotifications.failedYouVerifyAddressVerification(), userDetails.fcm_token);
    sendUserPersonalNotification(userDetails, `${userDetails.first_name} address verification failed`, 
      PersonalNotifications.userAddressVerificationFailed(userDetails, userAddressDetails), 'address-verification-failed', {});
    await MailService('Address verification failed', 'failedAddressVerification', { ...userDetails, ...userAddressDetails });
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${userDetails.user_id}:::Info: notifications of failed verification sent to user
    updateUserAddressVerificationStatus.controller.user.js`);
    await userActivityTracking(req.userAddressDetails.user_id, 84, 'success');
    return ApiResponse.success(res, enums.USER_ADDRESS_VERIFICATION_FAILED, enums.HTTP_OK);
  } catch (error) {
    await userActivityTracking(req.userAddressDetails.user_id, 85, 'fail');
    error.label = enums.UPDATE_USER_ADDRESS_VERIFICATION_STATUS_CONTROLLER;
    logger.error(`updating user's address verification status failed:::${enums.UPDATE_USER_ADDRESS_VERIFICATION_STATUS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update user profile
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user details.
 * @memberof UserController
 */
export const updateUserProfile = async(req, res, next) => {
  try {
    const { body, user } = req;
    const payload = UserPayload.updateUserProfile(body, user);
    const hasUpdates = Boolean(body.first_name || body.middle_name || body.last_name || body.date_of_birth || body.gender);
    if (user.is_verified_bvn && hasUpdates) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
        decoded that user details are already linked to their bvn and cant be edited in the DB updateUserProfile.controller.user.js`);
      return ApiResponse.success(res, enums.UPDATED_USER_PROFILE_SUCCESSFULLY, enums.HTTP_OK, updatedUser);
    }
    const updatedUser = await processOneOrNoneData(userQueries.updateUserProfile, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    successfully updated user profile in the DB updateUserProfile.controller.user.js`);
    userActivityTracking(req.user.user_id, 19, 'success');
    return ApiResponse.success(res, enums.UPDATED_USER_PROFILE_SUCCESSFULLY, enums.HTTP_OK, updatedUser);
  } catch (error) {
    userActivityTracking(req.user.user_id, 19, 'fail');
    error.label = enums.UPDATE_USER_PROFILE_CONTROLLER;
    logger.error(`updating user's profile failed:::${enums.UPDATE_USER_PROFILE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * get user profile
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user details.
 * @memberof UserController
 */
export const getProfile = async(req, res, next) => {
  try {
    const { user, userEmploymentDetails } = req;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: User data Info fetched. getProfile.controllers.user.js`);
    delete user.pin; 
    delete user.password;
    delete user.fcm_token;
    delete user.refresh_token;
    const [ userEmploymentDetail,  userNextOfKinDetails ,  userAddressDetails, userBvn ]   = await Promise.all([
      processOneOrNoneData(userQueries.fetchEmploymentDetails, user.user_id),
      processOneOrNoneData(userQueries.getUserNextOfKin, user.user_id),
      processOneOrNoneData(userQueries.fetchUserAddressDetails, user.user_id),
      processOneOrNoneData(userQueries.fetchUserBvn, user.user_id)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully fetched user's employment details, address details and next of kin from the DB
    fetchUserInformationDetails.controller.user.js`);
    user.bvn = userBvn.bvn !== null ? await Hash.decrypt(decodeURIComponent(userBvn.bvn)) : '';
    user.is_updated_advanced_kyc = (userEmploymentDetails?.monthly_income && user?.number_of_children && user?.marital_status && userEmploymentDetails?.employment_type) ? 
      true : false;
    const data = {
      userProfileDetails: user,
      employmentDetails: userEmploymentDetail,
      nextOfKin: userNextOfKinDetails,
      addressDetails: userAddressDetails
    };
    return ApiResponse.success(res,enums.FETCH_USER_PROFILE, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.GET_USER_PROFILE_CONTROLLER;
    logger.error(`Fetching user profile failed:::${enums.GET_USER_PROFILE_CONTROLLER}`, error.message);
    return next(error);
  }
};


/**
 * sets a card as default
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns the set default card
 * @memberof UserController
 */
export const setDefaultCard = async(req, res, next) => {
  const { user, params: { id } } = req;
  try {
    const [ , [ defaultCard ] ] = await Promise.all([
      processAnyData(userQueries.setExistingCardDefaultFalse, [ user.user_id ]),
      processAnyData(userQueries.setNewCardDefaultTrue, [ user.user_id, id ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    successfully set user's default card setDefaultCard.controller.user.js`);
    userActivityTracking(req.user.user_id, 34, 'success');
    return ApiResponse.success(res, enums.CARD_SET_AS_DEFAULT_SUCCESSFULLY, enums.HTTP_OK, defaultCard);
  } catch (error) {
    userActivityTracking(req.user.user_id, 34, 'fail');
    error.label = enums.SET_DEFAULT_CARD_CONTROLLER;
    logger.error(`setting card as default in the DB failed:::${enums.SET_DEFAULT_CARD_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * removes a saved debit card 
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns saved card is deleted
 * @memberof UserController
 */

export const removeCard = async(req, res, next) => {
  try {
    const { user, params: { id }, userDebitCard } = req;
    await processAnyData(userQueries.removeCard, [ user.user_id, id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
    successfully removed a user's saved card.controller.user.js`);
    if (userDebitCard.is_default) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: to be deleted debit card is default card removeCard.controller.user.js`);
      await processAnyData(userQueries.updateSecondaryCardDefault, [ user.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: a new default card set automatically removeCard.controller.user.js`);
    }
    userActivityTracking(req.user.user_id, 28, 'success');
    return ApiResponse.success(res, enums.CARD_REMOVED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    userActivityTracking(req.user.user_id, 28, 'fail');
    error.label = enums.REMOVE_SAVED_CARD_CONTROLLER;
    logger.error(`setting card as default in the DB failed:::${enums.REMOVE_SAVED_CARD_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * user's homepage details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user homepage details
 * @memberof UserController
 */
export const homepageDetails = async(req, res, next) => {
  try {
    const { user } = req;
    const [ userOutstandingPersonalLoanRepayment ] = await processAnyData(userQueries.userOutstandingPersonalLoan, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's personal loan outstanding fetched homepageDetails.controller.user.js`);
    const outstandingPersonalLoanAmount = !userOutstandingPersonalLoanRepayment ? 0 : parseFloat(userOutstandingPersonalLoanRepayment.total_outstanding_amount);
    // to implement the query when cluster loan is implement
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's cluster loan outstanding fetched homepageDetails.controller.user.js`);
    const totalLoanObligation = parseFloat(parseFloat(outstandingPersonalLoanAmount +  0).toFixed(2)); // to include for cluster loan when implemented
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's total loan obligation calculated homepageDetails.controller.user.js`);
    const personalLoanTransactions =  await processAnyData(userQueries.userPersonalLoanTransactions, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's personal loan repayment transactions fetched homepageDetails.controller.user.js`);
    const underProcessingPersonalLoans = await processAnyData(userQueries.userExistingProcessingLoans, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's still in process personal loans fetched from the DB homepageDetails.controller.user.jss`);
    const clusterLoanTransactions = []; // to later implement the query when cluster loan repayment is implemented
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's cluster loan repayment transactions fetched homepageDetails.controller.user.js`);
    const underProcessingClusterLoans = []; // to implement the query when cluster loan is implemented
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's still in process cluster loans fetched from the DB homepageDetails.controller.user.js`);
    const data = {
      user_id: user.user_id,
      first_name: user.first_name,
      user_loan_status: user.loan_status,
      user_individual_loan: {
        loan_id: !userOutstandingPersonalLoanRepayment ? '' : userOutstandingPersonalLoanRepayment.loan_id,
        total_outstanding_loan: parseFloat(parseFloat(outstandingPersonalLoanAmount).toFixed(2))
      },
      user_cluster_loan: {
        loan_id: '',
        total_outstanding_loan: 0 // to implement when cluster loan is worked on
      },
      total_loan_obligation: totalLoanObligation,
      personal_loan_transaction_history: {
        underProcessingPersonalLoans,
        personalLoanTransactions
      },
      cluster_loan_transaction_history: {
        underProcessingClusterLoans,
        clusterLoanTransactions
      }
    };
    return ApiResponse.success(res, enums.HOMEPAGE_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.HOMEPAGE_DETAILS_CONTROLLER;
    logger.error(`fetching user homepage details failed:::${enums.HOMEPAGE_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update a user notification is read status
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns successful or failed response of the updating action
 * @memberof UserController
 */
export const updateNotificationIsRead = async(req, res, next) => {
  try {
    const { body, user, params} = req;
    await updateNotificationReadBoolean(user, params, body);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully updated notification read status updateNotificationIsRead.controller.user.js`);
    return ApiResponse.success(res, enums.NOTIFICATION_UPDATED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_NOTIFICATION_IS_READ_CONTROLLER;
    logger.error(`updating user existing notification read status failed:::${enums.UPDATE_NOTIFICATION_IS_READ_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * create user next of kin details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user created next of kin details
 * @memberof UserController
 */
export const createNextOfKin = async(req, res, next) => {
  try {
    const { body, user} = req;
    const payload = UserPayload.createNextOfKin(body, user);
    const nextOfKin = await processOneOrNoneData(userQueries.createNextOfKin, payload);
    userActivityTracking(req.user.user_id, 89, 'success');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully created user's next of kin createNextOfKin.controller.user.js`);
    return ApiResponse.success(res, enums.NEXT_OF_KIN_CREATED_SUCCESSFULLY, enums.HTTP_CREATED, nextOfKin);
  } catch (error) {
    userActivityTracking(req.user.user_id, 89, 'fail');
    error.label = enums.CREATE_NEXT_OF_KIN_CONTROLLER;
    logger.error(`creating next of kin failed:::${enums.CREATE_NEXT_OF_KIN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * user employment details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user homepage details
 * @memberof UserController
 */
export const createUserEmploymentDetails = async(req, res, next) => {
  try {
    const payload = UserPayload.employmentDetails(req.body, req.user);
    const result = await processOneOrNoneData(userQueries.fetchEmploymentDetails, [ req.user.user_id ]);
    if (result) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Info: 
      User already created employment type in the DB. createUserEmploymentDetails.controller.user.js`);
      return ApiResponse.success(res, enums.EMPLOYMENT_TYPE_ALREADY_EXIST, enums.HTTP_BAD_REQUEST);
    }
    const data = await processOneOrNoneData(userQueries.createUserEmploymentDetails, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Info: 
    user employment details successfully updated in the DB. createUserEmploymentDetails.controller.user.js`);
    userActivityTracking(req.user.user_id, 90, 'success');
    return ApiResponse.success(res, enums.EMPLOYMENT_DETAILS, enums.HTTP_CREATED, data);
  } catch (error) {
    userActivityTracking(req.user.user_id, 90, 'fail');
    error.label = enums.EMPLOYMENT_DETAILS_CONTROLLER;
    logger.error(`creating user employment details failed:::${enums.EMPLOYMENT_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};


/**
 * user update employment details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user homepage details
 * @memberof UserController
 */
export const updateEmploymentDetails = async(req, res, next) => {
  try {
    const result = await processOneOrNoneData(userQueries.fetchEmploymentDetails, [ req.user.user_id ]);
    const payload = UserPayload.updateEmploymentDetails(req.body, result);
    const data = await processAnyData(userQueries.updateEmploymentDetails, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Info: 
    User successfully updated employment in the DB. updateEmploymentDetails.controller.user.js`);
    userActivityTracking(req.user.user_id, 90, 'success');
    return ApiResponse.success(res, enums.UPDATE_EMPLOYMENT_DETAILS, enums.HTTP_OK, data);
  } catch (error) {
    userActivityTracking(req.user.user_id, 90, 'fail');
    error.label = enums.UPDATE_EMPLOYMENT_DETAILS_CONTROLLER;
    logger.error(`updating user employment details failed:::${enums.UPDATE_EMPLOYMENT_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * user update mono account id details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user account details
 * @memberof UserController
 */
export const updateMonoAccountId = async(req, res, next) => {
  try {
    const { user, body } = req;
    const data = await processOneOrNoneData(userQueries.updateUserMonoAccountId, [ user.user_id, body.mono_account_id.trim() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: User mono id updated successfully in the DB. updateMonoAccountId.controller.user.js`);
    userActivityTracking(req.user.user_id, 92, 'success');
    return ApiResponse.success(res, enums.UPDATE_USER_MONO_ID, enums.HTTP_OK, data);
  } catch (error) {
    userActivityTracking(req.user.user_id, 92, 'fail');
    error.label = enums.UPDATE_MONO_ACCOUNT_ID_CONTROLLER;
    logger.error(`updating user mono id failed:::${enums.UPDATE_MONO_ACCOUNT_ID_CONTROLLER}`, error.message);
    return next(error);
  }
};

