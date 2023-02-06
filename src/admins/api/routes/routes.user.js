import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.user';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as RoleMiddleware from '../middlewares/middlewares.roles';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as UserController from '../controllers/controllers.user';

const router = Router();

router.patch(
  '/:user_id',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'update'),
  Model(Schema.userIdParams, 'params'),
  Model(Schema.editStatus, 'payload'),
  UserMiddleware.checkIfUserExists,
  UserMiddleware.checkUserCurrentStatus,
  UserMiddleware.userLoanStatus,
  UserController.editUserStatus
);

router.get(
  '/:user_id/profile',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'read'),
  Model(Schema.userIdParams, 'params'),
  UserMiddleware.checkIfUserExists,
  UserController.userProfileDetails
);

router.get(
  '/:user_id/account-information',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'read'),
  Model(Schema.userIdParams, 'params'),
  UserMiddleware.checkIfUserExists,
  UserController.userAccountInformation
);

router.post(
  '/:user_id/notification',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'create'),
  Model(Schema.userIdParams, 'params'),
  Model(Schema.notificationTypeQuery, 'query'),
  UserMiddleware.checkIfUserExists,
  UserController.sendNotifications
);

router.get(
  '/all',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'read'),
  Model(Schema.fetchUsers, 'query'),
  UserController.fetchUsers
);

router.get(
  '/:user_id/kyc',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'read'),
  Model(Schema.userIdParams, 'params'),
  UserMiddleware.checkIfUserExists,
  UserController.fetchUserKycDetails
);

export default router;
