import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import clusterQueries from '../queries/queries.cluster';
import userQueries from '../queries/queries.user';
import authQueries from '../queries/queries.auth';
import notificationQueries from '../queries/queries.notification';
import loanQueries from '../queries/queries.loan';
import { processOneOrNoneData, processAnyData, processNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import config from '../../config';
import AdminMailService from '../../../admins/api/services/services.email';
import ClusterPayload from '../../lib/payloads/lib.payload.cluster';
import { createClusterNotification, sendUserPersonalNotification, sendMulticastPushNotification,
  sendClusterNotification, sendPushNotification, sendNotificationToAdmin } from '../services/services.firebase';
import MailService from '../services/services.email';
import { loanApplicationEligibilityCheck, loanApplicationRenegotiation } from '../services/service.seedfiUnderwriting';
import { initiateTransfer, initializeCardPayment, initializeBankTransferPayment,
  initializeDebitCarAuthChargeForLoanRepayment, initializeBankAccountChargeForLoanRepayment 
} from '../services/service.paystack';
import { collateUsersFcmTokens, collateUsersFcmTokensExceptAuthenticatedUser, generateOfferLetterPDF } from '../../lib/utils/lib.util.helpers';
import * as PushNotifications from '../../lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates/personalNotification';
import * as adminNotification from '../../lib/templates/adminNotification';
import { userActivityTracking } from '../../lib/monitor';


/**
 * request to join cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the voting decision ticket id
 * @memberof ClusterController
 */
export const requestToJoinCluster = async(req, res, next) => {
  try {
    const { cluster, user } = req;
    const clusterDecisionType = await processOneOrNoneData(clusterQueries.fetchClusterDecisionType, [ 'join cluster' ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster decision type fetched successfully requestToJoinCluster.controllers.cluster.js`);
    const [ existingClusterDecisionTicket ] = await processAnyData(clusterQueries.checkIfDecisionTicketPreviouslyRaisedAndStillOpened, 
      [ user.user_id, cluster.cluster_id, clusterDecisionType.name ]); 
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user still has an inconclusive request to join cluster ticket with this same cluster 
    requestToJoinCluster.controllers.cluster.js`);
    if (existingClusterDecisionTicket) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user still has an inconclusive request to join cluster ticket with this same cluster 
      requestToJoinCluster.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, 49, 'fail');
      return ApiResponse.error(res, enums.USER_HAS_PREVIOUSLY_RAISED_REQUEST_CLUSTER_TICKET('join'), enums.HTTP_CONFLICT, enums.REQUEST_TO_JOIN_CLUSTER_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does not have any inconclusive request to join cluster ticket with this same cluster 
    requestToJoinCluster.controllers.cluster.js`);
    const clusterJoiningTicket = await processOneOrNoneData(clusterQueries.raiseClusterDecisionTicket, [ cluster.cluster_id, clusterDecisionType.name, 
      `${user.first_name} ${user.last_name} wants to join "${cluster.name}" cluster`, user.user_id, Number(cluster.current_members) ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: request to join cluster ticket raised successfully requestToJoinCluster.controllers.cluster.js`);
    const clusterMembersToken = await collateUsersFcmTokens(cluster.members);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fcm tokens of all cluster members fetched successfully requestToJoinCluster.controllers.cluster.js`);
    await cluster.members.forEach(async(member) => {
      const userDetails = await processOneOrNoneData(userQueries.getUserByUserId, [ member.user_id ]);
      sendUserPersonalNotification(userDetails, `request to join ${cluster.name} cluster`, PersonalNotifications.requestToJoinClusterNotification(user, cluster), 
        'request-join-cluster', { voting_ticket_id: clusterJoiningTicket.ticket_id, decision: 'none' });
      return member;
    });
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: notifications of all cluster members updated successfully requestToJoinCluster.controllers.cluster.js`);
    sendMulticastPushNotification(PushNotifications.requestToJoinCluster(user, cluster), clusterMembersToken, 'request-join-cluster', cluster.cluster_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: multicast push notification sent to all cluster members successfully 
    requestToJoinCluster.controllers.cluster.js`);
    userActivityTracking(req.user.user_id, 49, 'success');
    return ApiResponse.success(res, enums.REQUEST_TO_JOIN_CLUSTER_SENT_SUCCESSFULLY, enums.HTTP_OK, { user_id: user.user_id, decision_type: clusterDecisionType.name, 
      ticket_id: clusterJoiningTicket.ticket_id });
  } catch (error) {
    userActivityTracking(req.user.user_id, 49, 'fail');
    error.label = enums.REQUEST_TO_JOIN_CLUSTER_CONTROLLER;
    logger.error(`requesting to join cluster failed::${enums.REQUEST_TO_JOIN_CLUSTER_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * final cluster decision if an unknown type is processed
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with no data
 * @memberof ClusterController
 */
export const finalClusterDecision = async(req, res, next) => {
  try {
    const { user, votingTicketDetails } = req;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster decision is for ${votingTicketDetails.type} which has not been catered for yet 
    finalClusterDecision.controller.cluster.js`);
    return ApiResponse.success(res, enums.NOT_CATERED_FOR_DECISION_TYPE, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.FINAL_CLUSTER_DECISION_CONTROLLER;
    logger.error(`returning value for not catered for voting decision type failed::${enums.FINAL_CLUSTER_DECISION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * join cluster based on invitation
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the voting decision ticket id
 * @memberof ClusterController
 */
export const joinClusterOnInvitation = async(req, res, next) => {
  try {
    const { params: { cluster_id }, body, cluster, user } = req;
    const [ formerClusterMember ] = await processAnyData(clusterQueries.fetchDeactivatedClusterMemberDetails, [ cluster_id, user.user_id ]);
    const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'cluster management' ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user was a one time cluster member joinClusterOnInvitation.controller.cluster.js`);
    const clusterMembersToken = await collateUsersFcmTokens(cluster.members);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fcm tokens of all cluster members fetched successfully joinClusterOnInvitation.controllers.cluster.js`);
    const decisionType = body.decision === 'yes' ? 'accepted' : 'declined';
    const [ adminUserDetails ] = await processAnyData(userQueries.getUserByUserId, [ cluster.admin ]);
    if (body.decision === 'yes') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user ${decisionType} cluster invitation joinClusterOnInvitation.controllers.cluster.js`);
      await Promise.all([
        formerClusterMember ? processOneOrNoneData(clusterQueries.reinstateClusterMember, [ cluster_id, user.user_id ]) :
          processOneOrNoneData(clusterQueries.createClusterMember, [ cluster_id, user.user_id, false ]),
        processOneOrNoneData(clusterQueries.updateClusterInvitationStatus, [ user.user_id, cluster_id, true, false ]),
        processOneOrNoneData(clusterQueries.incrementClusterMembersCount, [ cluster_id ]),
        processOneOrNoneData(clusterQueries.updateRequestToJoinClusterTicketPreviouslyRaisedOnAcceptingClusterInvite, [ user.user_id, cluster_id, 'join cluster' ])
      ]);
      sendClusterNotification(user, cluster, { is_admin: false }, `${user.first_name} ${user.last_name} joined your cluster`, 'join-cluster', {});
      sendUserPersonalNotification(adminUserDetails, `${cluster.name} cluster invitation accepted`, PersonalNotifications.clusterInvitationAcceptance(user, cluster), 
        'cluster-invitation-accepted', { ...cluster });
      sendMulticastPushNotification(PushNotifications.userJoinedYourCluster(user, cluster), clusterMembersToken, 'join-cluster', cluster_id);
      if (cluster.is_created_by_admin) {
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Admin Cluster User Acceptance', adminNotification.joinClusterNotification(),
            [ `${user.first_name} ${user.last_name}` ], 'cluster-acceptance');
        });
      }
      if ((!cluster.is_created_by_admin) && (Number(cluster.members.length) + 1 === 5) && (!cluster.cluster_creator_received_membership_count_reward)) {
        const rewardDetails = await processOneOrNoneData(authQueries.fetchClusterRelatedRewardPointDetails, [ 'cluster_member_increase' ]);
        const rewardPoint = parseFloat(rewardDetails.point);
        const rewardDescription = 'Cluster membership increase point';
        await processOneOrNoneData(authQueries.updateRewardPoints, 
          [ cluster.created_by, null, rewardPoint, rewardDescription, null, 'cluster membership increase' ]);
        await processOneOrNoneData(authQueries.updateUserPoints, [ user.user_id, parseFloat(rewardPoint), parseFloat(rewardPoint) ]);
        const [ clusterCreator ] = await processAnyData(userQueries.getUserByUserId, [ cluster.created_by ]);
        await processOneOrNoneData(clusterQueries.updateClusterCreatorReceivedMembershipRewardPoints, [ cluster_id ]);
        sendUserPersonalNotification(clusterCreator, 'Cluster membership increase point', 
          PersonalNotifications.userEarnedRewardPointMessage(rewardPoint, `cluster membership increase up to ${5}`), 'point-rewards', {});
        sendPushNotification(clusterCreator.user_id, PushNotifications.rewardPointPushNotification(rewardPoint, `cluster membership increase up to ${5}`), 
          clusterCreator.fcm_token);
        userActivityTracking(req.user.user_id, 107, 'success');
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user added to new cluster and all notifications sent successfully 
      joinClusterOnInvitation.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, 52, 'success');
      return ApiResponse.success(res, enums.JOIN_CLUSTER_DECISION_CHOICE(decisionType), enums.HTTP_OK, { user_id: user.user_id, decision: 'accepted', cluster_id });
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user ${decisionType} cluster invitation joinClusterOnInvitation.controllers.cluster.js`);
    await processOneOrNoneData(clusterQueries.updateClusterInvitationStatus, [ user.user_id, cluster_id, false, true ]);
    await processOneOrNoneData(clusterQueries.updateRequestToJoinClusterTicketPreviouslyRaisedOnAcceptingClusterInvite, [ user.user_id, cluster_id, 'join cluster' ]);
    sendClusterNotification(user, cluster, { is_admin: false }, `${user.first_name} ${user.last_name} declined to join your cluster`, 'join-cluster', {});
    sendUserPersonalNotification(adminUserDetails, `${cluster.name} cluster invitation declined`, PersonalNotifications.clusterInvitationDeclination(user, cluster), 
      'cluster-invitation-declined', { ...cluster });
    sendMulticastPushNotification(PushNotifications.userDeclinedJoiningYourCluster(user, cluster), clusterMembersToken, 'join-cluster', cluster_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user rejected new cluster invite and all notifications sent successfully 
    joinClusterOnInvitation.controllers.cluster.js`);
    userActivityTracking(req.user.user_id, 52, 'fail');
    return ApiResponse.success(res, enums.JOIN_CLUSTER_DECISION_CHOICE(decisionType), enums.HTTP_OK, { user_id: user.user_id, decision: 'declined', cluster_id });
  } catch (error) {
    userActivityTracking(req.user.user_id, 52, 'fail');
    error.label = enums.JOIN_CLUSTER_ON_INVITATION_CONTROLLER;
    logger.error(`joining cluster decision failed::${enums.JOIN_CLUSTER_ON_INVITATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * create cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the cluster details
 * @memberof ClusterController
 */
export const createCluster = async(req, res, next) => {
  const { body, user } = req;
  const activityType = body.type === 'public' ? 47 : 48;
  try {
    const createClusterPayload = ClusterPayload.createClusterPayload(body, user);
    const newClusterDetails = await processOneOrNoneData(clusterQueries.createCluster, createClusterPayload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster created successfully successfully createCluster.controllers.cluster.js`);
    const clusterMemberDetails = await processOneOrNoneData(clusterQueries.createClusterMember, [ newClusterDetails.cluster_id, user.user_id, true ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster admin member created successfully successfully createCluster.controllers.cluster.js`);
    const rewardDetails = await processOneOrNoneData(authQueries.fetchClusterRelatedRewardPointDetails, [ 'cluster_creation' ]);
    const rewardPoint = parseFloat(rewardDetails.point);
    const rewardDescription = 'Create cluster point';
    await processOneOrNoneData(authQueries.updateRewardPoints, 
      [ user.user_id, null, rewardPoint, rewardDescription, null, 'cluster creation' ]);
    await processOneOrNoneData(authQueries.updateUserPoints, [ user.user_id, parseFloat(rewardPoint), parseFloat(rewardPoint) ]);
    sendUserPersonalNotification(user, 'Create cluster point', 
      PersonalNotifications.userEarnedRewardPointMessage(rewardPoint, 'cluster creation'), 'point-rewards', {});
    sendPushNotification(user.user_id, PushNotifications.rewardPointPushNotification(rewardPoint, 'cluster creation'), user.fcm_token);
    createClusterNotification(user, body, newClusterDetails, clusterMemberDetails, 
      `${user.first_name} ${user.last_name} created ${body.type} cluster ${body.name}`, 'create-cluster', {});
    userActivityTracking(req.user.user_id, activityType, 'success');
    userActivityTracking(req.user.user_id, 106, 'success');
    return ApiResponse.success(res, enums.CLUSTER_CREATED_SUCCESSFULLY, enums.HTTP_OK, { ...newClusterDetails, user_referral_code: user.referral_code });
  } catch (error) {
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.CREATE_CLUSTER_CONTROLLER;
    logger.error(`creating cluster failed::${enums.CREATE_CLUSTER_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch clusters
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the cluster details
 * @memberof ClusterController
 */

export const fetchClusters = async(req, res, next) => {
  try {
    const {query: { type }, user} = req;
    if (type === 'explore') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: type ${type} is decoded fetchClusters.users.controllers.user.js`);
      const  clusters  = await processAnyData(clusterQueries.fetchClusters);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched all available clusters in the DB fetchClusters.users.controllers.user.js`); 
      const nonClusters = [];
      await Promise.all(
        clusters.map(async(cluster)=> {
          const [ userClusters ] = await processAnyData(clusterQueries.fetchActiveClusterUser, [ user.user_id, cluster.cluster_id ]);
          if (!userClusters) {
            const [ checkIfCurrentRequestToJoin ] = await processAnyData(clusterQueries.checkIfDecisionTicketPreviouslyRaisedAndStillOpened, 
              [ user.user_id, cluster.cluster_id, 'join cluster' ]);
            if (!checkIfCurrentRequestToJoin) {
              cluster.has_pending_request = false;
              nonClusters.push(cluster);
              return cluster;
            }
            cluster.has_pending_request = true;
            nonClusters.push(cluster);
            return cluster;
          }
        })
      );
      return ApiResponse.success(res, enums.CLUSTER_FETCHED_SUCCESSFULLY, enums.HTTP_OK, nonClusters);
    }
    if (type === 'my cluster') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: type ${type} is decoded fetchClusters.users.controllers.user.js`);
      const userClusters = await processAnyData(clusterQueries.fetchUserClusters, user.user_id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched all user clusters in the DB fetchClusters.users.controllers.user.js`);
      for (let cluster of userClusters) {
        cluster.is_member = true;
      }
      return ApiResponse.success(res, enums.CLUSTER_FETCHED_SUCCESSFULLY, enums.HTTP_OK, userClusters);
    }
    if (type === 'created') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: type ${type} is decoded fetchClusters.users.controllers.user.js`);
      const createdClusters = await processAnyData(clusterQueries.fetchUserCreatedClusters, user.user_id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched clusters created by user in the DB fetchClusters.users.controllers.user.js`);
      await Promise.all(
        createdClusters.map(async(cluster)=> {
          const [ userClusters ] = await processAnyData(clusterQueries.fetchActiveClusterUser, [ user.user_id, cluster.cluster_id ]);
          const [ checkIfCurrentRequestToJoin ] = await processAnyData(clusterQueries.checkIfDecisionTicketPreviouslyRaisedAndStillOpened, 
            [ user.user_id, cluster.cluster_id, 'join cluster' ]);
          cluster.has_pending_request = checkIfCurrentRequestToJoin ? true : false;
          if (userClusters) {
            cluster.is_member = true;
            return cluster;
          }
          cluster.is_member = false;
          return cluster;
        })
      );
      return ApiResponse.success(res, enums.CLUSTER_FETCHED_SUCCESSFULLY, enums.HTTP_OK, createdClusters);
    }
  } catch (error) {
    error.label = enums.FETCH_CLUSTERS_CONTROLLER;
    logger.error(`fetching clusters failed::${enums.FETCH_CLUSTERS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch a cluster's details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the cluster details
 * @memberof ClusterController
 */

export const fetchClusterDetails = async(req, res, next) => {
  try {
    const { params: { cluster_id }, user } = req;
    let clusterDetails = await processOneOrNoneData(clusterQueries.fetchClusterDetails, cluster_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched cluster details in the DB fetchClusterDetails.users.controllers.user.js`);
    const [ userClusters ] = await processAnyData(clusterQueries.fetchActiveClusterUser, [ user.user_id, cluster_id ]);
    clusterDetails.is_member = userClusters ? true : false;
    clusterDetails.is_admin = (userClusters && userClusters.is_admin) ? true : false;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully updates users cluster membership and adminship 
    fetchClusterDetails.users.controllers.user.js`);
    return ApiResponse.success(res, enums.CLUSTER_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, {...clusterDetails, user_referral_code: user.referral_code});
  } catch (error) {
    error.label = enums.FETCH_CLUSTER_DETAILS_CONTROLLER;
    logger.error(`fetching cluster details failed::${enums.FETCH_CLUSTER_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * invite cluster member
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} -  Returning a JSON with the invite details
 * @memberof ClusterMiddleware
 */
export const inviteClusterMember = async(req, res, next) => {
  try {
    const {body, user, cluster } = req;
    const [ invitedUser ]  = body.type === 'email' ? await processAnyData(userQueries.getUserByEmail, [ body.email.trim().toLowerCase() ])
      : await processAnyData(userQueries.getUserByPhoneNumber, [ body.phone_number.trim() ]);
    const payload = ClusterPayload.inviteClusterMember(body, cluster, user, invitedUser, body.type);
    const inviteInfo = {inviter: user.first_name, name: cluster.name};
    const data = {
      email: body.email?.trim().toLowerCase(),
      cluster_name: cluster.name,
      inviter_first_name: user.first_name,
      inviter_last_name: user.last_name,
      join_url: body.link_url
    };
    if (body.type === 'email' && !invitedUser) {
      await MailService('Cluster Invitation', 'loanClusterInvite', { ...data });
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      decoded that invited user email is NOT a valid email in the DB. inviteClusterMember.controllers.cluster.js`);
      const clusterMember = await processOneOrNoneData(clusterQueries.inviteClusterMember, payload);
      return ApiResponse.success(res, enums.CLUSTER_MEMBER_INVITATION(body.type), enums.HTTP_OK, clusterMember);
    }
    if (body.type === 'phone_number' && !invitedUser) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info:
      decoded that invited user phone number is not a registered phone number in the DB. inviteClusterMember.controllers.cluster.js`);
      const clusterMember = await processOneOrNoneData(clusterQueries.inviteClusterMember, payload);
      return ApiResponse.success(res, enums.CLUSTER_MEMBER_INVITATION(body.type), enums.HTTP_OK, clusterMember);
    }
    if ((body.type === 'email' && body.email.trim().toLowerCase() === invitedUser.email) || 
    (body.type === 'phone_number' && body.phone_number.trim() === invitedUser.phone_number)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
      decoded that invited user is a valid and active user in the DB. inviteClusterMember.controllers.cluster.js`);
      const clusterMember = await processOneOrNoneData(clusterQueries.inviteClusterMember, payload);
      sendPushNotification(invitedUser.user_id, PushNotifications.clusterMemberInvitation(), invitedUser.fcm_token);
      sendUserPersonalNotification(invitedUser, `${cluster.name} cluster invite`, PersonalNotifications.inviteClusterMember(inviteInfo), 'cluster-invitation', { ...cluster });
      await MailService('Cluster Invitation', 'loanClusterInvite', { ...data });
      return ApiResponse.success(res, enums.INVITE_CLUSTER_MEMBER, enums.HTTP_OK, clusterMember);
    }
  } catch (error) {
    error.label = enums.INVITE_CLUSTER_CONTROLLER;
    logger.error(`Inviting cluster member failed::${enums.INVITE_CLUSTER_CONTROLLER}`, error.message);
    return next(error);
  }
};
/**
 * fetch a cluster's members
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the cluster members
 * @memberof ClusterController
 */
export const fetchClusterMembers = async(req, res, next) => {
  try {
    const { params: { cluster_id }, user } = req;
    const clusterMembers = await processAnyData(clusterQueries.fetchClusterMembers, cluster_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched cluster members in the DB fetchClusterMembers.users.controllers.cluster.js`);
    return ApiResponse.success(res, enums.CLUSTER_MEMBERS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, clusterMembers);
  } catch (error) {
    error.label = enums.FETCH_CLUSTER_MEMBERS_CONTROLLER;
    logger.error(`fetching cluster details failed::${enums.FETCH_CLUSTER_MEMBERS_CONTROLLER}`, error.message);
    return next(error);
  }  
};

/**
 * member leaves a cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with no data
 * @memberof ClusterController
 */
export const leaveCluster = async(req, res, next) => {
  try {
    const { params: { cluster_id }, user, cluster } = req;
    const clusterMembersToken = await collateUsersFcmTokens(cluster.members);
    await Promise.all([
      processOneOrNoneData(clusterQueries.leaveCluster, [ user.user_id, cluster_id ]),
      processOneOrNoneData(clusterQueries.decrementClusterMembersCount, cluster_id)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user successfully leaves a cluster and cluster member decrements leaveCluster.controllers.cluster.js`);
    userActivityTracking(req.user.user_id, 63, 'success');
    sendClusterNotification(user, cluster, { is_admin: false }, `${user.first_name} ${user.last_name} left your cluster`, 'leave-cluster', {});
    sendMulticastPushNotification(PushNotifications.userLeftYourCluster(user, cluster), clusterMembersToken, 'leave-cluster', cluster_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: all notifications sent successfully leaveCluster.controllers.cluster.js`);
    const clusterMembers = await processAnyData(clusterQueries.fetchActiveClusterMembers, [ cluster_id ]);
    if (clusterMembers.length < 1) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms user is the last person on the cluster leaveCluster.controllers.cluster.js`);
      await processOneOrNoneData(clusterQueries.deleteAcluster, cluster_id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully deletes the cluster leaveCluster.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, 62, 'success');
      sendClusterNotification(cluster, `${cluster.cluster_name} has been deleted`, 'delete-cluster', {});
    }
    return ApiResponse.success(res, enums.USER_LEFT_CLUSTER_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    userActivityTracking(req.user.user_id, 63, 'fail');
    error.label = enums.LEAVE_CLUSTER_CONTROLLER;
    logger.error(`leaving cluster failed::${enums.LEAVE_CLUSTER_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * edit a cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with no data
 * @memberof ClusterController
 */

export const editCluster = async(req, res, next) => {
  try {
    const { params, body, cluster, user  } = req;
    const [ existingClusterName ] = await processAnyData(clusterQueries.checkIfClusterNameIsUnique, [ body.name?.trim().toLowerCase() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if cluster name already exists in the db editCluster.controllers.cluster.js`);
    if (existingClusterName) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster name already exists in the db editCluster.controllers.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_NAME_ALREADY_EXISTING(body.name), enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_NAME_UNIQUE_MIDDLEWARE);
    }
    const payload = ClusterPayload.editCluster(body, cluster, params);
    const editedCluster = await processOneOrNoneData(clusterQueries.editCluster,  payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully edited the cluster editCluster.controllers.cluster.js`);
    return ApiResponse.success(res, enums.CLUSTER_EDITED_SUCCESSFULLY, enums.HTTP_OK, editedCluster);
  } catch (error) {
    error.label = enums.EDIT_CLUSTER_CONTROLLER;
    logger.error(`editing cluster failed::${enums.EDIT_CLUSTER_CONTROLLER}`, error.message);
    return next(error);
  }
};


/**
 * Initiate a delete cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with no data
 * @memberof ClusterController
 */
export const initiateDeleteCluster = async(req, res, next) => {
  try {
    const { params: { cluster_id }, cluster, user, body } = req;
    const clusterDecisionType = await processOneOrNoneData(clusterQueries.fetchClusterDecisionType, [ 'delete cluster' ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster decision type fetched successfully initiateDeleteCluster.controllers.cluster.js`);
    const [ existingClusterDecisionTicket ] = await processAnyData(clusterQueries.checkIfDecisionTicketPreviouslyRaisedAndStillOpened, 
      [ user.user_id, cluster_id, clusterDecisionType.name ]); 
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user still has an inconclusive request to delete cluster ticket with this same cluster 
    initiateDeleteCluster.controllers.cluster.js`);
    if (existingClusterDecisionTicket) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user still has an inconclusive request to delete cluster ticket with this same cluster 
      initiateDeleteCluster.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, 59, 'fail');
      return ApiResponse.error(res, enums.USER_HAS_PREVIOUSLY_RAISED_REQUEST_CLUSTER_TICKET('delete'), enums.HTTP_CONFLICT, enums.REQUEST_TO_JOIN_CLUSTER_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does not have any inconclusive request to join cluster ticket with this same cluster 
    initiateDeleteCluster.controllers.cluster.js`);
    const initiateDeleteClusterTicket =  await processOneOrNoneData(clusterQueries.raiseClusterDecisionTicket, [ cluster_id, clusterDecisionType.name, 
      `${user.first_name} ${user.last_name} wants to delete "${cluster.name}" cluster`, user.user_id, (Number(cluster.current_members) - 1) ]);
    await processOneOrNoneData(clusterQueries.initiateDeleteCluster, [ cluster_id, body.deletion_reason ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: request to delete cluster ticket raised successfully initiateDeleteCluster.controllers.cluster.js`);
    const [ clusterMembersToken, otherClusterMembers ] = await collateUsersFcmTokensExceptAuthenticatedUser(cluster.members, user.user_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fcm tokens of all cluster members fetched successfully initiateDeleteCluster.controllers.cluster.js`);
    await otherClusterMembers.forEach(async(member) => {
      const userDetails = await processOneOrNoneData(userQueries.getUserByUserId, [ member.user_id ]);
      sendUserPersonalNotification(userDetails, `${cluster.name} delete cluster`, PersonalNotifications.initiateDeleteCluster(user, cluster), 'delete-cluster', 
        { voting_ticket_id: initiateDeleteClusterTicket.ticket_id, deletion_reason: body.deletion_reason, decision: 'none' });
      return member;
    });
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: notifications of all cluster members updated successfully initiateDeleteCluster.controllers.cluster.js`);
    sendMulticastPushNotification(PushNotifications.initiateDeleteCluster(user, cluster), clusterMembersToken, 'request-join-cluster', cluster_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: multicast push notification sent to all cluster members successfully 
    initiateDeleteCluster.controllers.cluster.js`);
    userActivityTracking(req.user.user_id, 59, 'success');
    return ApiResponse.success(res, enums.INITIATE_DELETE_CLUSTER, enums.HTTP_OK, {
      user_id: user.user_id, cluster: cluster_id, decision_type: 'delete cluster', 
      deletion_reason: req.body.deletion_reason, ticket_id: initiateDeleteClusterTicket.ticket_id 
    });
  } catch (error) {
    userActivityTracking(req.user.user_id, 59, 'fail');
    error.label = enums.INITIATE_DELETE_CLUSTER_CONTROLLER;
    logger.error(`initiating delete cluster failed::${enums.INITIATE_DELETE_CLUSTER_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
* suggest new cluster admin
* @param {Request} req - The request from the endpoint.
* @param {Response} res - The response returned by the method.
* @param {Next} next - Call the next operation.
* @returns { JSON } - A JSON with no data
* @memberof ClusterController
*/
export const suggestNewClusterAdmin = async(req, res, next) => {
  try {
    const { params, cluster, clusterMember, user } = req;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: notifications of all cluster members updated successfully initiateDeleteCluster.controllers.cluster.js`);
    const userDetails = await processOneOrNoneData(userQueries.getUserByUserId, [ params.invitee_id ]);
    const clusterDecisionType = await processOneOrNoneData(clusterQueries.fetchClusterDecisionType, [ 'cluster admin' ]);
    const suggestAdminClusterTicket =  await processOneOrNoneData(clusterQueries.suggestedAdmin, 
      [ cluster.cluster_id, clusterDecisionType.name, `${user.first_name} ${user.last_name} suggest an admin for "${cluster.name}" cluster`, 
        user.user_id, 1, params.invitee_id ]);
    sendUserPersonalNotification(userDetails, `${cluster.name} new admin cluster request`, PersonalNotifications.selectNewAdmin(user, cluster), 'suggest-admin-cluster', 
      { voting_ticket_id: suggestAdminClusterTicket.ticket_id, decision: 'none' });
    sendClusterNotification(user, cluster, clusterMember, `${user.first_name} ${user.last_name} is suggesting new cluster admin`, 'suggest-admin-cluster', {});
    userActivityTracking(req.user.user_id, 64, 'success');
    return ApiResponse.success(res, enums.SELECT_NEW_ADMIN, enums.HTTP_OK, {
      selected_admin: params.invitee_id,
      cluster_admin: cluster.admin,
      cluster: cluster.cluster_id,
      ticket_id: suggestAdminClusterTicket.ticket_id
    });
  } catch (error) {
    userActivityTracking(req.user.user_id, 64, 'fail');
    error.label = enums.SUGGEST_NEW_CLUSTER_ADMIN_CONTROLLER;
    logger.error(`selecting new cluster admin failed::${enums.SUGGEST_NEW_CLUSTER_ADMIN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
* check if cluster admin is eligible for loan
* @param {Request} req - The request from the endpoint.
* @param {Response} res - The response returned by the method.
* @param {Next} next - Call the next operation.
* @returns { JSON } - A JSON with no data
* @memberof ClusterController
*/
export const checkClusterAdminClusterLoanEligibility = async(req, res, next) => {
  try {
    const { user, body, userEmploymentDetails, cluster, userDefaultAccountDetails, userMinimumAllowableAMount, userMaximumAllowableAmount, previousLoanCount } = req;
    const privateClusterFixedInterestRateDetails = await processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'private_cluster_fixed_interest_rate' ]);
    const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'loan application' ]);
    const userMonoId = userDefaultAccountDetails.mono_account_id === null ? '' : userDefaultAccountDetails.mono_account_id;
    const userBvn = await processOneOrNoneData(loanQueries.fetchUserBvn, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user bvn from the db checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
    const [ userPreviouslyDefaulted ] = await processAnyData(loanQueries.checkIfUserHasPreviouslyDefaultedInLoanRepayment, [ user.user_id ]);
    const previouslyDefaultedCount = parseFloat(userPreviouslyDefaulted.count);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user previously defaulted in loan repayment 
    checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
    const generalLoanApplicationDetails = await processOneOrNoneData(clusterQueries.initiateClusterLoanApplication, 
      [ cluster.cluster_id, cluster.name, user.user_id, parseFloat(body.total_amount), Number(body.duration_in_months), body.sharing_type, 
        parseFloat(body.total_amount), Number(body.duration_in_months) ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: initiated general loan application in the db 
    checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
    const initiatorLoanApplicationDetails = await processOneOrNoneData(clusterQueries.createClusterMemberLoanApplication, [ generalLoanApplicationDetails.loan_id, 
      cluster.cluster_id, cluster.name, user.user_id, body.sharing_type, parseFloat(body.amount), Number(body.duration_in_months), 
      parseFloat(body.amount), Number(body.duration_in_months), parseFloat(body.total_amount), true ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: initiated cluster loan initiator application in the db 
    checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
    const userLoanDiscount = {
      interest_rate_type: 'fixed',
      interest_rate_value: parseFloat(privateClusterFixedInterestRateDetails.value)
    };
    const payload = await ClusterPayload.checkClusterUserEligibilityPayload(user, body, userDefaultAccountDetails, initiatorLoanApplicationDetails, userEmploymentDetails, 
      userBvn, userMonoId, userLoanDiscount, 'private', userMinimumAllowableAMount, userMaximumAllowableAmount, previousLoanCount, previouslyDefaultedCount);
    const result = await loanApplicationEligibilityCheck(payload);
    if (result.status !== 200) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status check failed 
      checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
      await processNoneData(clusterQueries.deleteClusterMemberLoanApplication, [ initiatorLoanApplicationDetails.member_loan_id, user.user_id ]);
      await processNoneData(clusterQueries.deleteGeneralClusterLoanApplication, [ initiatorLoanApplicationDetails.loan_id, user.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user just initiated cluster loan application deleted 
      checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
      if (result.status >= 500 || result.response.status >= 500) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: returned response from underwriting is of a 500 plus status 
        checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Failed Loan Application', adminNotification.loanApplicationDownTime(), 
            [ `${user.first_name} ${user.last_name}` ], 'failed-loan-application');
        });
        userActivityTracking(req.user.user_id, 95, 'fail');
        return ApiResponse.error(res, enums.UNDERWRITING_SERVICE_NOT_AVAILABLE, enums.HTTP_SERVICE_UNAVAILABLE, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
      }
      if (result.response.data.message === 'Service unavailable loan application can\'t be completed. Please try again later.') {
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Failed Loan Application', adminNotification.loanApplicationDownTime(), 
            [ `${user.first_name} ${user.last_name}` ], 'failed-loan-application');
        });
      }
      userActivityTracking(req.user.user_id, 95, 'fail');
      return ApiResponse.error(res, result.response.data.message, result.response.status, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }
    const { data } = result;
    if (data.final_decision === 'DECLINED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: initiating user cluster loan eligibility status shows user is not eligible for loan 
      checkClusterAdminClusterLoanEligibility.controllers.loan.js`);
      const declinedDecisionPayload = ClusterPayload.processDeclinedClusterLoanDecisionUpdatePayload(data, body);
      await processOneOrNoneData(clusterQueries.updateUserDeclinedDecisionClusterLoanApplication, declinedDecisionPayload);
      const updatedClusterLoanDetails = await processOneOrNoneData(clusterQueries.updateDeclinedDecisionGeneralClusterLoanApplication, 
        [ initiatorLoanApplicationDetails.loan_id, 'declined', 'cluster loan initiator did not qualify for loan facility', parseFloat(body.total_amount) ]);
      const returnData = await ClusterPayload.clusterLoanApplicationDeclinedDecisionResponse(user, initiatorLoanApplicationDetails, 
        updatedClusterLoanDetails.status, 'DECLINED');
      sendClusterNotification(user, cluster, { is_admin: true }, `${user.first_name} ${user.last_name} initiates cluster loan application`, 'loan-application', {});
      sendClusterNotification(user, cluster, { is_admin: true }, `${user.first_name} ${user.last_name} loan application declined`, 'loan-application-eligibility', {});
      userActivityTracking(req.user.user_id, 95, 'fail');
      userActivityTracking(req.user.user_id, 99, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_DECLINED_DECISION, enums.HTTP_OK, returnData);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user cluster loan eligibility status shows user is eligible for loan 
    checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
    const [ clusterMembersToken, otherClusterMembers ] = await collateUsersFcmTokensExceptAuthenticatedUser(cluster.members, user.user_id);
    const memberLoanAmount = body.sharing_type === 'equal' ? (parseFloat(body.total_amount)) / parseFloat(cluster.members.length) : 0;
    await otherClusterMembers.map(async(member) => {
      const memberLoanApplication = await processOneOrNoneData(clusterQueries.createClusterMemberLoanApplication, [ generalLoanApplicationDetails.loan_id, cluster.cluster_id, 
        cluster.name, member.user_id, body.sharing_type, parseFloat(memberLoanAmount), Number(body.duration_in_months), 
        parseFloat(memberLoanAmount), Number(body.duration_in_months), parseFloat(body.total_amount), false ]);
      sendUserPersonalNotification(member, `Cluster ${cluster.name} loan application request`, PersonalNotifications.initiateClusterLoan(user, cluster), 
        'cluster-loan-request', { generalLoanApplicationDetails, memberLoanApplication });
      return member;
    });
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: other cluster members loan created in the db and personal notification sent 
    checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
    sendMulticastPushNotification(PushNotifications.initiateClusterLoanApplication(user, cluster), clusterMembersToken, 'cluster-loan-request', cluster.cluster_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: multicast push notification sent to all cluster members successfully 
    checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
    const totalFees = (parseFloat(data.fees.processing_fee) + parseFloat(data.fees.insurance_fee) + parseFloat(data.fees.advisory_fee));
    const totalMonthlyRepayment = (parseFloat(data.monthly_repayment) * Number(data.loan_duration_in_month));
    const totalInterestAmount = data.max_approval === null ? parseFloat(totalMonthlyRepayment) - parseFloat(data.loan_amount) :
      parseFloat(totalMonthlyRepayment) - parseFloat(data.max_approval);
    const totalAmountRepayable = parseFloat(totalMonthlyRepayment) + parseFloat(totalFees);
    if (data.final_decision === 'MANUAL') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status would be subjected to manual approval 
      checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
      const manualDecisionPayload = ClusterPayload.processClusterLoanDecisionUpdatePayload(data, totalAmountRepayable, totalInterestAmount, 'in review', body);
      const updatedClusterLoanDetails = await processOneOrNoneData(clusterQueries.updateUserManualOrApprovedDecisionClusterLoanApplication, manualDecisionPayload);
      await processOneOrNoneData(clusterQueries.updateClusterLoanApplicationClusterInterest, [ generalLoanApplicationDetails.loan_id, data.pricing_band ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: latest cluster loan details updated checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
      const offerLetterData = await generateOfferLetterPDF(user, updatedClusterLoanDetails);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan offer letter generated checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
      await processNoneData(clusterQueries.updateClusterLoanOfferLetter, [ updatedClusterLoanDetails.member_loan_id, user.user_id, offerLetterData.Location.trim() ]);
      const returnData = await ClusterPayload.clusterLoanApplicationApprovalDecisionResponse(data, updatedClusterLoanDetails, totalAmountRepayable, totalInterestAmount, user, 
        updatedClusterLoanDetails.status, 'MANUAL', offerLetterData.Location.trim());
      sendClusterNotification(user, cluster, { is_admin: true }, `${user.first_name} ${user.last_name} initiates cluster loan application`, 'loan-application', {});
      sendClusterNotification(user, cluster, { is_admin: true }, `${user.first_name} ${user.last_name} cluster loan application subjected to manual approval`, 
        'loan-application-eligibility', {});
      sendMulticastPushNotification(`${user.first_name} ${user.last_name} cluster loan application subjected to manual approval`, clusterMembersToken, 
        'cluster-loan-decision', cluster.cluster_id);
      admins.map(async(admin) => {
        const data = {
          email: admin.email,
          loanUser: `${user.first_name} ${user.last_name}`,
          type: 'a cluster',
          first_name: admin.first_name
        };
        await AdminMailService('Manual Loan Approval Required', 'manualLoanApproval', { ...data });
        sendNotificationToAdmin(admin.admin_id, 'Manual Approval Required', adminNotification.clusterLoanApplicationApproval(), 
          [ `${user.first_name} ${user.last_name}` ], 'manual-approval');
      });
      userActivityTracking(req.user.user_id, 95, 'success');
      userActivityTracking(req.user.user_id, 100, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_MANUAL_DECISION, enums.HTTP_OK, returnData);
    }
    if (data.final_decision === 'APPROVED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user cluster loan eligibility status passes and user is eligible for automatic loan approval
      checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
      const approvedDecisionPayload = ClusterPayload.processClusterLoanDecisionUpdatePayload(data, totalAmountRepayable, totalInterestAmount, 'approved', body);
      const updatedClusterLoanDetails = await processOneOrNoneData(clusterQueries.updateUserManualOrApprovedDecisionClusterLoanApplication, approvedDecisionPayload);
      await processOneOrNoneData(clusterQueries.updateClusterLoanApplicationClusterInterest, [ generalLoanApplicationDetails.loan_id, data.pricing_band ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: latest cluster loan details updated checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
      const offerLetterData = await generateOfferLetterPDF(user, updatedClusterLoanDetails);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan offer letter generated checkClusterAdminClusterLoanEligibility.controllers.cluster.js`);
      await processNoneData(clusterQueries.updateClusterLoanOfferLetter, [ updatedClusterLoanDetails.member_loan_id, user.user_id, offerLetterData.Location.trim() ]);
      const returnData = await ClusterPayload.clusterLoanApplicationApprovalDecisionResponse(data, updatedClusterLoanDetails, totalAmountRepayable, totalInterestAmount, user, 
        updatedClusterLoanDetails.status, 'APPROVED', offerLetterData.Location.trim());
      sendClusterNotification(user, cluster, { is_admin: true }, `${user.first_name} ${user.last_name} initiates cluster loan application`, 'loan-application', {});
      sendClusterNotification(user, cluster, { is_admin: true }, `${user.first_name} ${user.last_name} cluster loan application approved`, 'loan-application-eligibility', {});
      sendMulticastPushNotification(`${user.first_name} ${user.last_name} cluster loan application approved`, clusterMembersToken, 
        'cluster-loan-decision', cluster.cluster_id);
      userActivityTracking(req.user.user_id, 95, 'success');
      userActivityTracking(req.user.user_id, 101, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_APPROVED_DECISION, enums.HTTP_OK, returnData);
    }
  } catch (error) {
    userActivityTracking(req.user.user_id, 95, 'fail');
    error.label = enums.CHECK_CLUSTER_ADMIN_CLUSTER_LOAN_ELIGIBILITY_CONTROLLER;
    logger.error(`checking cluster admin loan application eligibility failed::${enums.CHECK_CLUSTER_ADMIN_CLUSTER_LOAN_ELIGIBILITY_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * user renegotiates requesting cluster loan amount
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of cancelled loan
 * @memberof ClusterController
 */
export const processClusterLoanRenegotiation = async(req, res, next) => {
  try {
    const { user, existingLoanApplication, body } = req;
    body.new_loan_duration_in_month = existingLoanApplication.loan_tenor_in_months;
    const result = await loanApplicationRenegotiation(body, user, existingLoanApplication);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan renegotiation processing result returned 
    processClusterLoanRenegotiation.controllers.cluster.js`);
    if (result.status !== 200) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan renegotiation processing does not return success response from underwriting service 
      processClusterLoanRenegotiation.controllers.cluster.js`);
      if (result.status >= 500 || result.response.status >= 500) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: returned response from underwriting is of a 500 plus status 
        processClusterLoanRenegotiation.controllers.cluster.js`);
        userActivityTracking(req.user.user_id, 74, 'fail');
        return ApiResponse.error(res, enums.UNDERWRITING_SERVICE_NOT_AVAILABLE, enums.HTTP_SERVICE_UNAVAILABLE, enums.PROCESS_CLUSTER_LOAN_RENEGOTIATION_CONTROLLER);
      }
      userActivityTracking(req.user.user_id, 74, 'fail');
      return ApiResponse.error(res, result.response.data.message, result.response.status, enums.PROCESS_CLUSTER_LOAN_RENEGOTIATION_CONTROLLER);
    }
    const { data } = result;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan renegotiation processing returns success response from underwriting service
    processClusterLoanRenegotiation.controllers.cluster.js`);
    const totalFees = (parseFloat(data.fees.processing_fee) + parseFloat(data.fees.insurance_fee) + parseFloat(data.fees.advisory_fee));
    const totalMonthlyRepayment = (parseFloat(data.monthly_repayment) * Number(body.new_loan_duration_in_month));
    const totalInterestAmount = parseFloat(totalMonthlyRepayment) - parseFloat(body.new_loan_amount);
    const totalAmountRepayable = parseFloat(totalMonthlyRepayment) + parseFloat(totalFees);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: total interest amount and total amount repayable calculated 
    processClusterLoanRenegotiation.controllers.cluster.js`);
    const renegotiationPayload = await ClusterPayload.clusterLoanRenegotiationPayload(user, body, existingLoanApplication, data);
    const updateRenegotiationPayload = await ClusterPayload.clusterLoanApplicationRenegotiationPayload(data, totalAmountRepayable, totalInterestAmount, 
      body, existingLoanApplication);
    const [ , updatedClusterLoanDetails ] = await Promise.all([
      processOneOrNoneData(clusterQueries.createClusterLoanRenegotiationDetails, renegotiationPayload),
      processOneOrNoneData(clusterQueries.updateClusterLoanApplicationWithRenegotiation, updateRenegotiationPayload)
    ]);
    const offerLetterData = await generateOfferLetterPDF(user, updatedClusterLoanDetails);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan offer letter generated processClusterLoanRenegotiation.controllers.cluster.js`);
    await processNoneData(clusterQueries.updateClusterLoanOfferLetter, [ updatedClusterLoanDetails.member_loan_id, user.user_id, offerLetterData.Location.trim() ]);
    const returningData = await ClusterPayload.clusterLoanApplicationRenegotiationResponse(data, totalAmountRepayable, totalInterestAmount, user, 
      updatedClusterLoanDetails, offerLetterData.Location.trim(), body);
    userActivityTracking(req.user.user_id, 74, 'success');
    return ApiResponse.success(res, enums.LOAN_RENEGOTIATION_SUCCESSFUL_SUCCESSFULLY, enums.HTTP_OK, returningData);
  } catch (error) {
    userActivityTracking(req.user.user_id, 74, 'fail');
    error.label = enums.PROCESS_CLUSTER_LOAN_RENEGOTIATION_CONTROLLER;
    logger.error(`processing cluster loan renegotiation failed::${enums.PROCESS_CLUSTER_LOAN_RENEGOTIATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch cluster member cluster loan details by member loan id
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a personal loan
 * @memberof ClusterController
 */
export const fetchClusterMemberLoanDetails = async(req, res, next) => {
  try {
    const { user, existingLoanApplication } = req;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: details of user cluster member cluster loan prepared 
    fetchClusterMemberLoanDetails.controllers.cluster.js`);
    const [ nextRepaymentDetails ] = await processAnyData(clusterQueries.fetchClusterLoanNextRepaymentDetails, [ existingLoanApplication.member_loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user next cluster loan repayment details fetched fetchClusterMemberLoanDetails.controllers.cluster.js`);
    const clusterLoanRepaymentDetails = await processAnyData(clusterQueries.fetchClusterLoanRepaymentSchedule, [ existingLoanApplication.member_loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user cluster loan repayment details fetched fetchClusterMemberLoanDetails.controllers.cluster.js`);
    const selectedStatuses = [ 'ongoing', 'over due', 'completed' ];
    const next_repayment_date = (!selectedStatuses.includes(existingLoanApplication.status)) ? dayjs().add(30, 'days').format('MMM DD, YYYY') : 
      dayjs(nextRepaymentDetails.proposed_payment_date).format('MMM DD, YYYY');
    existingLoanApplication.next_repayment_date = next_repayment_date;
    const data = {
      nextClusterLoanRepaymentDetails: nextRepaymentDetails,
      clusterLoanDetails: existingLoanApplication,
      clusterLoanRepaymentDetails
    };
    return ApiResponse.success(res, enums.USER_LOAN_DETAILS_FETCHED_SUCCESSFUL('cluster'), enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_CLUSTER_MEMBER_LOAN_DETAILS_CONTROLLER;
    logger.error(`fetching details of a user cluster loan failed::${enums.FETCH_CLUSTER_MEMBER_LOAN_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
* check if cluster member is eligible for loan
* @param {Request} req - The request from the endpoint.
* @param {Response} res - The response returned by the method.
* @param {Next} next - Call the next operation.
* @returns { JSON } - A JSON with no data
* @memberof ClusterController
*/
export const checkClusterMemberClusterLoanEligibility = async(req, res, next) => {
  try {
    const { user, body, userEmploymentDetails, userDefaultAccountDetails, existingLoanApplication, 
      userMinimumAllowableAMount, userMaximumAllowableAmount, previousLoanCount } = req;
    const privateClusterFixedInterestRateDetails = await processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'private_cluster_fixed_interest_rate' ]);
    const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'loan application' ]);
    const userMonoId = userDefaultAccountDetails.mono_account_id === null ? '' : userDefaultAccountDetails.mono_account_id;
    const userBvn = await processOneOrNoneData(loanQueries.fetchUserBvn, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user bvn from the db checkClusterMemberClusterLoanEligibility.controllers.cluster.js`);
    const [ userPreviouslyDefaulted ] = await processAnyData(loanQueries.checkIfUserHasPreviouslyDefaultedInLoanRepayment, [ user.user_id ]);
    const previouslyDefaultedCount = parseFloat(userPreviouslyDefaulted.count);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user previously defaulted in loan repayment 
    checkClusterMemberClusterLoanEligibility.controllers.cluster.js`);
    const cluster = await processAnyData(clusterQueries.checkIfClusterExists, [ existingLoanApplication.cluster_id ]);
    const clusterMembers = await processAnyData(clusterQueries.fetchActiveClusterMembers, [ cluster.cluster_id ]);
    const userLoanDiscount = {
      interest_rate_type: 'fixed',
      interest_rate_value: parseFloat(privateClusterFixedInterestRateDetails.value)
    };
    const payload = await ClusterPayload.checkClusterUserEligibilityPayload(user, body, userDefaultAccountDetails, existingLoanApplication, userEmploymentDetails, 
      userBvn, userMonoId, userLoanDiscount, 'private', userMinimumAllowableAMount, userMaximumAllowableAmount, previousLoanCount, previouslyDefaultedCount);
    const result = await loanApplicationEligibilityCheck(payload);
    if (result.status !== 200) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status check failed 
      checkClusterMemberClusterLoanEligibility.controllers.cluster.js`);
      if (result.status >= 500 || result.response.status >= 500) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: returned response from underwriting is of a 500 plus status 
        checkClusterMemberClusterLoanEligibility.controllers.cluster.js`);
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Failed Loan Application', adminNotification.loanApplicationDownTime(), 
            [ `${user.first_name} ${user.last_name}` ], 'failed-loan-application');
        });
        userActivityTracking(req.user.user_id, 98, 'fail');
        return ApiResponse.error(res, enums.UNDERWRITING_SERVICE_NOT_AVAILABLE, enums.HTTP_SERVICE_UNAVAILABLE, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
      }
      if (result.response.data.message === 'Service unavailable loan application can\'t be completed. Please try again later.') {
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Failed Loan Application', adminNotification.loanApplicationDownTime(), 
            [ `${user.first_name} ${user.last_name}` ], 'failed-loan-application');
        });
      }
      userActivityTracking(req.user.user_id, 98, 'fail');
      return ApiResponse.error(res, result.response.data.message, result.response.status, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }
    const [ clusterMembersToken ] = await collateUsersFcmTokensExceptAuthenticatedUser(clusterMembers, user.user_id);
    const { data } = result;
    if (data.final_decision === 'DECLINED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: initiating user cluster loan eligibility status shows user is not eligible for loan 
      checkClusterMemberClusterLoanEligibility.controllers.loan.js`);
      const declinedDecisionPayload = ClusterPayload.processDeclinedClusterLoanDecisionUpdatePayload(data, body);
      await processOneOrNoneData(clusterQueries.updateUserDeclinedDecisionClusterLoanApplication, declinedDecisionPayload);
      const returnData = await ClusterPayload.clusterLoanApplicationDeclinedDecisionResponse(user, existingLoanApplication, 
        'declined', 'DECLINED');
      sendClusterNotification(user, cluster, { is_admin: false }, `${user.first_name} ${user.last_name} cluster loan application declined`, 
        'loan-application-eligibility', {});
      sendMulticastPushNotification(`${user.first_name} ${user.last_name} cluster loan application declined`, clusterMembersToken, 
        'cluster-loan-decision', cluster.cluster_id);
      userActivityTracking(req.user.user_id, 98, 'fail');
      userActivityTracking(req.user.user_id, 99, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_DECLINED_DECISION, enums.HTTP_OK, returnData);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user cluster loan eligibility status shows user is eligible for loan 
    checkClusterMemberClusterLoanEligibility.controllers.cluster.js`);
    const totalFees = (parseFloat(data.fees.processing_fee) + parseFloat(data.fees.insurance_fee) + parseFloat(data.fees.advisory_fee));
    const totalMonthlyRepayment = (parseFloat(data.monthly_repayment) * Number(data.loan_duration_in_month));
    const totalInterestAmount = data.max_approval === null ? parseFloat(totalMonthlyRepayment) - parseFloat(data.loan_amount) :
      parseFloat(totalMonthlyRepayment) - parseFloat(data.max_approval);
    const totalAmountRepayable = parseFloat(totalMonthlyRepayment) + parseFloat(totalFees);
    if (data.final_decision === 'MANUAL') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status would be subjected to manual approval 
      checkClusterMemberClusterLoanEligibility.controllers.cluster.js`);
      const manualDecisionPayload = ClusterPayload.processClusterLoanDecisionUpdatePayload(data, totalAmountRepayable, totalInterestAmount, 'in review', body);
      const updatedClusterLoanDetails = await processOneOrNoneData(clusterQueries.updateUserManualOrApprovedDecisionClusterLoanApplication, manualDecisionPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: latest cluster loan details updated checkClusterMemberClusterLoanEligibility.controllers.cluster.js`);
      const offerLetterData = await generateOfferLetterPDF(user, updatedClusterLoanDetails);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan offer letter generated checkClusterMemberClusterLoanEligibility.controllers.cluster.js`);
      await processNoneData(clusterQueries.updateClusterLoanOfferLetter, [ updatedClusterLoanDetails.member_loan_id, user.user_id, offerLetterData.Location.trim() ]);
      const returnData = await ClusterPayload.clusterLoanApplicationApprovalDecisionResponse(data, updatedClusterLoanDetails, totalAmountRepayable, totalInterestAmount, user, 
        updatedClusterLoanDetails.status, 'MANUAL', offerLetterData.Location.trim());
      sendClusterNotification(user, cluster, { is_admin: false }, `${user.first_name} ${user.last_name} cluster loan application subjected to manual approval`, 
        'loan-application-eligibility', {});
      sendMulticastPushNotification(`${user.first_name} ${user.last_name} cluster loan application subjected to manual approval`, clusterMembersToken, 
        'cluster-loan-decision', cluster.cluster_id);
      admins.map(async(admin) => {
        const data = {
          email: admin.email,
          loanUser: `${user.first_name} ${user.last_name}`,
          type: 'a cluster',
          first_name: admin.first_name
        };
        await AdminMailService('Manual Loan Approval Required', 'manualLoanApproval', { ...data });
        sendNotificationToAdmin(admin.admin_id, 'Manual Approval Required', adminNotification.clusterLoanApplicationApproval(), 
          [ `${user.first_name} ${user.last_name}` ], 'manual-approval');
      });
      userActivityTracking(req.user.user_id, 98, 'success');
      userActivityTracking(req.user.user_id, 100, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_MANUAL_DECISION, enums.HTTP_OK, returnData);
    }
    if (data.final_decision === 'APPROVED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user cluster loan eligibility status passes and user is eligible for automatic loan approval
      checkClusterMemberClusterLoanEligibility.controllers.cluster.js`);
      const approvedDecisionPayload = ClusterPayload.processClusterLoanDecisionUpdatePayload(data, totalAmountRepayable, totalInterestAmount, 'approved', body);
      const updatedClusterLoanDetails = await processOneOrNoneData(clusterQueries.updateUserManualOrApprovedDecisionClusterLoanApplication, approvedDecisionPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: latest cluster loan details updated checkClusterMemberClusterLoanEligibility.controllers.cluster.js`);
      const offerLetterData = await generateOfferLetterPDF(user, updatedClusterLoanDetails);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan offer letter generated checkClusterMemberClusterLoanEligibility.controllers.cluster.js`);
      await processNoneData(clusterQueries.updateClusterLoanOfferLetter, [ updatedClusterLoanDetails.member_loan_id, user.user_id, offerLetterData.Location.trim() ]);
      const returnData = await ClusterPayload.clusterLoanApplicationApprovalDecisionResponse(data, updatedClusterLoanDetails, totalAmountRepayable, totalInterestAmount, user, 
        updatedClusterLoanDetails.status, 'APPROVED', offerLetterData.Location.trim());
      sendClusterNotification(user, cluster, { is_admin: false }, `${user.first_name} ${user.last_name} cluster loan application approved`, 
        'loan-application-eligibility', {});
      sendMulticastPushNotification(`${user.first_name} ${user.last_name} cluster loan application approved`, clusterMembersToken, 
        'cluster-loan-decision', cluster.cluster_id);
      userActivityTracking(req.user.user_id, 98, 'success');
      userActivityTracking(req.user.user_id, 101, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_APPROVED_DECISION, enums.HTTP_OK, returnData);
    }
  } catch (error) {
    userActivityTracking(req.user.user_id, 98, 'fail');
    error.label = enums.CHECK_CLUSTER_ADMIN_CLUSTER_LOAN_ELIGIBILITY_CONTROLLER;
    logger.error(`checking cluster member loan application eligibility failed::${enums.CHECK_CLUSTER_ADMIN_CLUSTER_LOAN_ELIGIBILITY_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * cluster member accepts or declines loan application
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a personal loan
 * @memberof ClusterController
 */
export const clusterMemberLoanDecision = async(req, res, next) => {
  const { user, existingLoanApplication, body } = req;
  const activityType = body === 'accept' ? 96 : 97;
  try {
    const isAdmin = existingLoanApplication.is_loan_initiator ? true : false;
    const cluster = await processAnyData(clusterQueries.checkIfClusterExists, [ existingLoanApplication.cluster_id ]);
    const clusterMembers = await processAnyData(clusterQueries.fetchActiveClusterMembers, [ cluster.cluster_id ]);
    const [ clusterMembersToken ] = await collateUsersFcmTokensExceptAuthenticatedUser(clusterMembers, user.user_id);
    const allClusterMembersToken = await collateUsersFcmTokens(clusterMembers);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster details fetched successfully clusterMemberLoanDecision.controllers.cluster.js`);
    if (body.decision !== 'decline' && existingLoanApplication.is_taken_loan_request_decision) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan decision previously taken lusterMemberLoanDecision.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, activityType, 'fail');
      return ApiResponse.error(res, enums.USER_ALREADY_TAKEN_CLUSTER_LOAN_DECISION, enums.HTTP_CONFLICT, enums.CLUSTER_MEMBER_LOAN_DECISION_CONTROLLER);
    }
    if (body.decision === 'accept' && existingLoanApplication.status === 'pending') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan eligibility has not run yet lusterMemberLoanDecision.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, activityType, 'fail');
      return ApiResponse.error(res, enums.USER_NO_ELIGIBILITY_CHECK_RESULT_CLUSTER_LOAN_DECISION, enums.HTTP_BAD_REQUEST, enums.CLUSTER_MEMBER_LOAN_DECISION_CONTROLLER);
    }
    if (body.decision === 'decline') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan decision is decline clusterMemberLoanDecision.controllers.cluster.js`);
      await processOneOrNoneData(clusterQueries.declineClusterMemberLoanApplicationDecision, [ existingLoanApplication.member_loan_id ]);
      sendClusterNotification(user, cluster, { is_admin: isAdmin }, `${user.first_name} ${user.last_name} cancelled own loan application`, 'loan-application-decision', {});
      sendMulticastPushNotification(`${user.first_name} ${user.last_name} cancelled own loan application`, clusterMembersToken, 
        'cancel-cluster-loan', cluster.cluster_id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan cancelled by cluster member and cluster notification is sent 
      clusterMemberLoanDecision.controllers.cluster.js`);
      if (existingLoanApplication.is_loan_initiator) {
        await Promise.all([
          processAnyData(clusterQueries.cancelAllClusterMembersLoanApplication, [ existingLoanApplication.loan_id ]),
          processAnyData(clusterQueries.cancelGeneralLoanApplication, [ existingLoanApplication.loan_id, user.user_id ])
        ]);
        sendClusterNotification(user, cluster, { is_admin: isAdmin }, `${user.first_name} ${user.last_name} cancelled cluster loan application for all cluster members`, 
          'loan-application-decision', {});
        sendMulticastPushNotification(`${user.first_name} ${user.last_name} cancelled cluster loan application for all cluster members`, clusterMembersToken, 
          'cancel-cluster-loan', cluster.cluster_id);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan cancelled for all cluster members and cluster notification is sent 
        clusterMemberLoanDecision.controllers.cluster.js`);
      }
      const outstandingLoanDecision = await processAnyData(clusterQueries.checkForOutstandingClusterLoanDecision, [ existingLoanApplication.loan_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if loan can be disbursed by cluster admin clusterMemberLoanDecision.controllers.cluster.js`);
      if (outstandingLoanDecision.length > 0) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan can not yet be disbursed by cluster admin clusterMemberLoanDecision.controllers.cluster.js`);
        userActivityTracking(req.user.user_id, activityType, 'success');
        return ApiResponse.success(res, enums.LOAN_APPLICATION_CANCELLING_SUCCESSFUL, enums.HTTP_OK);
      }
      await processOneOrNoneData(clusterQueries.updateGeneralLoanApplicationCanDisburseLoan, [ existingLoanApplication.loan_id ]);
      sendClusterNotification(user, cluster, { is_admin: isAdmin }, 'Cluster loan decisions concluded, admin can proceed to disburse loan', 
        'loan-application-can-disburse', {});
      sendMulticastPushNotification('Cluster loan decisions concluded, admin can proceed to disburse loan', allClusterMembersToken, 
        'conclude-cluster-loan', cluster.cluster_id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan can now be disbursed by cluster admin and notification sent 
      clusterMemberLoanDecision.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, activityType, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_CANCELLING_SUCCESSFUL, enums.HTTP_OK);
    }
    await processOneOrNoneData(clusterQueries.acceptClusterMemberLoanApplication, [ existingLoanApplication.member_loan_id ]);
    sendClusterNotification(user, cluster, { is_admin: isAdmin }, `${user.first_name} ${user.last_name} accepted own loan application`, 'loan-application-decision', {});
    sendMulticastPushNotification(`${user.first_name} ${user.last_name} accepted own loan application`, clusterMembersToken, 
      'accept-cluster-loan', cluster.cluster_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan accepted by cluster member and cluster notification is sent 
      clusterMemberLoanDecision.controllers.cluster.js`);
    const outstandingLoanDecision = await processAnyData(clusterQueries.checkForOutstandingClusterLoanDecision, [ existingLoanApplication.loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if loan can be disbursed by cluster admin clusterMemberLoanDecision.controllers.cluster.js`);
    if (outstandingLoanDecision.length > 0) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan can not yet be disbursed by cluster admin clusterMemberLoanDecision.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, activityType, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_ACCEPTANCE_SUCCESSFUL, enums.HTTP_OK);
    }
    await processOneOrNoneData(clusterQueries.updateGeneralLoanApplicationCanDisburseLoan, [ existingLoanApplication.loan_id ]);
    sendClusterNotification(user, cluster, { is_admin: isAdmin }, 'Cluster loan decisions concluded, admin can proceed to disburse loan', 
      'loan-application-can-disburse', {});
    sendMulticastPushNotification('Cluster loan decisions concluded, admin can proceed to disburse loan', allClusterMembersToken, 
      'conclude-cluster-loan', cluster.cluster_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan can now be disbursed by cluster admin and notification sent 
      clusterMemberLoanDecision.controllers.cluster.js`);
    userActivityTracking(req.user.user_id, activityType, 'success');
    return ApiResponse.success(res, enums.LOAN_APPLICATION_ACCEPTANCE_SUCCESSFUL, enums.HTTP_OK);
  } catch (error) {
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.CLUSTER_MEMBER_LOAN_DECISION_CONTROLLER;
    logger.error(`taking cluster loan decision failed::${enums.CLUSTER_MEMBER_LOAN_DECISION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * initiate cluster loan disbursement to admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of newly activated ongoing loan
 * @memberof ClusterController
 */
export const initiateClusterLoanDisbursement = async(req, res, next) => {
  try {
    const { user, params: { loan_id }, userTransferRecipient, existingLoanApplication, newClusterAmountValues } = req;
    const cluster = await processAnyData(clusterQueries.checkIfClusterExists, [ existingLoanApplication.cluster_id ]);
    const clusterMembers = await processAnyData(clusterQueries.fetchActiveClusterMembers, [ cluster.cluster_id ]);
    const allClusterMembersToken = await collateUsersFcmTokens(clusterMembers);
    const reference = uuidv4();
    await processAnyData(loanQueries.initializeBankTransferPayment, [ user.user_id, existingLoanApplication.amount_requested, 'paystack', reference, 
      'cluster_loan_disbursement', 'requested group cluster loan facility disbursement', loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan payment initialized in the DB initiateClusterLoanDisbursement.controllers.cluster.js`);
    const result = await initiateTransfer(userTransferRecipient, existingLoanApplication, reference);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: transfer initiate via paystack returns response initiateClusterLoanDisbursement.controllers.cluster.js`);
    if (result.status === true && result.message === 'Transfer has been queued') {
      const [ [ updatedLoanDetails ]  ] = await Promise.all([
        processAnyData(clusterQueries.updateProcessingClusterLoanDetails, [ loan_id, newClusterAmountValues.actual_total_loan_amount,
          newClusterAmountValues.actual_total_loan_repayment_amount, newClusterAmountValues.actual_total_loan_interest_amount, 
          newClusterAmountValues.actual_total_loan_monthly_repayment_amount ]),
        processAnyData(clusterQueries.updateClusterMembersProcessingLoanDetails, [ loan_id, newClusterAmountValues.actual_total_loan_amount ])
      ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan details status set to processing in the DB 
      initiateClusterLoanDisbursement.controllers.cluster.js`);
      sendClusterNotification(user, cluster, { is_admin: true }, 'Cluster loan disbursement initiated by cluster admin', 
        'loan-application-initiate-disburse', {});
      sendMulticastPushNotification('Cluster loan disbursement initiated by cluster admin', allClusterMembersToken, 
        'initiate-cluster-loan-disbursement', cluster.cluster_id);
      userActivityTracking(req.user.user_id, 44, 'success');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_DISBURSEMENT_INITIATION_SUCCESSFUL, enums.HTTP_OK, { ...updatedLoanDetails , reference });
    }
    if (result.response.status === 400 && result.response.data.message === 'Your balance is not enough to fulfil this request') {
      const data = {
        email: config.SEEDFI_ADMIN_EMAIL_ADDRESS,
        currentBalance: 'Kindly login to confirm'
      };
      await AdminMailService('Insufficient Paystack Balance', 'insufficientBalance', { ...data });
    }
    if (result.response.data.message !== 'Your balance is not enough to fulfil this request') {
      userActivityTracking(user.user_id, 44, 'fail');
      return ApiResponse.error(res, result.response.data.message, enums.HTTP_BAD_REQUEST, enums.INITIATE_CLUSTER_LOAN_DISBURSEMENT_CONTROLLER);
    }
    userActivityTracking(req.user.user_id, 44, 'fail');
    return ApiResponse.error(res, enums.USER_PAYSTACK_LOAN_DISBURSEMENT_ISSUES, enums.HTTP_SERVICE_UNAVAILABLE, enums.INITIATE_CLUSTER_LOAN_DISBURSEMENT_CONTROLLER);
  } catch (error) {
    userActivityTracking(req.user.user_id, 44, 'fail');
    error.label = enums.INITIATE_CLUSTER_LOAN_DISBURSEMENT_CONTROLLER;
    logger.error(`initiating loan disbursement failed::${enums.INITIATE_CLUSTER_LOAN_DISBURSEMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * initiate manual cluster loan repayment
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of an initiate paystack payment
 * @memberof ClusterController
 */
export const initiateManualClusterLoanRepayment = async(req, res, next) => {
  const { user, params: { member_loan_id }, existingLoanApplication, query: { payment_type, payment_channel } } = req;
  const activityType = payment_channel === 'card' ? 71: 73;
  try {
    if (existingLoanApplication.status === 'ongoing' || existingLoanApplication.status === 'over due') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan has a status of ${existingLoanApplication.status} so repayment is possible 
      initiateManualClusterLoanRepayment.controllers.cluster.js`);
      const reference = uuidv4();
      const [ nextRepaymentDetails ] = await processAnyData(clusterQueries.fetchClusterLoanNextRepaymentDetails, [ member_loan_id, user.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan next repayment details fetched 
      initiateManualClusterLoanRepayment.controllers.cluster.js`);
      const paymentAmount = payment_type === 'full' ? parseFloat(existingLoanApplication.total_outstanding_amount) : parseFloat(nextRepaymentDetails.total_payment_amount);
      const paystackAmountFormatting = parseFloat(paymentAmount) * 100; // Paystack requires amount to be in kobo for naira payment
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment amount properly formatted initiateManualClusterLoanRepayment.controllers.cluster.js`);
      await processAnyData(loanQueries.initializeBankTransferPayment, [ user.user_id, parseFloat(paymentAmount), 'paystack', reference, 
        `${payment_type}_cluster_loan_repayment`, `user repays out of or all of existing cluster loan facility via ${payment_channel}`, member_loan_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment reference and amount saved in the DB 
      initiateManualClusterLoanRepayment.controllers.cluster.js`);
      const result = payment_channel === 'card' ? await initializeCardPayment(user, paystackAmountFormatting, reference) : 
        await initializeBankTransferPayment(user, paystackAmountFormatting, reference);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment initialize via paystack returns response 
      initiateManualClusterLoanRepayment.controllers.cluster.js`);
      if (result.status === true && result.message.trim().toLowerCase() === 'authorization url created') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack initialized initiateManualClusterLoanRepayment.controllers.loan.js`);
        userActivityTracking(req.user.user_id, activityType, 'success');
        return ApiResponse.success(res, result.message, enums.HTTP_OK, result.data);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack failed to be initialized 
      initiateManualClusterLoanRepayment.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, activityType, 'fail');
      return ApiResponse.error(res, result.message, enums.HTTP_SERVICE_UNAVAILABLE, enums.INITIATE_MANUAL_CLUSTER_LOAN_REPAYMENT_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan has a status of ${existingLoanApplication.status} and repayment is not possible 
    initiateManualClusterLoanRepayment.controllers.cluster.js`);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_STATUS_NOT_FOR_REPAYMENT(existingLoanApplication.status), 
      enums.HTTP_BAD_REQUEST, enums.INITIATE_MANUAL_CLUSTER_LOAN_REPAYMENT_CONTROLLER);
  } catch (error) {
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.INITIATE_MANUAL_CLUSTER_LOAN_REPAYMENT_CONTROLLER;
    logger.error(`initiating cluster loan repayment failed::${enums.INITIATE_MANUAL_CLUSTER_LOAN_REPAYMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * initiate manual cluster loan repayment via existing card or bank account
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of an initiate paystack payment
 * @memberof ClusterController
 */
export const initiateManualCardOrBankClusterLoanRepayment = async(req, res, next) => {
  const { user, params: { member_loan_id }, existingLoanApplication, query: { payment_type, payment_channel }, userDebitCard, accountDetails } = req;
  const activityType = payment_channel === 'card' ? 71: 73;
  try {
    if (existingLoanApplication.status === 'ongoing' || existingLoanApplication.status === 'over due') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan has a status of ${existingLoanApplication.status} so repayment is possible 
      initiateManualCardOrBankClusterLoanRepayment.controllers.cluster.js`);
      const reference = uuidv4();
      const [ nextRepaymentDetails ] = await processAnyData(clusterQueries.fetchClusterLoanNextRepaymentDetails, [ member_loan_id, user.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan next repayment details fetched 
      initiateManualCardOrBankClusterLoanRepayment.controllers.cluster.js`);
      const paymentAmount = payment_type === 'full' ? parseFloat(existingLoanApplication.total_outstanding_amount) : parseFloat(nextRepaymentDetails.total_payment_amount);
      const paystackAmountFormatting = parseFloat(paymentAmount) * 100; // Paystack requires amount to be in kobo for naira payment
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment amount properly formatted 
      initiateManualCardOrBankClusterLoanRepayment.controllers.cluster.js`);
      await processAnyData(loanQueries.initializeBankTransferPayment, [ user.user_id, parseFloat(paymentAmount), 'paystack', reference, 
        `${payment_type}_cluster_loan_repayment`, `user repays part of or all of existing cluster loan facility via ${payment_channel}`, member_loan_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment reference and amount saved in the DB 
      initiateManualCardOrBankClusterLoanRepayment.controllers.cluster.js`);
      const result = payment_channel === 'card' ? await initializeDebitCarAuthChargeForLoanRepayment(user, paystackAmountFormatting, reference, userDebitCard) : 
        await initializeBankAccountChargeForLoanRepayment(user, paystackAmountFormatting, reference, accountDetails);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment initialize via paystack returns response 
      initiateManualCardOrBankClusterLoanRepayment.controllers.cluster.js`);
      if (result.status === true && result.message.trim().toLowerCase() === 'charge attempted' && (result.data.status === 'success' || result.data.status === 'send_otp')) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack initialized 
        initiateManualCardOrBankClusterLoanRepayment.controllers.cluster.js`);
        userActivityTracking(req.user.user_id, activityType, 'success');
        return ApiResponse.success(res, result.message, enums.HTTP_OK, { 
          user_id: user.user_id, 
          amount: parseFloat(paymentAmount).toFixed(2), 
          payment_type, 
          payment_channel,
          reference: result.data.reference,
          status: result.data.status,
          display_text: result.data.display_text || ''
        });
      }
      if (result.response && result.response.status === 400) {
        userActivityTracking(req.user.user_id, activityType, 'fail');
        return ApiResponse.error(res, result.response.data.message, enums.HTTP_BAD_REQUEST, enums.INITIATE_MANUAL_CARD_OR_BANK_CLUSTER_LOAN_REPAYMENT_CONTROLLER);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack failed to be initialized 
      initiateManualCardOrBankClusterLoanRepayment.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, activityType, 'fail');
      return ApiResponse.error(res, result.message, enums.HTTP_SERVICE_UNAVAILABLE, enums.INITIATE_MANUAL_CARD_OR_BANK_CLUSTER_LOAN_REPAYMENT_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan has a status of ${existingLoanApplication.status} and repayment is not possible 
    initiateManualCardOrBankClusterLoanRepayment.controllers.cluster.js`);
    userActivityTracking(req.user.user_id, activityType, 'fail');
    return ApiResponse.error(res, enums.LOAN_APPLICATION_STATUS_NOT_FOR_REPAYMENT(existingLoanApplication.status), 
      enums.HTTP_BAD_REQUEST, enums.INITIATE_MANUAL_CARD_OR_BANK_CLUSTER_LOAN_REPAYMENT_CONTROLLER);
  } catch (error) {
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.INITIATE_MANUAL_CARD_OR_BANK_CLUSTER_LOAN_REPAYMENT_CONTROLLER;
    logger.error(`initiating cluster loan repayment manually using saved card or bank account 
    failed::${enums.INITIATE_MANUAL_CARD_OR_BANK_CLUSTER_LOAN_REPAYMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch a cluster's current active loan application
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the cluster current loans
 * @memberof ClusterController
 */
export const fetchCurrentClusterLoan = async(req, res, next) => {
  try {
    const { params: { cluster_id }, user } = req;
    const clusterLoans = await processAnyData(clusterQueries.fetchClusterActiveLoans, [ cluster_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched cluster active loan in the DB fetchCurrentClusterLoan.users.controllers.cluster.js`);
    return ApiResponse.success(res, enums.CLUSTER_CURRENT_LOAN_FETCHED_SUCCESSFULLY, enums.HTTP_OK, clusterLoans);
  } catch (error) {
    error.label = enums.FETCH_CURRENT_CLUSTER_LOAN_CONTROLLER;
    logger.error(`fetching current cluster active loans failed::${enums.FETCH_CURRENT_CLUSTER_LOAN_CONTROLLER}`, error.message);
    return next(error);
  }  
};

/**
 * fetch a cluster loan summary
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the cluster loan summary
 * @memberof ClusterController
 */
export const fetchClusterLoanSummary = async(req, res, next) => {
  try {
    const { params: { cluster_id, loan_id }, user } = req;
    const clusterLoanSummary = await processAnyData(clusterQueries.fetchClusterLoanSummary, [ cluster_id, loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched cluster loan summary from the DB 
    fetchClusterLoanSummary.users.controllers.cluster.js`);
    return ApiResponse.success(res, enums.CLUSTER_LOAN_SUMMARY_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, clusterLoanSummary);
  } catch (error) {
    error.label = enums.FETCH_CLUSTER_LOAN_SUMMARY_CONTROLLER;
    logger.error(`fetching cluster loan summary details failed::${enums.FETCH_CLUSTER_LOAN_SUMMARY_CONTROLLER}`, error.message);
    return next(error);
  }  
};

/**
 * process the summary of rescheduled cluster loan and return
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a cluster loan
 * @memberof ClusterController
 */
export const clusterLoanReschedulingSummary = async(req, res, next) => {
  try {
    const { user, existingLoanApplication, loanRescheduleExtensionDetails } = req;
    const allowableRescheduleCount = await processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'allowable_personal_loan_rescheduling_count' ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan rescheduling allowable count fetched clusterLoanReschedulingSummary.controllers.cluster.js`);
    if (Number(existingLoanApplication.reschedule_count >= Number(allowableRescheduleCount.value))) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's rescheduling count equals or exceeds system allowable rescheduling count 
      clusterLoanReschedulingSummary.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, 94, 'fail');
      return ApiResponse.error(res, enums.LOAN_RESCHEDULING_NOT_ALLOWED(Number(existingLoanApplication.reschedule_count)), enums.HTTP_FORBIDDEN, 
        enums.CLUSTER_LOAN_RESCHEDULING_SUMMARY_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's rescheduling count is less than system allowable rescheduling count 
      clusterLoanReschedulingSummary.controllers.cluster.js`);
    const [ nextRepayment ] = await processAnyData(clusterQueries.fetchClusterLoanNextRepaymentDetails, [ existingLoanApplication.member_loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's next cluster loan repayment details fetched 
    clusterLoanReschedulingSummary.controllers.cluster.js`);
    const returnData = await ClusterPayload.clusterLoanReschedulingRequestSummaryResponse(existingLoanApplication, user, loanRescheduleExtensionDetails, nextRepayment);
    const rescheduleRequest = await processOneOrNoneData(clusterQueries.createClusterLoanRescheduleRequest, [ existingLoanApplication.cluster_id, 
      existingLoanApplication.member_loan_id, existingLoanApplication.loan_id, user.user_id, loanRescheduleExtensionDetails.extension_in_days ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan reschedule request saved in the DB clusterLoanReschedulingSummary.controllers.cluster.js`);
    userActivityTracking(req.user.user_id, 94, 'success');
    return ApiResponse.success(res, enums.LOAN_RESCHEDULING_SUMMARY_RETURNED_SUCCESSFULLY, enums.HTTP_OK, { ...returnData, reschedule_id: rescheduleRequest.reschedule_id });
  } catch (error) {
    userActivityTracking(req.user.user_id, 94, 'fail');
    error.label = enums.CLUSTER_LOAN_RESCHEDULING_SUMMARY_CONTROLLER;
    logger.error(`fetching cluster loan rescheduling summary failed::${enums.CLUSTER_LOAN_RESCHEDULING_SUMMARY_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * process the cluster loan rescheduling request
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of a cluster loan
 * @memberof ClusterController
 */
export const processClusterLoanRescheduling = async(req, res, next) => {
  try {
    const { user, existingLoanApplication, loanRescheduleRequest } = req;
    const allowableRescheduleCount = await processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'allowable_personal_loan_rescheduling_count' ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan rescheduling allowable count fetched processClusterLoanRescheduling.controllers.cluster.js`);
    if (Number(existingLoanApplication.reschedule_count >= Number(allowableRescheduleCount.value))) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's rescheduling count equals or exceeds system allowable rescheduling count 
      processClusterLoanRescheduling.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, 75, 'fail');
      return ApiResponse.error(res, enums.LOAN_RESCHEDULING_NOT_ALLOWED(Number(existingLoanApplication.reschedule_count)), enums.HTTP_FORBIDDEN, 
        enums.PROCESS_CLUSTER_LOAN_RESCHEDULING_CONTROLLER);
    }
    const userUnpaidClusterRepayments = await processAnyData(clusterQueries.fetchUserUnpaidClusterLoanRepayments, [ existingLoanApplication.member_loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's unpaid repayments fetched processClusterLoanRescheduling.controllers.cluster.js`);
    const [ nextRepayment ] = await processAnyData(clusterQueries.fetchClusterLoanNextRepaymentDetails, [ existingLoanApplication.member_loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's next loan repayment details fetched processClusterLoanRescheduling.controllers.cluster.js`);
    const totalExtensionDays = userUnpaidClusterRepayments.length * Number(loanRescheduleRequest.extension_in_days);
    const newLoanDuration = `${existingLoanApplication.loan_tenor_in_months} month(s), ${totalExtensionDays} day(s)`;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: updated total loan tenor fetched processClusterLoanRescheduling.controllers.cluster.js`);
    await Promise.all([
      userUnpaidClusterRepayments.map((repayment) => {
        processOneOrNoneData(clusterQueries.updateNewClusterLoanRepaymentDate, 
          [ repayment.id, dayjs(repayment.proposed_payment_date).add(Number(loanRescheduleRequest.extension_in_days), 'days') ]);
        return repayment;
      }),
      processOneOrNoneData(clusterQueries.updateClusterLoanWithRescheduleDetails, [ existingLoanApplication.member_loan_id, Number(loanRescheduleRequest.extension_in_days), 
        parseFloat((existingLoanApplication.reschedule_count || 0) + 1), newLoanDuration, totalExtensionDays ]),
      processOneOrNoneData(clusterQueries.updateRescheduleClusterLoanRequestAccepted, [ loanRescheduleRequest.reschedule_id ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan rescheduling details updated successfully 
    processClusterLoanRescheduling.controllers.cluster.js`);
    const data = {
      member_loan_id: existingLoanApplication.member_loan_id, 
      loan_id: existingLoanApplication.loan_id, 
      cluster_id: existingLoanApplication.cluster_id,
      user_id: user.user_id,
      email: user.email,
      first_name: user.first_name,
      loan_reason: `${existingLoanApplication.cluster_name} cluster loan`,
      amount_requested: existingLoanApplication.amount_requested,
      monthly_repayment: existingLoanApplication.monthly_repayment,
      initial_loan_duration: existingLoanApplication.loan_tenor_in_months,
      current_loan_duration: newLoanDuration,
      next_repayment_date: dayjs(nextRepayment.proposed_payment_date).add(Number(loanRescheduleRequest.extension_in_days), 'days').format('MMM DD, YYYY'),
      status: existingLoanApplication.status,
      reschedule_extension_days: Number(loanRescheduleRequest.extension_in_days),
      total_loan_extension_days: parseFloat(totalExtensionDays),
      is_reschedule: true
    };
    await MailService('Loan Facility Rescheduled', 'loanRescheduled',  data);
    userActivityTracking(req.user.user_id, 75, 'success');
    return ApiResponse.success(res, enums.LOAN_RESCHEDULING_PROCESSED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    userActivityTracking(req.user.user_id, 75, 'fail');
    error.label = enums.PROCESS_CLUSTER_LOAN_RESCHEDULING_CONTROLLER;
    logger.error(`processing cluster loan rescheduling loan failed::${enums.PROCESS_CLUSTER_LOAN_RESCHEDULING_CONTROLLER}`, error.message);
    return next(error);
  }
};
