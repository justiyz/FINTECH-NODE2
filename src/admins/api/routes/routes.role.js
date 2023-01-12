import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.role';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as RoleMiddleware from '../middlewares/middlewares.roles';
import * as RolesController from '../controllers/controllers.roles';

const router = Router();

router.post(
  '/',
  AuthMiddleware.getAdminAuthToken,
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.createRole, 'payload'),
  RoleMiddleware.adminAccess('role management', 'create'),
  RoleMiddleware.checkRoleNameIsUnique,
  RoleMiddleware.checkAdminResources,
  RolesController.createRole
);

router.get(
  '/admin-resources',
  AuthMiddleware.getAdminAuthToken,
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('role management', 'read'),
  RolesController.adminPermissionResources
);

router.get(
  '/regular-admins',
  AuthMiddleware.getAdminAuthToken,
  AuthMiddleware.validateAdminAuthToken,
  RolesController.nonSuperAdminRoles
);

router.delete(
  '/:role_code',
  AuthMiddleware.getAdminAuthToken,
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('role management', 'delete'),
  Model(Schema.deleteRole, 'param'),
  RoleMiddleware.checkIfRoleExists,
  RoleMiddleware.checkIfRoleHasBeenAssigned,
  RolesController.deleteRole
);

export default router;
