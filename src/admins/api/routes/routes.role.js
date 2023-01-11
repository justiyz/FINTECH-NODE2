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
  RoleMiddleware.adminAccess('role management', 'read'),
  RolesController.nonSuperAdminRoles
);

export default router;
