import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.admin';
import RoleSchema from '../../lib/schemas/lib.schema.role';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as AdminMiddleware from '../middlewares/middlewares.admin';
import * as RolesMiddleware from '../middlewares/middlewares.roles';
import * as AdminController from '../controllers/controllers.admin';
import * as NotificationController from '../controllers/controller.notification';

const router = Router();

router.post(
  '/complete-profile',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.adminCompleteProfile, 'payload'),
  AuthMiddleware.checkIfChangedDefaultPassword('verify'),
  AdminMiddleware.checkIfAdminPhoneNumberAlreadyExist,
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

router.get(
  '/activity-log',
  AuthMiddleware.validateAdminAuthToken,
  AdminMiddleware.checkAdminType,
  Model(RoleSchema.fetchActivityLog, 'query'),
  AdminController.fetchActivityLog
);

router.get(
  '/loan_repayment',
  AuthMiddleware.validateAdminAuthToken,
  Model(RoleSchema.overviewPage, 'query'),
  RolesMiddleware.adminAccess('report management', 'read'), 
  AdminController.loanRepaymentReport
);

router.get(
  '/loan-analytics',
  AuthMiddleware.validateAdminAuthToken,
  Model(RoleSchema.loanAndClusterAnalytics, 'query'),
  RolesMiddleware.adminAccess('report management', 'read'),
  AdminController.fetchLoanManagementAnalytics
);

router.get(
  '/cluster-analytics',
  AuthMiddleware.validateAdminAuthToken,
  Model(RoleSchema.loanAndClusterAnalytics, 'query'),
  RolesMiddleware.adminAccess('report management', 'read'),
  AdminController.fetchClusterManagementAnalytics
);

router.patch(
  '/:adminNotificationId/single-notification',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.adminNotificationIdParams, 'params'),
  NotificationController.updateSingleNotification
);

router.put(
  '/admin-notifications',
  AuthMiddleware.validateAdminAuthToken,
  NotificationController.updateAllNotificationsAsRead
);

router.post(
  '/send-notifications',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.sendNotification, 'payload'),
  NotificationController.sendNotifications
);

router.get(
  '/admin-notifications',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.fetchNotification, 'query'),
  NotificationController.fetchNotifications
);

router.delete(
  '/admin-notification/:adminNotificationId',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.adminNotificationIdParams, 'params'),
  AdminMiddleware.getNotificationById,
  NotificationController.deleteNotification
);

export default router;
