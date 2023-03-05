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
  '/',
  AuthMiddleware.validateAuthToken,
  Model(Schema.fetchClusters, 'query'),
  ClusterController.fetchClusters
);

router.get(
  '/:cluster_id/details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterIdParams, 'params'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterController.fetchClusterDetails
);

router.post(
  '/:cluster_id/request-to-join',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterIdParams, 'params'),
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('confirm'),
  ClusterMiddleware.confirmClusterIsStillOpenForJoining('request'),
  ClusterMiddleware.checkIfPublicOrPrivateCluster('public'),
  ClusterMiddleware.compareUserIncomeRange,
  ClusterController.requestToJoinCluster
);

router.post(
  '/:ticket_id/voting-decision',
  AuthMiddleware.validateAuthToken,
  Model(Schema.votingTicketIdParams, 'params'),
  Model(Schema.votingDecision, 'payload'),
  ClusterMiddleware.checkIfClusterDecisionTicketExists,
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIClusterDecisionHasBeenConcluded,
  ClusterMiddleware.checkIfUserHasPreviouslyDecided,
  ClusterMiddleware.userTakesRequestToJoinClusterDecision,
  ClusterController.finalClusterDecision
);

router.post(
  '/:cluster_id/join',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterIdParams, 'params'),
  Model(Schema.votingDecision, 'payload'),
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('confirm'),
  ClusterMiddleware.confirmUserClusterInvitation,
  ClusterMiddleware.confirmClusterIsStillOpenForJoining('join'),
  ClusterMiddleware.compareUserIncomeRange,
  ClusterController.joinClusterOnInvitation
);

router.post(
  '/:cluster_id/invite-member/',
  AuthMiddleware.validateAuthToken,
  Model(Schema.inviteClusterMember, 'payload'),
  ClusterMiddleware.checkIfClusterExists, // checkIfUserIsAdmin middle to be added later
  ClusterMiddleware.confirmClusterIsStillOpenForJoining('join'),
  ClusterMiddleware.checkIfInviteeAlreadyClusterMember,
  ClusterController.inviteClusterMember
);
export default router;
