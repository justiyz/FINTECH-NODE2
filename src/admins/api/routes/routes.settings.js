import { Router } from 'express';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as AdminMiddleware from '../middlewares/middlewares.admin';
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



export default router;
