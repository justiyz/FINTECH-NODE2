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
  ClusterMiddleware.compareUserMonthlyIncome,
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
  ClusterMiddleware.compareUserMonthlyIncome,
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
  ClusterMiddleware.newAdminClusterAcceptance,
  ClusterMiddleware.requestToDeleteCluster,
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
  ClusterMiddleware.compareUserMonthlyIncome,
  ClusterController.joinClusterOnInvitation
);

router.post(
  '/:cluster_id/invite-member',
  AuthMiddleware.validateAuthToken,
  Model(Schema.inviteClusterMember, 'payload'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfClusterMemberIsAdmin,
  ClusterMiddleware.confirmClusterIsStillOpenForJoining('invite'),
  ClusterMiddleware.checkIfInviteeAlreadyClusterMember,
  ClusterController.inviteClusterMember
);

router.get(
  '/:cluster_id/members',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterIdParams, 'params'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('authenticate'),
  ClusterController.fetchClusterMembers
);

router.post(
  '/:cluster_id/leave',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterIdParams, 'params'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('authenticate'),
  ClusterMiddleware.checkIfUserCanLeaveCluster,
  ClusterController.leaveCluster
);

router.patch(
  '/:cluster_id/edit',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterIdParams, 'params'),
  Model(Schema.editCluster, 'body'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfClusterMemberIsAdmin,
  ClusterMiddleware.checkIfClusterIsOnActiveLoan,
  ClusterMiddleware.compareUserMonthlyIncome,
  ClusterMiddleware.checkIfThereIsMoreThanOnePersonInTheCluster,
  ClusterMiddleware.checkIfClusterNameUnique,
  ClusterController.editCluster
);

router.post(
  '/:cluster_id/initiate-delete-cluster',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterIdParams, 'params'),
  Model(Schema.initiateDeleteCluster, 'payload'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('authenticate'),
  ClusterMiddleware.checkIfClusterMemberIsAdmin,
  ClusterController.initiateDeleteCluster
);

router.post(
  '/:cluster_id/admin/:invitee_id',
  AuthMiddleware.validateAuthToken,
  Model(Schema.selectNewAdminParams, 'params'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('authenticate'),
  ClusterMiddleware.checkIfClusterMemberIsAdmin,
  ClusterController.suggestNewClusterAdmin
);


export default router;
