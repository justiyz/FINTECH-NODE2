import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.user';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as UserController from '../controllers/controllers.user';
const { SEEDFI_NODE_ENV } = config; 

import { availableVerificationMeans, fetchLocalBanks, fetchLocalSingleBanks, updateBankRecord } from '../controllers/controllers.user';
import config from '../../config';
import { checkIfBvnFlaggedBlacklistedCheckByLastName } from '../middlewares/middlewares.user';

const router = Router();

router.patch('/fcm-token', AuthMiddleware.validateAuthToken, Model(Schema.updateFcmToken, 'payload'), UserController.updateFcmToken);

router.get(
  '/refresh-token',
  AuthMiddleware.validateAuthToken,
  Model(Schema.updateRefreshToken, 'query'),
  UserMiddleware.validateRefreshToken,
  UserController.updateUserRefreshToken
);

router.post(
  '/upload-selfie',
  AuthMiddleware.validateAuthToken,
  Model(Schema.selfieUpload, 'payload'),
  AuthMiddleware.isCompletedKyc('confirm'),
  UserMiddleware.isUploadedImageSelfie('complete'),
  UserController.updateSelfieImage
);

router.post(
  '/verify-bvn',
  AuthMiddleware.validateAuthToken,
  Model(Schema.bvnVerification, 'payload'),
  AuthMiddleware.isCompletedKyc('confirm'),
  // UserMiddleware.isVerifiedBvn('complete'),
  // UserMiddleware.isBvnPreviouslyExisting,
  UserMiddleware.verifyBvn,
  UserMiddleware.checkIfBvnFlaggedBlacklistedCheckByLastName,
  UserController.updateBvn
);

router.post(
  '/request-email-verification',
  AuthMiddleware.validateAuthToken,
  Model(Schema.verifyEmail, 'payload'),
  UserMiddleware.validateUnAuthenticatedUser('verify'),
  UserMiddleware.isEmailVerified('validate'),
  AuthMiddleware.checkOtpVerificationRequestCount,
  UserController.requestEmailVerification
);

router.get(
  '/verify-email',
  Model(Schema.verifyOtp, 'query'),
  UserMiddleware.verifyEmailVerificationToken,
  UserMiddleware.validateUnAuthenticatedUser('verify'),
  UserController.verifyEmail
);

router.get('/settings/list-banks', AuthMiddleware.validateAuthToken, UserController.fetchAvailableBankLists);

router.post('/settings/bank/create', AuthMiddleware.validateAuthToken, UserController.createBankRecord);

router.get('/settings/list-db-banks', AuthMiddleware.validateAuthToken, UserController.fetchLocalBanks);

router.get('/settings/bank/:record_id', AuthMiddleware.validateAuthToken, UserController.fetchLocalSingleBanks);

router.patch('/settings/bank/:record_id/update', AuthMiddleware.validateAuthToken, UserController.updateBankRecord);

router.delete('/settings/bank/:record_id/delete', AuthMiddleware.validateAuthToken, UserController.deleteBankRecord);

router.post('/settings/bank/create', AuthMiddleware.validateAuthToken, UserController.createBankRecord);

router.get('/settings/list-db-banks', AuthMiddleware.validateAuthToken, UserController.fetchLocalBanks);

router.get('/settings/bank/:record_id', AuthMiddleware.validateAuthToken, UserController.fetchLocalSingleBanks);

router.patch('/settings/bank/:record_id/update', AuthMiddleware.validateAuthToken, UserController.updateBankRecord);

router.delete('/settings/bank/:record_id/delete', AuthMiddleware.validateAuthToken, UserController.deleteBankRecord);

router.get(
  '/settings/resolve-account-number',
  AuthMiddleware.validateAuthToken,
  Model(Schema.resolveAccountNumber, 'query'),
  UserMiddleware.resolveBankAccountNumberName,
  UserController.returnAccountDetails
);

router.post(
  '/settings/account-details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.saveAccountDetails, 'payload'),
  AuthMiddleware.isCompletedKyc('confirm'),
  UserMiddleware.checkAccountPreviouslySaved,
  UserMiddleware.checkIfMaximumBankAccountsSaved,
  UserMiddleware.resolveBankAccountNumberName,
  UserMiddleware.checkAccountOwnership,
  UserController.saveAccountDetails
);

router.get('/settings/account-details', AuthMiddleware.validateAuthToken, UserController.fetchUserAccountDetails);

router.delete(
  '/settings/:id/account-details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.idParams, 'params'),
  UserMiddleware.checkIfAccountDetailsExists,
  UserMiddleware.checkUserLoanStatus,
  UserMiddleware.checkIfUserOnAnyActiveLoan,
  UserController.deleteUserAccountDetails
);

router.patch(
  '/settings/:id/account-details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.idParams, 'params'),
  Model(Schema.accountChoiceType, 'query'),
  UserMiddleware.checkIfAccountDetailsExists,
  UserMiddleware.checkUserLoanStatus,
  UserMiddleware.checkAccountCurrentChoicesAndTypeSent,
  UserController.updateAccountDetailsChoice
);

router.get('/settings/debit-cards', AuthMiddleware.validateAuthToken, UserController.fetchUserDebitCards);

router.post(
  '/id-verification',
  AuthMiddleware.validateAuthToken,
  Model(Schema.idVerification, 'payload'),
  AuthMiddleware.isCompletedKyc('confirm'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  UserMiddleware.isUploadedVerifiedId('complete'),
  UserController.idUploadVerification
);

router.get('/active-verification-means', AuthMiddleware.validateAuthToken, UserController.availableVerificationMeans);

router.post(
  '/verify-document',
  AuthMiddleware.validateAuthToken,
  Model(Schema.idDocumentVerification, 'payload'),
  AuthMiddleware.isCompletedKyc('confirm'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  // UserMiddleware.isUploadedVerifiedId('complete'),
  UserController.documentVerification
);

router.post(
  '/address-verification',
  AuthMiddleware.validateAuthToken,
  Model(Schema.addressVerification, 'payload'),
  AuthMiddleware.isCompletedKyc('confirm'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  UserMiddleware.isUploadedVerifiedId('confirm'),
  UserMiddleware.isVerifiedAddressDetails('complete'),
  UserMiddleware.createUserAddressYouVerifyCandidate,
  UserController.initiateAddressVerification
);

router.post(
  '/upload-utility-bill',
  AuthMiddleware.validateAuthToken,
  AuthMiddleware.isCompletedKyc('confirm'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  UserMiddleware.isUploadedVerifiedId('confirm'),
  UserMiddleware.isVerifiedUtilityBill('complete'),
  UserMiddleware.uploadUtilityBillDocument,
  UserController.updateUploadedUtilityBill
);

router.post(
  '/address-verification-webhook',
  UserMiddleware.youVerifyWebhookVerification,
  UserMiddleware.verifyUserAndAddressResponse,
  UserController.updateUserAddressVerificationStatus
);

router.put(
  '/profile',
  AuthMiddleware.validateAuthToken,
  Model(Schema.updateUsersProfile, 'payload'),
  UserMiddleware.checkIfBvnIsVerified,
  UserMiddleware.checkUserLoanStatus,
  UserMiddleware.userProfileNextUpdate('profile'),
  UserController.updateUserProfile
);

router.get('/profile', AuthMiddleware.validateAuthToken, UserController.getProfile);

router.patch(
  '/settings/:id/default-debit-card',
  AuthMiddleware.validateAuthToken,
  Model(Schema.idParams, 'params'),
  UserMiddleware.checkUserLoanStatus,
  UserMiddleware.checkIfCardOrUserExist,
  UserMiddleware.checkIfCardAlreadyDefaultCard,
  UserController.setDefaultCard
);

router.delete(
  '/settings/:id/debit-card',
  AuthMiddleware.validateAuthToken,
  Model(Schema.idParams, 'params'),
  UserMiddleware.checkUserLoanStatus,
  UserMiddleware.checkIfUserOnAnyActiveLoan,
  UserMiddleware.checkIfCardOrUserExist,
  UserController.removeCard
);

router.get('/homepage', AuthMiddleware.validateAuthToken, UserController.homepageDetails);

router.patch(
  '/:notificationId/notification',
  AuthMiddleware.validateAuthToken,
  Model(Schema.notificationIdParams, 'params'),
  Model(Schema.updateNotificationIsRead, 'payload'),
  UserController.updateNotificationIsRead
);

router.post(
  '/next-of-kin',
  AuthMiddleware.validateAuthToken,
  Model(Schema.nextOfKin, 'payload'),
  UserMiddleware.checkIfUserHasPreviouslyCreatedNextOfKin,
  UserController.createNextOfKin
);

router.post('/employment-details', AuthMiddleware.validateAuthToken, Model(Schema.employmentDetails, 'payload'), UserController.createUserEmploymentDetails);

router.put(
  '/employment-details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.updateEmploymentDetails, 'payload'),
  UserMiddleware.userProfileNextUpdate('employment'),
  UserController.updateEmploymentDetails
);

router.patch('/mono-account-id', AuthMiddleware.validateAuthToken, Model(Schema.updateMonoId, 'payload'), UserController.updateMonoAccountId);

router.post('/initiate-mono-account-linking', AuthMiddleware.validateAuthToken, UserController.initiateMonoAccount);

router.get('/tiers', AuthMiddleware.validateAuthToken, Model(Schema.tierLoanValue, 'query'), UserController.fetchLoanTierValue);

router.get('/alert-notifications', AuthMiddleware.validateAuthToken, UserController.fetchAlertNotification);

router.get('/referral-details', AuthMiddleware.validateAuthToken, UserController.fetchUserReferralDetails);

router.get('/referral-history', AuthMiddleware.validateAuthToken, UserController.fetchUserReferralHistory);

router.post('/claim-referral-points', AuthMiddleware.validateAuthToken, UserController.userClaimsReferralPoints);

router.delete(
  '/account',
  AuthMiddleware.validateAuthToken,
  UserMiddleware.checkIfUserOnAnyActiveLoan,
  UserMiddleware.checkIfUserBelongsToAnyCluster,
  UserController.deleteUserAccount
);

router.get('/get-bvn-info', AuthMiddleware.validateInfoCall, UserController.decryptUserBVN);

router.post('/send-bvn-otp', Model(Schema.sendBvnOtp, 'payload'), UserController.sendBvnOtp);

router.post('/verify-bvn-otp', Model(Schema.verifyBvnOtp, 'payload'), UserController.verifyBvnOtp);

router.post('/verify-bvn-otp-beta', AuthMiddleware.validateInfoCall, Model(Schema.verifyBVNInformation, 'payload'), UserController.verifyBvnInfo);

router.post('/validate-user-bvn-otp', AuthMiddleware.validateAuthToken, Model(Schema.verifyBvnOtp, 'payload'), UserController.verifyBvnOtp);

router.post(
  '/dojah-upload-selfie',
  UserMiddleware.dojahWebhookVerification,
  Model(Schema.selfieUploadNew, 'payload'),
  AuthMiddleware.isCompletedKyc('confirm'),
  UserMiddleware.isUploadedImageSelfie('complete'),
  UserController.updateSelfieImage
);
 
router.get('/version', AuthMiddleware.validateAuthToken, UserController.getVersionNumber);

export default router;
