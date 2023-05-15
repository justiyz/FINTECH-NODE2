import { Router } from 'express';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import Model from '../../../users/api/middlewares/middlewares.model';
import * as Schema from '../../../admins/lib/schemas/lib.schema.cluster';
import * as RolesMiddleware from '../middlewares/middlewares.roles';
import * as  AdminClusterController from '../controllers/controllers.cluster';
import * as AdminClusterMiddleware from '../../../admins/api/middlewares/middlewares.cluster';



const router = Router();

router.post(
  '/create',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster', 'create'),
  Model(Schema.createCluster, 'payload'),
  AdminClusterMiddleware.checkIfClusterNameUnique,
  AdminClusterMiddleware.generateClusterUniqueCode,
  AdminClusterController.createCluster
 
);
  

router.get(
  '/clusters',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster', 'read'),
  Model(Schema.fetchClusters, 'query'),
  AdminClusterController.fetchAndFilterClusters
);

router.get(
  '/:cluster_id/details',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster', 'read'),
  Model(Schema.clusterId, 'params'),
  AdminClusterController.fetchSingleClusterDetails
);

router.post(
  '/:cluster_id/invite',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster'),
  AdminClusterMiddleware.checkIfClusterExists,
  AdminClusterMiddleware.checkClusterMemberExist('confirm'),
  Model(Schema.inviteCluster, 'payload'),
  AdminClusterController.clusterMemberInvite
);

router.patch(
  '/:cluster_id/status',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster'),
  AdminClusterMiddleware.checkIfClusterExists,
  Model(Schema.editClusterStatus, 'payload'),
  AdminClusterController.activateAndDeactivateCluster
);

router.patch(
  '/:cluster_id/member/:user_id',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('cluster'),
  AdminClusterMiddleware.checkIfClusterExists,
  AdminClusterMiddleware.checkClusterMemberExist('validate'),
  Model(Schema.editClusterMember, 'payload'),
  AdminClusterController.activateAndDeactivateClusterMember
);

export default router;
