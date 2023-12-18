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
  MerchantMiddleware.validateCreateMerchantSecretKey,
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

// router.get(
//   '/:id',
//   AuthMiddleware.validateAdminAuthToken,
//   (req, res) => {
//     res.status(200).json({
//       message: 'Fetched merchant successfully'
//     })
//   }
// );

// ============== PATCH =================== //
router.patch(
  '/:merchant_id',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.updateMerchant, 'payload'),
  RolesMiddleware.adminAccess('merchants', 'update'),
  MerchantMiddleware.checkIfMerchantExists,
  MerchantController.updateMerchant
);

export default router;
