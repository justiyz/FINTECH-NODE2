import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.admin';
import RoleSchema from '../../lib/schemas/lib.schema.role';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as AdminMiddleware from '../middlewares/middlewares.admin';
import * as RolesMiddleware from '../middlewares/middlewares.roles';
import * as AdminController from '../controllers/controllers.admin';

const router = Router();

router.post(
  '/complete-profile',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.adminCompleteProfile, 'payload'),
  AdminMiddleware.validateUnAuthenticatedAdmin('validate'),
  AuthMiddleware.checkIfChangedDefaultPassword('verify'),
  AdminController.completeAdminProfile
);

router.get(
  '/:admin_id/permissions',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.adminIdParams, 'params'),
  RolesMiddleware.adminAccess('administrators', 'read'),
  AdminMiddleware.checkIfAdminExists,
  AdminMiddleware.checkIfSuperAdmin,
  AdminController.adminPermissions
);

router.put(
  '/:admin_id/permissions',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.editAdminPermissions, 'payload'),
  RolesMiddleware.adminAccess('administrators', 'update'),
  AdminMiddleware.checkIfAdminExists,
  AdminMiddleware.checkIfSuperAdmin,
  AdminMiddleware.checkIfAuthenticatedAdmin,
  RolesMiddleware.validateRoleCode,
  RolesMiddleware.checkIfSuperAdminRole,
  RolesMiddleware.checkAdminResources,
  AdminController.editAdminPermissions
);

router.post(
  '/invite-admin',
  AuthMiddleware.validateAdminAuthToken,
  Model(RoleSchema.inviteAdmin, 'payload'),
  RolesMiddleware.adminAccess('administrators', 'create'),
  AdminMiddleware.checkIfAdminEmailAlreadyExist,
  RolesMiddleware.validateRoleCode,
  RolesMiddleware.checkIfSuperAdminRole,
  RolesMiddleware.IsRoleActive,
  AdminController.inviteAdmin
);

router.get(
  '/',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('administrators', 'read'),
  Model(RoleSchema.fetchAdmins, 'query'),
  AdminController.fetchAllAdmins
);

router.patch(
  '/:admin_id',
  AuthMiddleware.validateAdminAuthToken,
  Model(RoleSchema.editAdminStatus, 'payload'),
  RolesMiddleware.adminAccess('administrators', 'update'),
  AdminMiddleware.checkIfAdminExists,
  AdminMiddleware.checkAdminCurrentStatus,
  AdminController.editAdminStatus
);

router.get(
  '/profile',
  AuthMiddleware.validateAdminAuthToken,
  AdminController.getProfile
);

router.get(
  '/overview',
  AuthMiddleware.validateAdminAuthToken,
  Model(RoleSchema.overviewPage, 'query'),
  AdminController.fetchPlatformOverview
);

export default router;
