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
  AuthController.signup
);

router.post(
  '/resend-signup-otp',
  Model(Schema.resendPhoneNumberVerificationOTP, 'payload'),
  UserMiddleware.validateUnAuthenticatedUser('authenticate'),
  AuthController.resendSignupOtp
);

router.post(
  '/verify-phone-number',
  Model(Schema.verifyPhoneNumber, 'payload'),
  AuthMiddleware.verifyVerificationToken,
  UserMiddleware.validateUnAuthenticatedUser('authenticate'),
  AuthMiddleware.generateReferralCode,
  AuthController.verifyAccount
);

router.post(
  '/complete-profile',
  AuthMiddleware.validateAuthToken,
  Model(Schema.completeProfile, 'payload'),
  AuthMiddleware.isCompletedKyc('complete'),
  AuthMiddleware.isPasswordCreated('validate'),
  AuthMiddleware.checkIfEmailAlreadyExist,
  AuthController.completeProfile
);

router.post(
  '/login',
  Model(Schema.login, 'payload'),
  UserMiddleware.validateUnAuthenticatedUser('login'),
  AuthMiddleware.comparePassword,
  AuthController.login
);

router.post(
  '/forgot-password',
  Model(Schema.forgotPassword, 'payload'),
  UserMiddleware.validateUnAuthenticatedUser('verify'),
  AuthController.forgotPassword
);

router.post(
  '/verify-reset-token',
  Model(Schema.verifyOtp, 'payload'),
  AuthMiddleware.verifyVerificationToken,
  AuthController.generateResetToken('password')
);

router.post(
  '/reset-password',
  Model(Schema.password, 'payload'),
  AuthMiddleware.validateForgotPasswordAndPinToken,
  AuthController.resetPassword
);

router.patch(
  '/password',
  AuthMiddleware.validateAuthToken,
  Model(Schema.changePassword, 'payload'),
  AuthMiddleware.isPasswordCreated('confirm'),
  AuthMiddleware.validatePasswordOrPin('password'),
  AuthMiddleware.checkIfNewCredentialsSameAsOld('password'),
  AuthController.changePassword
);

router.post(
  '/pin',
  AuthMiddleware.validateAuthToken,
  Model(Schema.pin, 'payload'),
  AuthMiddleware.isPinCreated('validate'),
  AuthController.createPin
);

router.patch(
  '/pin',
  AuthMiddleware.validateAuthToken,
  Model(Schema.changePin, 'payload'),
  AuthMiddleware.isPinCreated('confirm'),
  AuthMiddleware.validatePasswordOrPin('pin'),
  AuthMiddleware.checkIfNewCredentialsSameAsOld('pin'),
  AuthController.changePin
);

router.post(
  '/confirm-pin',
  AuthMiddleware.validateAuthToken,
  Model(Schema.pin, 'payload'),
  AuthMiddleware.comparePin,
  AuthController.confirmPin
);

router.post(
  '/confirm-password',
  AuthMiddleware.validateAuthToken,
  Model(Schema.password, 'payload'),
  AuthMiddleware.comparePassword,
  AuthController.confirmPassword
);

router.post(
  '/forgot-pin',
  AuthMiddleware.validateAuthToken,
  AuthController.forgotPin
);

router.post(
  '/verify-reset-pin-token',
  Model(Schema.verifyOtp, 'payload'),
  AuthMiddleware.verifyVerificationToken,
  AuthController.generateResetToken('pin')
);

router.patch(
  '/reset-pin',
  Model(Schema.pin, 'payload'),
  AuthMiddleware.validateForgotPasswordAndPinToken,
  AuthController.resetPin
);

export default router;
