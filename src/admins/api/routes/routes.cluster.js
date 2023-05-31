import { Router } from 'express';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import Model from '../../../users/api/middlewares/middlewares.model';
import * as Schema from '../../../admins/lib/schemas/lib.schema.cluster';
import * as RolesMiddleware from '../middlewares/middlewares.roles';
import * as  AdminClusterController from '../controllers/controllers.cluster';
import * as AdminClusterMiddleware from '../../../admins/api/middlewares/middlewares.cluster';
import * as AdminUserMiddleware from '../../../admins/api/middlewares/middlewares.user';



const router = Router();

router.post(
  '/create',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster management', 'create'),
  Model(Schema.createCluster, 'payload'),
  AdminClusterMiddleware.checkIfClusterNameUnique,
  AdminClusterMiddleware.generateClusterUniqueCode,
  AdminClusterController.createCluster
);
  

router.get(
  '/clusters',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster management', 'read'),
  Model(Schema.fetchClusters, 'query'),
  AdminClusterController.fetchAndFilterClusters
);

router.get(
  '/:cluster_id/details',
  AuthMiddleware.validateAdminAuthToken,
  AdminClusterMiddleware.checkIfClusterExists,
  RolesMiddleware.adminAccess('cluster management', 'read'),
  Model(Schema.clusterId, 'params'),
  AdminClusterController.fetchSingleClusterDetails
);

router.post(
  '/:cluster_id/invite',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster management', 'update'),
  AdminClusterMiddleware.checkIfClusterExists,
  Model(Schema.inviteCluster, 'payload'),
  AdminClusterMiddleware.checkClusterMemberExist('confirm'),
  AdminClusterController.clusterMemberInvite
);

router.patch(
  '/:cluster_id/status',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster management', 'update'),
  AdminClusterMiddleware.checkIfClusterExists,
  Model(Schema.editClusterStatus, 'payload'),
  AdminClusterMiddleware.checkClusterCurrentStatus,
  AdminClusterMiddleware.checkClusterLoanStatus,
  AdminClusterController.activateAndDeactivateCluster
);

router.delete(
  '/:cluster_id/member/:user_id',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster management', 'delete'),
  AdminClusterMiddleware.checkIfClusterExists,
  AdminUserMiddleware.checkIfUserExists,
  AdminClusterMiddleware.checkClusterMemberExist('validate'),
  AdminClusterMiddleware.checkUserClusterLoanStatus,
  AdminClusterController.deleteClusterMember
);

router.post(
  '/:cluster_id/bulk-invite',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster management', 'delete'),
  Model(Schema.inviteClusterBulk, 'payload'),
  AdminClusterMiddleware.checkIfClusterExists,
  AdminClusterMiddleware.clusterMemberBulkInvite,
  AdminClusterController.clusterMemberBulkInvite
);

export default router;
