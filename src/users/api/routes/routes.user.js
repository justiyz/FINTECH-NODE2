import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.user';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as UserController from '../controllers/controllers.user';

const router = Router();

router.patch(
  '/fcm-token',
  AuthMiddleware.validateAuthToken,
  Model(Schema.updateFcmToken, 'payload'),
  UserController.updateFcmToken
);

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
  UserMiddleware.isVerifiedBvn('complete'),
  UserMiddleware.isBvnPreviouslyExisting,
  UserMiddleware.verifyBvn,
  UserController.updateBvn
);


router.post(
  '/request-email-verification',
  AuthMiddleware.validateAuthToken,
  Model(Schema.verifyEmail, 'payload'),
  UserMiddleware.validateUnAuthenticatedUser('verify'),
  UserMiddleware.isEmailVerified('validate'),
  UserController.requestEmailVerification
);
  
router.get(
  '/verify-email',
  Model(Schema.verifyOtp, 'query'),
  UserMiddleware.verifyEmailVerificationToken,
  UserMiddleware.validateUnAuthenticatedUser('verify'),
  UserController.verifyEmail
);

router.get(
  '/settings/list-banks',
  AuthMiddleware.validateAuthToken,
  UserController.fetchAvailableBankLists
);

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

router.get(
  '/settings/account-details',
  AuthMiddleware.validateAuthToken,
  UserController.fetchUserAccountDetails
);

router.delete(
  '/settings/:id/account-details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.idParams, 'params'),
  UserMiddleware.checkIfAccountDetailsExists,
  UserMiddleware.checkUserLoanStatus,
  UserController.deleteUserAccountDetails
);

router.patch(
  '/settings/:id/account-details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.idParams, 'params'),
  Model(Schema.accountChoiceType, 'query'),
  UserMiddleware.checkIfAccountDetailsExists,
  UserMiddleware.checkAccountCurrentChoicesAndTypeSent,
  UserController.updateAccountDetailsChoice
);

router.get(
  '/settings/debit-cards',
  AuthMiddleware.validateAuthToken,
  UserController.fetchUserDebitCards
);
    
router.post(
  '/id-verification',
  AuthMiddleware.validateAuthToken,
  Model(Schema.idVerification, 'payload'),
  AuthMiddleware.isCompletedKyc('confirm'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  UserMiddleware.isUploadedVerifiedId('complete'),
  UserController.idUploadVerification
);

router.put(
  '/profile',
  AuthMiddleware.validateAuthToken,
  Model(Schema.updateUsersProfile, 'payload'),
  UserMiddleware.checkIfBvnIsVerified,
  UserMiddleware.checkUserLoanStatus,
  UserController.updateUserProfile
);

router.get(
  '/profile',
  AuthMiddleware.validateAuthToken,
  UserController.getProfile
);

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
  UserMiddleware.checkIfCardOrUserExist,
  UserController.removeCard
);

router.get(
  '/homepage',
  AuthMiddleware.validateAuthToken,
  UserController.homepageDetails
);

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

router.get(
  '/next-of-kin',
  AuthMiddleware.validateAuthToken,
  UserController.fetchNextOfKin
);

export default router;
