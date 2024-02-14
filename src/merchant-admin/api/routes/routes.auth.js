import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.auth';
import * as AdminMiddleware from '../middlewares/middlewares.admin';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as AuthController from '../controllers/controllers.auth';


const router = Router();

router.post(
  '/update-password',
  Model(Schema.resetPassword, 'payload'),
  AuthController.setNewMerchantAdminPassword
);











// ==============  =================== //

router.post(
  '/login',
  Model(Schema.login, 'payload'),
  AdminMiddleware.validateUnAuthenticatedAdmin('login'),
  AuthMiddleware.compareAdminPassword,
  AuthMiddleware.checkOtpVerificationRequestCount,
  AuthController.completeAdminLoginRequest
);

router.post(
  '/verify-login',
  Model(Schema.verifyLogin, 'payload'),
  AuthMiddleware.verifyLoginVerificationToken,
  AdminMiddleware.validateUnAuthenticatedAdmin('login'),
  AuthMiddleware.adminPermissions,
  AuthController.login
);

router.post(
  '/set-first-password',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.setPassword, 'payload'),
  AuthMiddleware.checkIfChangedDefaultPassword('validate'),
  AuthController.setPassword('first')
);

router.post(
  '/forgot-password',
  Model(Schema.forgotPassword, 'payload'),
  AdminMiddleware.validateUnAuthenticatedAdmin('verify'),
  AuthMiddleware.checkIfChangedDefaultPassword('verify'),
  AuthMiddleware.checkOtpVerificationRequestCount,
  AuthController.forgotPassword
);

router.post(
  '/verify-password-token',
  Model(Schema.verifyLogin, 'payload'),
  AuthMiddleware.verifyLoginVerificationToken,
  AuthController.sendAdminPasswordToken
);

router.post(
  '/reset-password',
  AuthMiddleware.validateAdminResetPasswordToken,
  Model(Schema.setPassword, 'payload'),
  AuthMiddleware.checkIfResetCredentialsSameAsOld,
  AuthController.setPassword('reset')
);

export default router;
