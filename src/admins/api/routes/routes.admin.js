import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.role';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as AdminMiddleware from '../middlewares/middlewares.admin';
import * as RolesMiddleware from '../middlewares/middlewares.roles';
import * as AdminController from '../controllers/controllers.admin';

const router = Router();

router.post(
  '/invite-admin',
  AuthMiddleware.getAdminAuthToken,
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.inviteAdmin, 'payload'),
  RolesMiddleware.adminAccess('administrators', 'create'),
  AdminMiddleware.checkIfAdminEmailAlreadyExist,
  RolesMiddleware.validateRoleCode,
  RolesMiddleware.IsRoleActive,
  AdminController.inviteAdmin
);

router.get(
  '/',
  AuthMiddleware.getAdminAuthToken,
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.fetchAdmins, 'query'),
  RolesMiddleware.adminAccess('administrators', 'view'),
  AdminController.fetchAllAdmins
);

router.patch(
  '/:admin_id',
  AuthMiddleware.getAdminAuthToken,
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.editAdminStatus, 'payload'),
  RolesMiddleware.adminAccess('administrators', 'update'),
  AdminMiddleware.checkIfAdminIdExist,
  AdminMiddleware.checkAdminCurrentStatus,
  AdminController.editAdminStatus
);

export default router;
