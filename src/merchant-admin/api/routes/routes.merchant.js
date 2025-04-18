import { Router } from 'express';
import Schema from '../../lib/schemas/lib.schema.merchant';
import Model from '../../../users/api/middlewares/middlewares.model';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as RolesMiddleware from '../middlewares/middlewares.roles';
import * as MerchantMiddleware from '../middlewares/middlewares.merchant';
import * as MerchantController from '../controllers/controller.merchant';
import * as AuthController from '../controllers/controllers.auth';
import * as AdminMiddleware from '../middlewares/middlewares.admin';
import {compareMerchantPassword, verifyMerchantLoginVerificationToken} from '../middlewares/middlewares.merchant';
import * as UserController from "../controllers/controllers.user";
import {verifyBvnInfo} from "../controllers/controller.merchant";
const router = Router();


router.post(
  '/verify-bvn-otp-beta',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.verifyBVNInformation, 'payload'),
  MerchantController.verifyBvnInfo
);

router.get(
  '/',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('merchants', 'read'),
  MerchantMiddleware.checkIfMerchantExists,
  MerchantController.fetchSingleMerchant
);

router.get(
  '/users',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('customers', 'read'),
  Model(Schema.fetchMerchantUsers, 'query'),
  MerchantMiddleware.checkIfMerchantExists,
  MerchantController.fetchMerchantUsers
);

router.get(
  '/loans',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('loans', 'read'),
  Model(Schema.fetchMerchantLoans, 'query'),
  MerchantMiddleware.checkIfMerchantExists,
  MerchantController.fetchMerchantLoans
);

router.get(
  '/loans/:loan_id/repayment-schedule',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('loans', 'read'),
  Model(Schema.filterByUserId, 'query'),
  Model(Schema.fetchRepaymentSchedule, 'params'),
  MerchantMiddleware.checkIfMerchantUserExists,
  MerchantController.fetchUserRepaymentSchedule
);



// ========================================================

// ============== POST =================== //
router.post(
  '/',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.createMerchant, 'payload'),
  RolesMiddleware.adminAccess('merchants', 'create'),
  MerchantMiddleware.validateCreateMerchant,
  MerchantMiddleware.validateMerchantBankAccount('create'),
  MerchantController.createMerchant
);

router.post(
  '/onboard-merchant-admin',
  // AdminMiddleware.validateUnAuthenticatedAdmin,
  Model(Schema.createMerchantAdmin, 'payload'),
  MerchantController.onboardMerchant
);

router.post(
  '/:merchant_id/merchant-admin',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.createMerchantAdminParams, 'params'),
  Model(Schema.createMerchantAdmin, 'payload'),
  MerchantMiddleware.checkIfMerchantExists,
  MerchantMiddleware.checkIfMerchantAdminExists,
  MerchantController.createMerchantAdmin
);

router.post(
  '/:merchant_id/merchant-login',
  Model(Schema.merchantAdminCredentials, 'payload'),
  MerchantMiddleware.validateUnAuthenticatedMerchant('login'),
  MerchantMiddleware.compareMerchantPassword,
  AuthController.completeMerchantLoginRequest,
  MerchantController.merchantAdminLogin
);

router.post(
  'verify-merchant-login',
  Model(Schema.verifyLogin, 'payload'),
  MerchantMiddleware.verifyMerchantLoginVerificationToken
);

router.post(
  '/verify-password-token',
  Model(Schema.verifyLogin, 'payload'),
  MerchantMiddleware.verifyMerchantLoginVerificationToken,
  AuthController.sendAdminPasswordToken
);

router.post(
  '/set-first-password',
  // AuthMiddleware.validateAdminAuthToken,
  Model(Schema.setPassword, 'payload'),
  AuthMiddleware.checkIfChangedDefaultPassword('validate'),
  AuthController.setPassword('first')
);

router.post(
  '/:merchant_id/update_password',
  Model(Schema.merchantPassword, 'payload'),
  MerchantController.setNewMerchantPassword
);

router.post(
  '/:merchant_id/merchant-reset-password',
  Model(Schema.merchantPassword, 'payload'),
  MerchantController.setPassword
);

router.post(
  '/:merchant_admin_id/password/update',
  Model(Schema.merchantAdminPassword, 'payload'),
  MerchantController.setNewMerchantAdminPassword
);

router.post(
  '/merchant/forgot-password',
  Model(Schema.forgotPassword, 'payload'),
  MerchantMiddleware.validateUnAuthenticatedMerchantV2('verify'),
  MerchantController.forgotMerchantPassword
);

// ============== GET =================== //
// router.get(
//   '/',
//   AuthMiddleware.validateAdminAuthToken,
//   Model(Schema.fetchMerchants, 'query'),
//   RolesMiddleware.adminAccess('merchants', 'read'),
//   MerchantController.fetchMerchants
// );

router.get(
  '/list-banks',
  AuthMiddleware.validateAdminAuthToken,
  MerchantController.fetchAvailableBankList
);

router.get(
  '/resolve-account-number',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.resolveAccountNumber, 'query'),
  MerchantController.resolveBankAccountNumber
);



router.get(
  '/:merchant_id/users',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('merchants', 'read'),
  Model(Schema.fetchMerchantUsers, 'query'),
  MerchantMiddleware.checkIfMerchantExists,
  MerchantController.fetchMerchantUsers
);

router.get(
  '/:merchant_id/user/creditscore-breakdown',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('merchants', 'read'),
  Model(Schema.filterByUserId, 'query'),
  MerchantMiddleware.checkIfMerchantUserExists,
  MerchantController.fetchUserCreditScoreBreakdown
);

router.get(
  '/:merchant_id/user/repayment-schedule',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('merchants', 'read'),
  Model(Schema.filterByUserId, 'query'),
  MerchantMiddleware.checkIfMerchantUserExists,
  MerchantController.fetchUserRepaymentSchedule
);

router.get(
  '/:merchant_id/loans',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('merchants', 'read'),
  Model(Schema.fetchMerchantLoans, 'query'),
  MerchantMiddleware.checkIfMerchantExists,
  MerchantController.fetchMerchantLoans
);

// ============== PATCH =================== //
router.patch(
  '/:merchant_id',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.updateMerchant, 'payload'),
  RolesMiddleware.adminAccess('merchants', 'update'),
  MerchantMiddleware.checkIfMerchantExists,
  MerchantMiddleware.validateMerchantBankAccount('update'),
  MerchantController.updateMerchant
);

router.patch(
  '/:merchant_id/user',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.updateMerchantUser, 'payload'),
  RolesMiddleware.adminAccess('merchants', 'update'),
  MerchantMiddleware.checkIfMerchantExists,
  MerchantMiddleware.checkIfMerchantUserExists,
  MerchantController.updateMerchantUser
);

export default router;
