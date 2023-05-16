import userQueries from '../queries/queries.user';
import UserPayload from '../../../admins/lib/payloads/lib.payload.user';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import MailService from '../services/services.email';
import * as UserHash from '../../../users/lib/utils/lib.util.hash';
import { sendPushNotification, sendUserPersonalNotification } from '../services/services.firebase';
import { userOrrScoreBreakdown } from '../services/services.seedfiUnderwriting';
import * as PushNotifications from '../../../admins/lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates/personalNotification';
import { adminActivityTracking } from '../../lib/monitor';
import { userActivityTracking } from '../../../users/lib/monitor';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import * as descriptions from '../../lib/monitor/lib.monitor.description';

/**
 * should activate and deactivate user status
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns success response.
 * @memberof AdminUserController
 */
export const editUserStatus = async(req, res, next) => {
  const { body: { status }, userDetails, admin } = req;
  let activityType;
  let description;
  const userName = `${userDetails.first_name} ${userDetails.last_name}`;
  const adminName = `${admin.first_name} ${admin.last_name}`;
  
  switch (status) {
  case 'deactivated':
    activityType = 20;
    description = descriptions.user_status(adminName, status, userName);
    break;
  case 'suspended':
    activityType = 24;
    description = descriptions.user_status(adminName, status, userName);
    break;
  case 'watchlisted':
    activityType = 26;
    description = descriptions.user_status(adminName, status, userName);
    break;
  case 'blacklisted':
    activityType = 25;
    description = descriptions.user_status(adminName, status, userName);
    break;
  default:
    activityType = 19;
    description = descriptions.user_status(adminName, status, userName);
    break;
  }
  try {
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: 
    decoded that admin is about to update user status. editUserStatus.admin.controllers.user.js`);
    await processAnyData(userQueries.editUserStatus, [ req.params.user_id, req.body.status ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: 
    confirm that user status has been edited and updated in the DB. editUserStatus.admin.controllers.user.js`);
    const addBlacklistedBvnPayload = UserPayload.addBlacklistedBvn(userDetails);
    if (status === 'blacklisted' && userDetails.bvn !== null) {
      await processOneOrNoneData(userQueries.addBlacklistedBvn, addBlacklistedBvnPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: user bvn is added to blacklisted bvn list editUserStatus.admin.controllers.user.js`);
    }
    if (userDetails.status === 'blacklisted' && status === 'active') {
      const userDecryptedBvn = await UserHash.decrypt(decodeURIComponent(userDetails.bvn));
      const allExistingBlacklistedBvns = await processAnyData(userQueries.fetchAllExistingBlacklistedBvns, []);
      const plainBlacklistedBvnsDetails = [];
      const decryptBvns = allExistingBlacklistedBvns.forEach(async(data) => {
        const decryptedBvn = await UserHash.decrypt(decodeURIComponent(data.bvn));
        data.decryptedBvn = decryptedBvn;
        plainBlacklistedBvnsDetails.push(data);
      });
      await Promise.all([ decryptBvns ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: all encoded blacklisted BVNs are decrypted editUserStatus.admin.controllers.user.js`);
      const usersBlacklistedDetails = plainBlacklistedBvnsDetails.filter((bvnDetail) => userDecryptedBvn === bvnDetail.decryptedBvn);
      logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: users blacklisted BVNs are filtered out editUserStatus.admin.controllers.user.js`);
      if (usersBlacklistedDetails.length >= 1) {
        usersBlacklistedDetails.forEach(async(userDetails) => {
          await processOneOrNoneData(userQueries.removeBlacklistedBvn, [ userDetails.id ]);
          return userDetails;
        });
        logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: user bvn is removed from blacklisted bvn list editUserStatus.admin.controllers.user.js`);
        await processOneOrNoneData(userQueries.addUnBlacklistedBvn, addBlacklistedBvnPayload);
        logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: user bvn is added to unBlacklisted bvn list editUserStatus.admin.controllers.user.js`);
      }
    }
    await adminActivityTracking(req.admin.admin_id, activityType, 'success', description);
    return  ApiResponse.success(res, enums.EDIT_USER_STATUS, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.EDIT_USER_STATUS_CONTROLLER;
    logger.error(`activate and deactivate user failed:::${enums.EDIT_USER_STATUS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * return user profile details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user details.
 * @memberof AdminUserController
 */
export const userProfileDetails = async(req, res, next) => {
  try {
    const { admin, userDetails, userEmploymentDetails, userAddressDetails, userNextOfKinDetails } = req;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user referrals details fetched from the DB userProfileDetails.admin.controllers.user.js`);
    if (userDetails?.bvn) {
      const result = await UserHash.decrypt(decodeURIComponent(userDetails.bvn));
      userDetails.bvn =  result?.slice(0, 7) + '****'; // return first 7 digits of the bvn
    }
    const data = {
      personalInformation: { userDetails, userEmploymentDetails, userAddressDetails, userNextOfKinDetails }
    };
    return ApiResponse.success(res, enums.USER_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.USER_PROFILE_DETAILS_CONTROLLER;
    logger.error(`fetching user details and referral details from the DB failed:::${enums.USER_PROFILE_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * send notification to user
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns response of notification sent.
 * @memberof AdminRoleController
 */
export const sendNotifications = async(req, res, next) => {
  try {
    const { admin, userDetails, userEmploymentDetails, query: { type } } = req;
    if (type === 'incomplete-profile') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: type ${type} is decoded sendNotifications.admin.controllers.user.js`);
      if (userDetails.is_completed_kyc && userDetails.is_verified_bvn && 
          userDetails.is_uploaded_identity_card &&
          userEmploymentDetails?.monthly_income && userDetails?.number_of_children && 
          userDetails?.marital_status && userEmploymentDetails?.employment_type
      ) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: user profile previously completed sendNotifications.admin.controllers.user.js`);
        return ApiResponse.error(res, enums.USER_PROFILE_PREVIOUSLY_COMPLETED, enums.HTTP_BAD_REQUEST, enums.SEND_NOTIFICATIONS_CONTROLLER);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: user profile not  previously completed sendNotifications.admin.controllers.user.js`);
      await sendPushNotification(userDetails.user_id, PushNotifications.userCompleteProfile, userDetails.fcm_token);
      if (userDetails.email !== null) {
        await MailService('Kindly complete your kyc', 'completeKyc', { email: userDetails.email });
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: push notification sent to user successfully sendNotifications.admin.controllers.user.js`);
    }
    return ApiResponse.success(res, enums.NOTIFICATION_SENT_TO_USER_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.SEND_NOTIFICATIONS_CONTROLLER;
    logger.error(`sending notifications to user failed:::${enums.SEND_NOTIFICATIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * return user account information(debit cards and bank account) details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user details.
 * @memberof AdminUserController
 */
export const userAccountInformation = async(req, res, next) => {
  try {
    const { admin, params: { user_id } } = req;
    const [ userDebitCards, userBankAccount ] = await Promise.all([
      processAnyData(userQueries.fetchUserDebitCards, [ user_id ]),
      processAnyData(userQueries.fetchUserBankAccounts, [ user_id ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user debit cards and bank accounts fetched from the DB 
    userAccountInformation.admin.controllers.user.js`);
    await Promise.all(
      userDebitCards.map(async(card) => {
        const decryptedFirst6Digits = await UserHash.decrypt(decodeURIComponent(card.first_6_digits));
        card.first_6_digits = decryptedFirst6Digits;
        const decryptedLast4Digits = await UserHash.decrypt(decodeURIComponent(card.last_4_digits));
        card.last_4_digits = decryptedLast4Digits;
        card.card_expiry = `${card.expiry_month}/${card.expiry_year.slice(-2)}`;
        delete card.expiry_month;
        delete card.expiry_year;
        return card;
      })
    );
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user debit cards formatted successfully fetchUserDebitCards.controller.user.js`);
    const data = {
      userDebitCards,
      userBankAccount
    };
    return ApiResponse.success(res, enums.USER_ACCOUNT_INFORMATION_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.USER_ACCOUNT_INFORMATION_CONTROLLER;
    logger.error(`fetching user account information from the DB failed:::${enums.USER_ACCOUNT_INFORMATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * return all the users based on specific searches
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user details.
 * @memberof AdminRoleController
 */
export const fetchUsers = async(req, res, next) => {
  try {
    const { query, admin } = req;
    if (query.export) {
      const payload = UserPayload.fetchAllUsers(query);
      const users  = await processAnyData(userQueries.fetchAllUsers, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched all users from the DB fetchUsers.admin.controllers.user.js`);
      const data = {
        total_count: users.length,
        users
      };
      return ApiResponse.success(res, enums.USERS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
    }
    const  payload  = UserPayload.fetchUsers(query);
    const [ users, [ usersCount ] ] = await Promise.all([
      processAnyData(userQueries.fetchUsers, payload),
      processAnyData(userQueries.fetchUsersCount, payload)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched users from the DB fetchUsers.admin.controllers.user.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(usersCount.total_count),
      total_pages: Helpers.calculatePages(Number(usersCount.total_count), Number(req.query.per_page) || 10),
      users
    };
    return ApiResponse.success(res, enums.USERS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_USERS_CONTROLLER;
    logger.error(`fetching users in the DB failed:::${enums.FETCH_USERS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * save user uploaded document
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user uploaded document details.
 * @memberof AdminUserController
 */
export const saveUserUploadedDocument = async(req, res, next) => {
  try {
    const { admin, userDetails, body, document } = req;
    const userName = `${userDetails.first_name} ${userDetails.last_name}`;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const uploadedDocument = await processOneOrNoneData(userQueries.uploadUserDocument, [ userDetails.user_id, admin.admin_id, body.title.trim(), document ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
    document uploaded and saved for user successfully saveUserUploadedDocument.admin.controllers.user.js`);
    await adminActivityTracking(admin.admin_id, 23, 'success', descriptions.uploads_document(adminName, userName));
    return ApiResponse.success(res, enums.DOCUMENT_UPLOADED_AND_SAVED_SUCCESSFULLY_FOR_USER, enums.HTTP_OK, uploadedDocument);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 23, 'fail', descriptions.uploads_document_failed(req.admin.first_name));
    error.label = enums.SAVE_USER_UPLOADED_DOCUMENT_CONTROLLER;
    logger.error(`Saving uploaded document for user failed:::${enums.SAVE_USER_UPLOADED_DOCUMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetching admin uploaded documents of a user
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user uploaded document details.
 * @memberof AdminUserController
 */
export const fetchAdminUploadedUserDocuments = async(req, res, next) => {
  try {
    const { admin, userDetails } = req;
    const uploadedDocuments = await processAnyData(userQueries.fetchUploadedUserDocuments, [ userDetails.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user admin uploaded documents fetched successfully 
    fetchAdminUploadedUserDocuments.admin.controllers.user.js`);
    await Promise.all([
      uploadedDocuments.map(async(document) => {
        const { document_url, document_extension } = await UserHash.decrypt(decodeURIComponent(document.image_url));
        document.document_url = document_url;
        document.document_extension = document_extension;
        delete document.image_url;
        return document;
      })
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user admin uploaded documents sorted successfully 
    fetchAdminUploadedUserDocuments.admin.controllers.user.js`);
    return ApiResponse.success(res, enums.ADMIN_USER_UPLOADED_DOCUMENTS_FETCHED, enums.HTTP_OK, uploadedDocuments);
  } catch (error) {
    error.label = enums.FETCH_ADMIN_UPLOADED_USER_DOCUMENTS_CONTROLLER;
    logger.error(`Fetching uploaded document for user by admins failed:::${enums.FETCH_ADMIN_UPLOADED_USER_DOCUMENTS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch user orr breakdown
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user orr breakdown.
 * @memberof AdminUserController
 */
export const fetchUserOrrBreakdown = async(req, res, next) => {
  try {
    const { admin, userDetails } = req;
    const result = await userOrrScoreBreakdown(userDetails.user_id, '');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
     checked if user orr breakdown is available from the underwriting service fetchUserOrrBreakdown.admin.controllers.user.js`);
    if (result.status === 200 && result.data.customer_id === userDetails.user_id) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
      user has orr score breakdown in the underwriting service fetchUserOrrBreakdown.admin.controllers.user.js`);
      return ApiResponse.success(res, enums.FETCH_USER_ORR_BREAKDOWN, enums.HTTP_OK, result.data);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
      user does not have orr score breakdown in the underwriting service fetchUserOrrBreakdown.admin.controllers.user.js`);
    return ApiResponse.success(res, enums.FETCH_USER_ORR_BREAKDOWN, enums.HTTP_OK, { });
  } catch (error) {
    error.label = enums.USER_ORR_BREAKDOWN_CONTROLLER;
    logger.error(`fetching user orr breakdown failed:::${enums.USER_ORR_BREAKDOWN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch user kyc details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user kyc details.
 * @memberof AdminUserController
 */
export const fetchUserKycDetails = async(req, res, next) => {
  try {
    const { admin, userDetails } = req;
    const [ userKycDetail ] = await processAnyData(userQueries.fetchUserKycDetails, [ userDetails.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
     user kyc details fetched from the DB fetchUserKycDetails.admin.controllers.user.js`);
    if (!userKycDetail || userKycDetail.utility_bill_image_url === null) {
      return ApiResponse.success(res, enums.FETCH_USER_KYC_DETAILS, enums.HTTP_OK, userKycDetail);
    }
    const { document_url  } = await UserHash.decrypt(decodeURIComponent(userKycDetail.utility_bill_image_url));
    userKycDetail.utility_bill_image_url = document_url;
    return ApiResponse.success(res, enums.FETCH_USER_KYC_DETAILS, enums.HTTP_OK, userKycDetail);
  } catch (error) {
    error.label = enums.USER_KYC_DETAILS_CONTROLLER;
    logger.error(`fetching user kyc details failed:::${enums.USER_KYC_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * verify user utility bill
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user address and utility bill details.
 * @memberof AdminUserController
 */
export const verifyUserUtilityBill = async(req, res, next) => {
  try {
    const { admin, userDetails, userAddressDetails, body } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const userName = `${userDetails.first_name} ${userDetails.last_name}`;
    if (!userAddressDetails || userAddressDetails.address_image_url === null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user has not filled address details or has not uploaded any utility bill 
      verifyUserUtilityBill.admin.controllers.user.js`);
      return ApiResponse.error(res, enums.USER_HAS_NOT_UPLOADED_UTILITY_BILL, enums.HTTP_BAD_REQUEST, enums.VERIFY_USER_UTILITY_BILL_CONTROLLER);
    }
    if (userAddressDetails.is_verified_utility_bill) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user uploaded utility bill has been previously approved 
      verifyUserUtilityBill.admin.controllers.user.js`);
      return ApiResponse.error(res, enums.USER_UTILITY_BILL_PREVIOUSLY_APPROVED, enums.HTTP_BAD_REQUEST, enums.VERIFY_USER_UTILITY_BILL_CONTROLLER);
    }
    if (body.decision === 'decline') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: admin is deciding to decline the uploaded utility bill 
      verifyUserUtilityBill.admin.controllers.user.js`);
      const declineUtilityBill = await processOneOrNoneData(userQueries.declineUserUploadedUtilityBill, [ userDetails.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: uploaded utility bill has been declined so user can upload another 
      verifyUserUtilityBill.admin.controllers.user.js`);
      sendPushNotification(userDetails.user_id, PushNotifications.userUtilityBillNotification('decline'), userDetails.fcm_token);
      sendUserPersonalNotification(userDetails, `${userDetails.first_name} decline utility bill`, 
        PersonalNotifications.declinedUtilityBillNotification, 'utility-declined', {});
      await MailService('Declined utility bill', 'declinedUtilityBill', { email: userDetails.email, first_name: userDetails.first_name });
      await adminActivityTracking(req.admin.admin_id, 28, 'success', descriptions.decline_utility_bill(adminName, userName));
      userActivityTracking(userDetails.user_id, 87, 'success');
      return ApiResponse.success(res, enums.USER_UTILITY_BILL_DECIDED_SUCCESSFULLY('declined'), enums.HTTP_OK, declineUtilityBill);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: admin is deciding to approve the uploaded utility bill 
      verifyUserUtilityBill.admin.controllers.user.js`);
    const approveUtilityBill = await processOneOrNoneData(userQueries.approveUserUploadedUtilityBill, [ userDetails.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: uploaded utility bill has been approved verifyUserUtilityBill.admin.controllers.user.js`);
    const tierChoice = (approveUtilityBill.is_verified_address && approveUtilityBill.is_verified_utility_bill) ? '2' : '1'; 
    // user needs address to have been verified and uploaded utility bill verified to move to tier 2
    await processOneOrNoneData(userQueries.updateUserTier, [ userDetails.user_id, tierChoice ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: user tier value has been updated based on previous verifications
      verifyUserUtilityBill.admin.controllers.user.js`);
    sendPushNotification(userDetails.user_id, PushNotifications.userUtilityBillNotification('approved'), userDetails.fcm_token);
    sendUserPersonalNotification(userDetails, `${userDetails.first_name} decline utility bill`, 
      PersonalNotifications.approvedUtilityBillNotification, 'utility-bill-approved', {});
    await MailService('Approved utility bill', 'approvedUtilityBill', { email: userDetails.email, first_name: userDetails.first_name });
    await adminActivityTracking(req.admin.admin_id, 27, 'success', descriptions.approves_utility_bill(adminName, userName));
    userActivityTracking(userDetails.user_id, 88, 'success');
    return ApiResponse.success(res, enums.USER_UTILITY_BILL_DECIDED_SUCCESSFULLY('approved'), enums.HTTP_OK, approveUtilityBill);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 27, 'fail', descriptions.approves_utility_bill_failed(`${req.admin.first_name} ${req.admin.last_name}`));
    error.label = enums.VERIFY_USER_UTILITY_BILL_CONTROLLER;
    logger.error(`verifying user utility bill details failed:::${enums.VERIFY_USER_UTILITY_BILL_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch cluster details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user kyc details.
 * @memberof AdminUserController
 */
export const userClusters = async(req, res, next) => {
  try {
    const { admin, params } = req;
    const userClusterDetails = await processAnyData(userQueries.fetchUserClusterDetails, [ params.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
     cluster details fetched from the DB fetchCluster.admin.controllers.user.js`);
    return ApiResponse.success(res, enums.ADMIN_FETCH_CLUSTER_DETAILS, enums.HTTP_OK, userClusterDetails);
  } catch (error) {
    error.label = enums.FETCH_ADMIN_CLUSTER_DETAILS_CONTROLLER;
    logger.error(`fetching cluster details failed:::${enums.FETCH_ADMIN_CLUSTER_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch cluster member details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns user kyc details.
 * @memberof AdminUserController
 */
export const fetchingUserClusterDetails = async(req, res, next) => {
  try {
    const { admin, cluster } = req;
    const [ clusterMembers, [ userCluster ] ] = await Promise.all([
      processAnyData(userQueries.fetchUserClusterMembers, [ cluster.cluster_id ]),
      processAnyData(userQueries.fetchClusterById, [  cluster.cluster_id ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
     cluster member details fetched from the DB fetchClusterDetails.admin.controllers.user.js`);
    return ApiResponse.success(res, enums.ADMIN_FETCH_MEMBER_CLUSTER_DETAILS, enums.HTTP_OK, { userCluster, clusterMembers });
  } catch (error) {
    error.label = enums.FETCH_ADMIN_CLUSTER_MEMBER_DETAILS_CONTROLLER;
    logger.error(`Admin fetching cluster member detail failed:::${enums.FETCH_ADMIN_CLUSTER_MEMBER_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};
