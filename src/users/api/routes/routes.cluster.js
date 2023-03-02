import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.cluster';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as ClusterMiddleware from '../middlewares/middlewares.cluster';
import * as ClusterController from '../controllers/controllers.cluster';

const router = Router();

router.post(
  '/create',
  AuthMiddleware.validateAuthToken,
  Model(Schema.createCluster, 'payload'),
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  ClusterMiddleware.checkIfClusterNameUnique,
  ClusterMiddleware.compareUserIncomeRange,
  ClusterMiddleware.generateClusterUniqueCode,
  ClusterController.createCluster
);

router.get(
  '/fetch-clusters',
  AuthMiddleware.validateAuthToken,
  Model(Schema.fetchClusters, 'query'),
  ClusterController.fetchClusters
);

router.get(
  '/:cluster_id/details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterId, 'params'),
  ClusterController.fetchClusterDetails
);

export default router;
