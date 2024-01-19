import { Router } from 'express';
import Schema from '../../lib/schemas/lib.schema.merchant';
import Model from '../../../users/api/middlewares/middlewares.model';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as RolesMiddleware from '../middlewares/middlewares.roles';
import * as MerchantMiddleware from '../middlewares/middlewares.merchant';
import * as MerchantController from '../controllers/controller.merchant';

const router = Router();

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

// ============== GET =================== //
router.get(
  '/',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.fetchMerchants, 'query'),
  RolesMiddleware.adminAccess('merchants', 'read'),
  MerchantController.fetchMerchants
);

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
  '/:merchant_id',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('merchants', 'read'),
  MerchantMiddleware.checkIfMerchantExists,
  MerchantController.fetchSingleMerchant
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
