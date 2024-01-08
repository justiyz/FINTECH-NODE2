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
  MerchantMiddleware.checkForDuplicateMerchant,
  MerchantMiddleware.validateCreateMerchantSecretKey,
  MerchantMiddleware.validateMerchantBankAccount('create'),
  MerchantController.createMerchant
);

router.post(
  '/generate-key',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.generateMerchantKey, 'payload'),
  RolesMiddleware.adminAccess('merchants', 'create'),
  MerchantController.generateMerchantKey
);

// ============== GET =================== //
router.get(
  '',
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
  Model(Schema.fetchUserCreditscoreBreakdown, 'query'),
  MerchantMiddleware.checkIfMerchantUserExists,
  MerchantController.fetchUserCreditScoreBreakdown
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

export default router;
