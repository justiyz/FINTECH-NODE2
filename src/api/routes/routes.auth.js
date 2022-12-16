import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as AuthController from '../controllers/controllers.auth';

const router = Router();

router.post(
  '/signup',
  Model(Schema.signup, 'payload'),
  UserMiddleware.validateUnAuthenticatedUser('validate'),
  AuthMiddleware.checkIfReferralCodeExists,
  AuthMiddleware.generateVerificationToken,
  AuthController.signup,
  AuthController.processReferral
);

router.post(
  '/resend-signup-otp',
  Model(Schema.resendPhoneNumberVerificationOTP, 'payload'),
  UserMiddleware.validateUnAuthenticatedUser('authenticate'),
  AuthMiddleware.generateVerificationToken,
  AuthController.resendSignupOtp
);

router.post(
  '/verify-phone-number',
  Model(Schema.verifyPhoneNumber, 'payload'),
  AuthMiddleware.verifyVerificationToken,
  UserMiddleware.validateUnAuthenticatedUser('authenticate'),
  AuthMiddleware.generateReferralCode,
  AuthMiddleware.generateTokens,
  AuthController.verifyAccount
);

router.post(
  '/complete-profile',
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateAuthToken,
  Model(Schema.completeProfile, 'payload'),
  AuthMiddleware.isCompletedKyc,
  AuthMiddleware.isPasswordCreated,
  AuthMiddleware.checkIfEmailAlreadyExist,
  AuthController.completeProfile
);

router.post(
  '/login',
  Model(Schema.login, 'payload'),
  UserMiddleware.validateUnAuthenticatedUser('login'),
  AuthMiddleware.comparePassword,
  AuthMiddleware.generateTokens,
  AuthController.login
);

export default router;
