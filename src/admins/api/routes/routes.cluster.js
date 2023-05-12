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




export default router;
