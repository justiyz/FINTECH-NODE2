import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.user';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as UserController from '../controllers/controllers.user';

const router = Router();

router.patch(
  '/fcm-token',
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateAuthToken,
  Model(Schema.updateFcmToken, 'payload'),
  UserController.updateFcmToken
);

router.get(
  '/refresh-token',
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateAuthToken,
  Model(Schema.updateRefreshToken, 'query'),
  UserMiddleware.validateRefreshToken,
  AuthMiddleware.generateTokens,
  UserController.updateUserRefreshToken
);

router.post(
  '/verify-bvn',
  AuthMiddleware.getAuthToken,
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
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateAuthToken,
  Model(Schema.verifyEmail, 'payload'),
  UserMiddleware.validateUnAuthenticatedUser('verify'),
  UserMiddleware.isEmailVerified('validate'),
  AuthMiddleware.generateVerificationToken,
  UserController.requestEmailVerification
);

router.post(
  '/verify-email',
  Model(Schema.verifyOtp, 'payload'),
  AuthMiddleware.verifyVerificationToken,
  UserMiddleware.validateUnAuthenticatedUser('verify'),
  UserController.verifyEmail
);

export default router;
