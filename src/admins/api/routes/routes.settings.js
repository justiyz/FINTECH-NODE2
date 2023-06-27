import { Router } from 'express';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as AdminMiddleware from '../middlewares/middlewares.admin';
import * as AdminSettingsMiddleware from '../middlewares/middlewares.settings';
import Model from '../../../users/api/middlewares/middlewares.model';
import * as Schema from '../../../admins/lib/schemas/lib.schema.settings';
import * as RolesMiddleware from '../middlewares/middlewares.roles';
import * as  AdminSettingsController from '../controllers/controllers.settings';

const router = Router();
router.get(
  '/env-settings',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('settings', 'read'),
  AdminSettingsController.fetchEnvValues
);

router.put(
  '/env-settings',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.updateEnvValues, 'payload'),
  AdminMiddleware.checkAdminType,
  AdminSettingsController.updateEnvValues
);

router.get(
  '/loan-score-card',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('settings', 'read'),
  AdminSettingsController.scoreCardBreakdown
);

router.post(
  '/create-promo',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('settings', 'create'),
  Model(Schema.createPromo, 'payload'),
  AdminSettingsMiddleware.checkIfPromoAlreadyExists,
  AdminSettingsMiddleware.checkIfStartOrEndDateHasPassed,
  AdminSettingsMiddleware.uploadPromoBanner,
  AdminSettingsController.createSystemPromo
);

router.get(
  '/promos',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('settings', 'read'),
  AdminSettingsController.fetchAllSystemPromos
);

router.get(
  '/:promo_id/promo',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('settings', 'read'),
  Model(Schema.promoId, 'params'),
  AdminSettingsMiddleware.checkIfPromoExists,
  AdminSettingsController.fetchSinglePromo
);

router.put(
  '/:promo_id/promo',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('settings', 'update'),
  Model(Schema.promoId, 'params'),
  Model(Schema.editPromo, 'payload'),
  AdminSettingsMiddleware.checkIfAdminCreatedPromo,
  AdminSettingsMiddleware.checkIfPromoExists,
  AdminSettingsMiddleware.checkPromoStatus ,
  AdminSettingsMiddleware.checkIfPromoAlreadyExists,
  AdminSettingsMiddleware.checkIfStartOrEndDateHasPassed,
  AdminSettingsMiddleware.uploadPromoBanner,
  AdminSettingsController.editPromoDetails
);

router.patch(
  '/cancel-promo',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('settings', 'update'),
  Model(Schema.promoIds, 'payload'),
  AdminSettingsMiddleware.checkIfAdminCreatedPromo,
  AdminSettingsMiddleware.checkIfPromoExists,
  AdminSettingsController.cancelPromo
);
router.patch(
  '/delete-promo',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('settings', 'update'),
  Model(Schema.promoIds, 'payload'),
  AdminSettingsMiddleware.checkIfAdminCreatedPromo,
  AdminSettingsMiddleware.checkIfPromoExists,
  AdminSettingsMiddleware.checkIfPromoIsActive,
  AdminSettingsController.deletePromo
);



export default router;
