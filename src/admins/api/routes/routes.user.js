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

router.post(
  '/:user_id/upload-document',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'update'),
  Model(Schema.userIdParams, 'params'),
  Model(Schema.fileTitle, 'payload'),
  UserMiddleware.checkIfUserExists,
  UserMiddleware.uploadDocument,
  UserController.saveUserUploadedDocument
);

router.get(
  '/:user_id/uploaded-documents',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'read'),
  Model(Schema.userIdParams, 'params'),
  UserMiddleware.checkIfUserExists,
  UserController.fetchAdminUploadedUserDocuments
);

router.get(
  '/:user_id/orr-breakdown',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'read'),
  Model(Schema.userIdParams, 'params'),
  UserMiddleware.checkIfUserExists,
  UserController.fetchUserOrrBreakdown
);

router.get(
  '/:user_id/kyc',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'read'),
  Model(Schema.userIdParams, 'params'),
  UserMiddleware.checkIfUserExists,
  UserController.fetchUserKycDetails
);

router.patch(
  '/:user_id/verify-utility-bill',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'update'),
  Model(Schema.userIdParams, 'params'),
  Model(Schema.approveDeclineUtilityBill, 'payload'),
  UserMiddleware.checkIfUserExists,
  UserController.verifyUserUtilityBill
);

router.get(
  '/:user_id/clusters',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.userIdParams, 'params'),
  UserMiddleware.checkIfUserExists,
  UserController.userClusters
);

router.get(
  '/:user_id/:cluster_id/cluster-details', 
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.clusterDetailsParams, 'params'),
  UserMiddleware.checkIfUserExists,
  UserMiddleware.adminCheckIfClusterExists,
  UserMiddleware.checkIfUserBelongsToCluster,
  UserController.fetchingUserClusterDetails
);

export default router;
