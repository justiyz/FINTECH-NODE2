import { Router } from 'express';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import Model from '../../../users/api/middlewares/middlewares.model';
import * as Schema from '../../../admins/lib/schemas/lib.schema.settings';
import * as RolesMiddleware from '../middlewares/middlewares.roles';
import * as AdminController from '../controllers/controllers.settings';

const router = Router();
router.get(
  '/env-settings',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('settings', 'read'),
  AdminController.fetchEnvValues
);

router.put(
  '/env-settings',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('settings', 'update'),
  Model(Schema.updateEnvValues, 'payload'),
  AdminController.updateEnvValues
);



export default router;
