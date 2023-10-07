import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.cluster';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as ClusterMiddleware from '../middlewares/middlewares.cluster';
import * as LoanMiddleware from '../middlewares/middlewares.loan';
import * as ClusterController from '../controllers/controllers.cluster';

const router = Router();

router.post(
  '/create',
  AuthMiddleware.validateAuthToken,
  Model(Schema.createCluster, 'payload'),
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  UserMiddleware.isUploadedVerifiedId('confirm'),
  ClusterMiddleware.checkIfClusterNameUnique,
  ClusterMiddleware.checkIfUserBelongsToTypeOfCluster,
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
  UserMiddleware.isUploadedVerifiedId('confirm'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('confirm'),
  ClusterMiddleware.checkIfPublicOrPrivateCluster('public'),
  ClusterMiddleware.checkIfUserBelongsToTypeOfCluster,
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
  UserMiddleware.isUploadedVerifiedId('confirm'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('confirm'),
  ClusterMiddleware.confirmUserClusterInvitation,
  ClusterMiddleware.checkIfUserBelongsToTypeOfCluster,
  ClusterMiddleware.compareUserMonthlyIncome,
  ClusterController.joinClusterOnInvitation
);

router.post(
  '/:cluster_id/invite-member',
  AuthMiddleware.validateAuthToken,
  Model(Schema.inviteClusterMember, 'payload'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfClusterMemberIsAdmin,
  ClusterMiddleware.checkIfClusterHasActiveLoan,
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
  ClusterMiddleware.checkIfUserHasActiveClusterLoan,
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
  ClusterMiddleware.checkIfClusterHasActiveLoan,
  ClusterMiddleware.compareUserMonthlyIncome,
  ClusterMiddleware.checkIfThereIsMoreThanOnePersonInTheCluster,
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
  ClusterMiddleware.checkIfClusterHasActiveLoan,
  ClusterController.initiateDeleteCluster
);

router.post(
  '/:cluster_id/admin/:invitee_id',
  AuthMiddleware.validateAuthToken,
  Model(Schema.selectNewAdminParams, 'params'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('authenticate'),
  ClusterMiddleware.checkIfClusterMemberIsAdmin,
  ClusterMiddleware.checkIfClusterHasActiveLoan,
  ClusterController.suggestNewClusterAdmin
);

router.post(
  '/loan/:cluster_id/initiation',
  AuthMiddleware.validateAuthToken,
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('authenticate'),
  ClusterMiddleware.checkIfClusterMemberIsAdmin,
  ClusterMiddleware.checkIfPublicOrPrivateCluster('private'),
  Model(Schema.clusterIdParams, 'params'),
  Model(Schema.initiateClusterLoan, 'payload'),
  ClusterMiddleware.checkClusterMembersNumber,
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  AuthMiddleware.isPinCreated('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  UserMiddleware.isUploadedVerifiedId('confirm'),
  UserMiddleware.checkUserAdvancedKycUpdate,
  ClusterMiddleware.checkIfClusterHasActiveLoan,
  ClusterMiddleware.checkIfUserHasActiveClusterLoan,
  ClusterMiddleware.totalLoanAmountVerificationAndBreakdown,
  LoanMiddleware.validateLoanAmountAndTenor,
  LoanMiddleware.checkIfEmploymentTypeLimitApplies,
  LoanMiddleware.checkIfUserBvnNotBlacklisted,
  LoanMiddleware.additionalUserChecksForLoan,
  ClusterController.checkClusterAdminClusterLoanEligibility
);

router.post(
  '/loan/:member_loan_id/renegotiate',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterMemberLoanIdParams, 'params'),
  Model(Schema.clusterLoanRenegotiation, 'payload'),
  ClusterMiddleware.checkIfMemberClusterLoanApplicationExists,
  ClusterMiddleware.checkIfMemberClusterLoanApplicationStatusIsStillPending,
  LoanMiddleware.validateLoanAmountAndTenor,
  LoanMiddleware.validateRenegotiationAmount,
  ClusterController.processClusterLoanRenegotiation
);

router.get(
  '/loan/:member_loan_id/details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterMemberLoanIdParams, 'params'),
  ClusterMiddleware.checkIfMemberClusterLoanApplicationExists,
  ClusterController.fetchClusterMemberLoanDetails
);

router.post(
  '/loan/:member_loan_id/eligibility-check',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterMemberLoanIdParams, 'params'),
  Model(Schema.membersClusterLoanEligibilityCheck, 'payload'),
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  AuthMiddleware.isPinCreated('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  UserMiddleware.isUploadedVerifiedId('confirm'),
  UserMiddleware.checkUserAdvancedKycUpdate,
  ClusterMiddleware.checkIfUserHasActiveClusterLoan,
  ClusterMiddleware.checkIfMemberClusterLoanApplicationExists,
  ClusterMiddleware.checkIfMemberClusterLoanApplicationStatusIsStillPending,
  ClusterMiddleware.sortClusterLoanAmount,
  LoanMiddleware.validateLoanAmountAndTenor,
  LoanMiddleware.checkIfEmploymentTypeLimitApplies,
  LoanMiddleware.checkIfUserBvnNotBlacklisted,
  LoanMiddleware.additionalUserChecksForLoan,
  ClusterController.checkClusterMemberClusterLoanEligibility
);

router.post(
  '/loan/:member_loan_id/loan-decision',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterMemberLoanIdParams, 'params'),
  Model(Schema.membersClusterLoanDecision, 'payload'),
  ClusterMiddleware.checkIfMemberClusterLoanApplicationExists,
  ClusterMiddleware.checkIfMemberClusterLoanApplicationStatusIsStillPending,
  ClusterController.clusterMemberLoanDecision
);

router.post(
  '/loan/:cluster_id/:loan_id/disbursement',
  AuthMiddleware.validateAuthToken,
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('authenticate'),
  ClusterMiddleware.checkIfClusterMemberIsAdmin,
  ClusterMiddleware.checkIfPublicOrPrivateCluster('private'),
  Model(Schema.clusterLoanIdParams, 'params'),
  Model(Schema.userPinPayload, 'payload'),
  ClusterMiddleware.checkIfClusterLoanApplicationExists,
  AuthMiddleware.comparePin,
  ClusterMiddleware.fetchGeneralClusterNewLoanAmountValues,
  LoanMiddleware.checkSeedfiPaystackBalance,
  LoanMiddleware.generateLoanDisbursementRecipient,
  ClusterController.initiateClusterLoanDisbursement
);

router.get(
  '/loan/:member_loan_id/initiate-repayment',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterMemberLoanIdParams, 'params'),
  Model(Schema.noCardOrBankLoanRepaymentType, 'query'),
  ClusterMiddleware.checkIfMemberClusterLoanApplicationExists,
  ClusterController.initiateManualClusterLoanRepayment
);

router.post(
  '/loan/:member_loan_id/:payment_channel_id/initiate-repayment',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanRepaymentParams, 'params'),
  Model(Schema.loanRepaymentType, 'query'),
  ClusterMiddleware.checkIfMemberClusterLoanApplicationExists,
  UserMiddleware.checkIfAccountDetailsExists,
  UserMiddleware.checkIfCardOrUserExist,
  ClusterController.initiateManualCardOrBankClusterLoanRepayment
);

router.get(
  '/:cluster_id/current-loan',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterIdParams, 'params'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('authenticate'),
  ClusterMiddleware.checkIfPublicOrPrivateCluster('private'),
  ClusterController.fetchCurrentClusterLoan
);

router.get(
  '/:cluster_id/:loan_id/loan-summary',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterLoanIdParams, 'params'),
  ClusterMiddleware.checkIfClusterExists,
  ClusterMiddleware.checkIfAlreadyClusterMember('authenticate'),
  ClusterMiddleware.checkIfPublicOrPrivateCluster('private'),
  ClusterMiddleware.checkIfClusterLoanApplicationExists,
  ClusterController.fetchClusterLoanSummary
);

router.get(
  '/loan/:member_loan_id/reschedule-summary',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterMemberLoanIdParams, 'params'),
  Model(Schema.rescheduleExtensionId, 'query'),
  ClusterMiddleware.checkIfMemberClusterLoanApplicationExists,
  LoanMiddleware.checkIfOngoingLoanApplication,
  LoanMiddleware.checkRescheduleExtensionExists,
  ClusterController.clusterLoanReschedulingSummary
);

router.post(
  '/loan/:member_loan_id/:reschedule_id/process-rescheduling',
  AuthMiddleware.validateAuthToken,
  Model(Schema.clusterLoanRescheduleParams, 'params'),
  ClusterMiddleware.checkIfMemberClusterLoanApplicationExists,
  LoanMiddleware.checkIfOngoingLoanApplication,
  ClusterMiddleware.checkClusterLoanReschedulingRequest,
  ClusterController.processClusterLoanRescheduling
);


export default router;
