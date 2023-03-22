import dayjs from 'dayjs';
import clusterQueries from '../queries/queries.cluster';
import userQueries from '../queries/queries.user';
import { processOneOrNoneData, processAnyData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import ClusterPayload from '../../lib/payloads/lib.payload.cluster';
import { createClusterNotification, sendUserPersonalNotification, sendMulticastPushNotification,
  sendClusterNotification, sendPushNotification } from '../services/services.firebase';
import MailService from '../services/services.email';
import { collateUsersFcmTokens, collateUsersFcmTokensExceptAuthenticatedUser } from '../../lib/utils/lib.util.helpers';
import * as PushNotifications from '../../lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates//personalNotification';
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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user was a one time cluster member joinClusterOnInvitation.controller.cluster.js`);
    const clusterMembersToken = await collateUsersFcmTokens(cluster.members);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fcm tokens of all cluster members fetched successfully joinClusterOnInvitation.controllers.cluster.js`);
    const decisionType = body.decision === 'yes' ? 'accepted' : 'declined';
    if (body.decision === 'yes') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user ${decisionType} cluster invitation joinClusterOnInvitation.controllers.cluster.js`);
      await Promise.all([
        formerClusterMember ? processOneOrNoneData(clusterQueries.reinstateClusterMember, [ cluster_id, user.user_id ]) :
          processOneOrNoneData(clusterQueries.createClusterMember, [ cluster_id, user.user_id, false ]),
        processOneOrNoneData(clusterQueries.updateClusterInvitationStatus, [ user.user_id, cluster_id, true, false ]),
        processOneOrNoneData(clusterQueries.incrementClusterMembersCount, [ cluster_id ])
      ]);
      sendClusterNotification(user, cluster, { is_admin: false }, `${user.first_name} ${user.last_name} joined your cluster`, 'join-cluster', {});
      sendMulticastPushNotification(PushNotifications.userJoinedYourCluster(user, cluster), clusterMembersToken, 'join-cluster', cluster_id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user added to new cluster and all notifications sent successfully 
      joinClusterOnInvitation.controllers.cluster.js`);
      userActivityTracking(req.user.user_id, 52, 'success');
      return ApiResponse.success(res, enums.JOIN_CLUSTER_DECISION_CHOICE(decisionType), enums.HTTP_OK, { user_id: user.user_id, decision: 'accepted', cluster_id });
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user ${decisionType} cluster invitation joinClusterOnInvitation.controllers.cluster.js`);
    await processOneOrNoneData(clusterQueries.updateClusterInvitationStatus, [ user.user_id, cluster_id, false, true ]);
    sendClusterNotification(user, cluster, { is_admin: false }, `${user.first_name} ${user.last_name} declined to join your cluster`, 'join-cluster', {});
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
    const clusterOpenGrace = await processOneOrNoneData(clusterQueries.fetchClusterGraceOpenPeriod, [ 'join_cluster_grace_in_days' ]);
    const join_cluster_closes_at = dayjs().add(Number(clusterOpenGrace.value), 'days');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster grace period for membership joining set successfully createCluster.controllers.cluster.js`);
    body.join_cluster_closes_at = body.type === 'private' ? join_cluster_closes_at : null;
    const createClusterPayload = ClusterPayload.createClusterPayload(body, user);
    const newClusterDetails = await processOneOrNoneData(clusterQueries.createCluster, createClusterPayload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster created successfully successfully createCluster.controllers.cluster.js`);
    const clusterMemberDetails = await processOneOrNoneData(clusterQueries.createClusterMember, [ newClusterDetails.cluster_id, user.user_id, true ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster admin member created successfully successfully createCluster.controllers.cluster.js`);
    createClusterNotification(user, body, newClusterDetails, clusterMemberDetails, 
      `${user.first_name} ${user.last_name} created ${body.type} cluster ${body.name}`, 'create-cluster', {});
    userActivityTracking(req.user.user_id, activityType, 'success');
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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully updates users cluster membership and adminship fetchClusterDetails.users.controllers.user.js`);
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
      await MailService('Cluster Invite', 'loanClusterInvite', { ...data });
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
      sendPushNotification(invitedUser.user_id, PushNotifications.clusterMemberInvitation, invitedUser.fcm_token);
      sendUserPersonalNotification(invitedUser, `${cluster.name} cluster invite`, PersonalNotifications.inviteClusterMember(inviteInfo), 'cluster-invitation', { ...cluster });
      await MailService('Cluster Invite', 'loanClusterInvite', { ...data });
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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched cluster members in the DB fetchClusterMembers.users.controllers.user.js`);
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
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user successfully leaves a cluster and cluster member decreaments leaveCluster.controllers.cluster.js`);
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
      user_id: user.user_id, cluster: cluster_id, decision_type: 'delete cluster' , deletion_reason: req.body.deletion_reason, ticket_id: initiateDeleteClusterTicket.ticket_id 
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
      [ cluster.cluster_id, clusterDecisionType.name, `${user.first_name} ${user.last_name} suggest an admin for "${cluster.name}" cluster`, user.user_id, 1, params.invitee_id ]);
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
