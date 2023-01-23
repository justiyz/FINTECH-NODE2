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
  AuthMiddleware.generateVerificationToken('otp'),
  AuthController.signup,
  AuthController.processReferral
);

router.post(
  '/resend-signup-otp',
  Model(Schema.resendPhoneNumberVerificationOTP, 'payload'),
  UserMiddleware.validateUnAuthenticatedUser('authenticate'),
  AuthMiddleware.generateVerificationToken('otp'),
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
  AuthMiddleware.isCompletedKyc('complete'),
  AuthMiddleware.isPasswordCreated(),
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

router.post(
  '/forgot-password',
  Model(Schema.forgotPassword, 'payload'),
  UserMiddleware.validateUnAuthenticatedUser('verify'),
  AuthMiddleware.generateVerificationToken('otp'),
  AuthController.forgotPassword
);

router.post(
  '/verify-reset-token',
  Model(Schema.verifyOtp, 'payload'),
  AuthMiddleware.verifyVerificationToken,
  AuthMiddleware.generateResetPasswordToken,
  AuthController.resetPasswordToken
);

router.post(
  '/reset-password',
  Model(Schema.password, 'payload'),
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateForgotPasswordToken,
  AuthController.resetPassword
);

router.patch(
  '/password',
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateAuthToken,
  Model(Schema.changePassword, 'payload'),
  AuthMiddleware.isPasswordCreated('confirm'),
  AuthMiddleware.validatePasswordOrPin(),
  AuthMiddleware.checkIfCredentialsIsValid(),
  AuthController.changePassword
);

router.post(
  '/pin',
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateAuthToken,
  Model(Schema.pin, 'payload'),
  AuthMiddleware.isPinCreated(),
  AuthController.createPin
);

router.patch(
  '/pin',
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateAuthToken,
  Model(Schema.changePin, 'payload'),
  AuthMiddleware.isPinCreated('confirm'),
  AuthMiddleware.validatePasswordOrPin('pin'),
  AuthMiddleware.checkIfCredentialsIsValid('pin'),
  AuthController.changePin
);

router.post(
  '/confirm-pin',
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateAuthToken,
  Model(Schema.pin, 'payload'),
  AuthMiddleware.comparePin,
  AuthController.confirmPin
);

router.post(
  '/confirm-password',
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateAuthToken,
  Model(Schema.password, 'payload'),
  AuthMiddleware.comparePassword,
  AuthController.confirmPassword
);

export default router;
