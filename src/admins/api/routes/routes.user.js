import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.user';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as AdminMiddleware from '../middlewares/middlewares.admin';
import * as RoleMiddleware from '../middlewares/middlewares.roles';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as UserController from '../controllers/controllers.user';
import {decryptUserBVN, saveAdminUploadedDocument} from '../controllers/controllers.user';
import { uploadAdminDocument } from '../middlewares/middlewares.user';

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

router.post(
  '/upload-admin-document',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.fileTitle, 'payload'),
  UserMiddleware.uploadAdminDocument,
  UserController.saveAdminUploadedDocument
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
  '/:user_id/approve-utility-bill',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'approve'),
  AdminMiddleware.checkAdminType,
  Model(Schema.userIdParams, 'params'),
  Model(Schema.approveUtilityBill, 'payload'),
  UserMiddleware.checkIfUserExists,
  UserController.verifyUserUtilityBill
);

router.patch(
  '/:user_id/decline-utility-bill',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'reject'),
  AdminMiddleware.checkAdminType,
  Model(Schema.userIdParams, 'params'),
  Model(Schema.declineUtilityBill, 'payload'),
  UserMiddleware.checkIfUserExists,
  UserController.verifyUserUtilityBill
);

router.get(
  '/:user_id/clusters',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'read'),
  Model(Schema.userIdParams, 'params'),
  UserMiddleware.checkIfUserExists,
  UserController.userClusters
);

router.get(
  '/:user_id/:cluster_id/cluster-details',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'read'),
  Model(Schema.clusterDetailsParams, 'params'),
  UserMiddleware.checkIfUserExists,
  UserMiddleware.adminCheckIfClusterExists,
  UserMiddleware.checkIfUserBelongsToCluster,
  UserController.fetchingUserClusterDetails
);

router.get(
  '/:user_id/rewards',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'read'),
  Model(Schema.userIdParams, 'params'),
  Model(Schema.fetchUserRewards, 'query'),
  UserMiddleware.checkIfUserExists,
  UserController.fetchUserRewards
);


router.put(
  '/:user_id/details',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'update'),
  Model(Schema.userIdParams, 'params'),
  Model(Schema.updateUsersProfile, 'payload'),
  UserMiddleware.checkIfUserExists,
  UserController.updateUserProfile
);

router.put(
  '/:user_id/employment',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'update'),
  Model(Schema.userIdParams, 'params'),
  Model(Schema.updateEmploymentDetails, 'payload'),
  UserMiddleware.checkIfUserExists,
  UserController.updateEmploymentDetails
);

router.put(
  '/:user_id/resident',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'update'),
  Model(Schema.userIdParams, 'params'),
  Model(Schema.updateUserResidentialAddress, 'payload'),
  UserMiddleware.checkIfUserExists,
  UserController.updateResidentialAddress
);

router.put(
  '/:user_id/next-of-kin',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('users', 'update'),
  Model(Schema.userIdParams, 'params'),
  Model(Schema.updateNextOfKin, 'payload'),
  UserMiddleware.checkIfUserExists,
  UserController.updateNextOfKin
);

router.put(
  '/:user_id/expire-bank-statement',
  AuthMiddleware.validateAdminAuthToken,
  Model(Schema.userIdParams, 'params'),
  UserMiddleware.checkIfUserExists,
  UserController.expireBankStatement
);

export default router;
