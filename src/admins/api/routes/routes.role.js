import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.role';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as RoleMiddleware from '../middlewares/middlewares.roles';
import * as RolesController from '../controllers/controllers.roles';

const router = Router();

router.post(
  '/',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.createRole, 'payload'),
  RoleMiddleware.adminAccess('role management', 'create'),
  RoleMiddleware.checkRoleNameIsUnique,
  RoleMiddleware.checkAdminResources,
  RolesController.createRole
);

router.get(
  '/admin-resources',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('role management', 'read'),
  RolesController.adminPermissionResources
);

router.get(
  '/regular-admins',
  AuthMiddleware.validateAdminAuthToken,
  RolesController.nonSuperAdminRoles
);

router.get(
  '/:role_code/permissions',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.roleCodeParams, 'params'),
  RoleMiddleware.adminAccess('role management', 'read'),
  RoleMiddleware.validateRoleCode,
  RoleMiddleware.checkIfSuperAdminRole,
  RolesController.rolePermissions
);

router.put(
  '/:role_code',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.editRole, 'payload'),
  RoleMiddleware.adminAccess('role management', 'update'),
  RoleMiddleware.validateRoleCode,
  RoleMiddleware.checkIfSuperAdminRole,
  RoleMiddleware.checkAdminResources,
  RolesController.editRoleWithPermissions
);

router.patch(
  '/:role_code/status',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.activateDeactivateRole, 'query'),
  Model(Schema.roleCodeParams, 'params'),
  RoleMiddleware.adminAccess('role management', 'update'),
  RoleMiddleware.validateRoleCode,
  RoleMiddleware.checkIfSuperAdminRole,
  RoleMiddleware.checkRoleCurrentStatus,
  RolesController.activateDeactivateRole
);

router.delete(
  '/:role_code',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('role management', 'delete'),
  Model(Schema.roleCodeParams, 'params'),
  RoleMiddleware.validateRoleCode,
  RoleMiddleware.checkIfRoleHasBeenAssigned,
  RolesController.deleteRole
);

router.get(
  '/fetch-roles',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('role management', 'read'),
  Model(Schema.fetchRoles, 'query'),
  RolesController.fetchRoles
);

router.get(
  '/:role_type/admins',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('role management', 'read'),
  Model(Schema.fetchAdminsPerRole, 'query'),
  RolesController.fetchAdminsPerRole
);

export default router;
