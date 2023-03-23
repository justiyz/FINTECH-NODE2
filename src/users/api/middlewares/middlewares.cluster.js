import dayjs from 'dayjs';
import clusterQueries from '../queries/queries.cluster';
import userQueries from '../queries/queries.user';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import { formatUserIncomeRange, generateReferralCode, collateUsersFcmTokens } from '../../lib/utils/lib.util.helpers';
import { sendPushNotification, sendClusterNotification, sendMulticastPushNotification } from '../services/services.firebase';
import * as PushNotifications from '../../lib/templates/pushNotification';
import { userActivityTracking } from '../../lib/monitor';
import ClusterPayload from '../../lib/payloads/lib.payload.cluster';

/**
 * check if cluster name is unique
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfClusterNameUnique = async(req, res, next) => {
  const { body, user } = req;
  const activityType = body.type === 'public' ? 47 : 48;
  try {
    const [ existingCluster ] = await processAnyData(clusterQueries.checkIfClusterIsUnique, [ body.name?.trim().toLowerCase() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if cluster name already exists in the db checkIfClusterNameUnique.middlewares.cluster.js`);
    if (existingCluster) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster name already exists in the db checkIfClusterNameUnique.middlewares.cluster.js`);
      userActivityTracking(req.user.user_id, activityType, 'fail');
      return ApiResponse.error(res, enums.CLUSTER_NAME_ALREADY_EXISTING(body.name), enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_NAME_UNIQUE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster name does nor exists in the db checkIfClusterNameUnique.middlewares.cluster.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.CHECK_IF_CLUSTER_NAME_UNIQUE_MIDDLEWARE;
    logger.error(`checking if cluster name already exists in the DB failed::${enums.CHECK_IF_CLUSTER_NAME_UNIQUE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * comparing cluster income range
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const compareUserIncomeRange = async(req, res, next) => {
  try {
    const { body, user, cluster } = req;
    if (user.income_range === null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user is yet to update income range compareUserIncomeRange.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.UPDATE_INCOME_RANGE_FOR_ACTION_PERFORMANCE, enums.HTTP_BAD_REQUEST, enums.COMPARE_CLUSTER_INCOME_RANGE_MIDDLEWARE);
    }
    // eslint-disable-next-line no-unused-vars
    const { lowerBoundIncome, upperBoundIncome } = formatUserIncomeRange(user.income_range);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user income range from DB properly formatted compareUserIncomeRange.middlewares.cluster.js`);
    if (parseFloat(upperBoundIncome) >= parseFloat(body.minimum_monthly_income || cluster.minimum_monthly_income)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user minimum income is greater than or equal to cluster minimum income 
      compareUserIncomeRange.middlewares.cluster.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user minimum income is less than cluster minimum income compareUserIncomeRange.middlewares.cluster.js`);
    return ApiResponse.error(res, enums.CLUSTER_MINIMUM_INCOME_GREATER_THAN_USER_MINIMUM_INCOME_EXISTING, 
      enums.HTTP_BAD_REQUEST, enums.COMPARE_CLUSTER_INCOME_RANGE_MIDDLEWARE);
  } catch (error) {
    error.label = enums.COMPARE_CLUSTER_INCOME_RANGE_MIDDLEWARE;
    logger.error(`comparing cluster income range failed::${enums.COMPARE_CLUSTER_INCOME_RANGE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * checking if user was invited to join cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const confirmUserClusterInvitation = async(req, res, next) => {
  try {
    const {user, params: { cluster_id }, cluster } = req;
    const [ userClusterInviteDetails ] = await processAnyData(clusterQueries.fetchUserClusterInvitation, [ user.user_id, cluster_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user has an active cluster invite confirmUserClusterInvitation.middlewares.cluster.js`);
    if (!userClusterInviteDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user no longer have an active cluster invitation confirmUserClusterInvitation.middlewares.cluster.js`);
      userActivityTracking(req.user.user_id, 52, 'fail');
      return ApiResponse.error(res, enums.USER_NO_CLUSTER_INVITATION(cluster.name), enums.HTTP_BAD_REQUEST, enums.CONFIRM_USER_CLUSTER_INVITATION_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user still have an active cluster invitation confirmUserClusterInvitation.middlewares.cluster.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 52, 'fail');
    error.label = enums.CONFIRM_USER_CLUSTER_INVITATION_MIDDLEWARE;
    logger.error(`checking if user have active cluster invitation failed::${enums.CONFIRM_USER_CLUSTER_INVITATION_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * checking if members can still join a cluster
 * @param {string} type - a type to know which of the checks to make
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const confirmClusterIsStillOpenForJoining = (type = '') => async(req, res, next) => {
  try {
    const {user, cluster } = req;
    if (
      (type === 'join' || type === 'request') && 
      (
        (dayjs().format('YYYY-MM-DD HH:mm:ss') > dayjs(cluster.join_cluster_closes_at).format('YYYY-MM-DD HH:mm:ss')) || 
        (Number(cluster.maximum_members) === Number(cluster.current_members))
      )
    ) {
      const activityType = type === 'request' ? 49 : 52;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster can no longer be joined or members added to the this cluster 
      confirmClusterIsStillOpenForJoining.middlewares.cluster.js`);
      userActivityTracking(req.user.user_id, activityType, 'fail');
      return ApiResponse.error(res, enums.CLUSTER_CLOSED_FOR_MEMBERSHIP, enums.HTTP_FORBIDDEN, enums.CONFIRM_CLUSTER_IS_STILL_OPEN_FOR_JOINING_MIDDLEWARE);
    }
    if (
      (type === 'invite') && 
        (
          (dayjs().format('YYYY-MM-DD HH:mm:ss') > dayjs(cluster.join_cluster_closes_at).format('YYYY-MM-DD HH:mm:ss')) || 
          (Number(cluster.maximum_members) === Number(cluster.current_members))
        )
    ) {
      const activityType = req.body.type === 'email' ? 54 : 55;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
      cluster can no longer accept new member confirmClusterIsStillOpenForJoining.middlewares.cluster.js`);
      userActivityTracking(req.user.user_id, activityType, 'fail');
      return ApiResponse.error(res, enums.CLUSTER_CLOSED_FOR_MEMBERSHIP, enums.HTTP_FORBIDDEN, enums.CONFIRM_CLUSTER_IS_STILL_OPEN_FOR_JOINING_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster is still open for members to join or added 
    confirmClusterIsStillOpenForJoining.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.CONFIRM_CLUSTER_IS_STILL_OPEN_FOR_JOINING_MIDDLEWARE;
    logger.error(`checking if members can still be a part of a cluster failed::${enums.CONFIRM_CLUSTER_IS_STILL_OPEN_FOR_JOINING_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if cluster exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfClusterExists = async(req, res, next) => {
  try {
    const { params: { cluster_id, cluster_unique_id }, votingTicketDetails, user } = req;
    const [ existingCluster ] = await processAnyData(clusterQueries.checkIfClusterExists, [ cluster_id || cluster_unique_id || votingTicketDetails.cluster_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if cluster is existing in the DB checkIfClusterExists.middlewares.cluster.js`);
    if (existingCluster) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster is existing in the DB checkIfClusterExists.middlewares.cluster.js`);
      if (existingCluster.is_deleted) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster no longer exists in the DB checkIfClusterExists.middlewares.cluster.js`);
        return ApiResponse.error(res, enums.CLUSTER_NO_LONGER_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE);
      }
      const clusterMembers = await processAnyData(clusterQueries.fetchActiveClusterMembers, [ existingCluster.cluster_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster active members fetched from the DB checkIfClusterExists.middlewares.cluster.js`);
      req.cluster = existingCluster;
      req.cluster.members = clusterMembers;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster does not exist in the DB checkIfClusterExists.middlewares.cluster.js`);
    return ApiResponse.error(res, enums.CLUSTER_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE;
    logger.error(`checking if cluster exists failed::${enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if user belongs to the cluster
 * @param {string} type - a type to know which of the checks to make
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfAlreadyClusterMember = (type = '') => async(req, res, next) => {
  try {
    const { params, cluster, user } = req;
    const clusterMemberId = params.invitee_id || user.user_id;
    const [ clusterMember ] = await processAnyData(clusterQueries.fetchActiveClusterMemberDetails, [ cluster.cluster_id, clusterMemberId ]);
    if (type === 'confirm' && clusterMember) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user already belongs to this cluster checkIfAlreadyClusterMember.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_ALREADY_CLUSTER_MEMBER, enums.HTTP_CONFLICT, enums.CHECK_IF_ALREADY_CLUSTER_MEMBER_MIDDLEWARE);
    }
    if (type === 'confirm' && !clusterMember) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does not belong to this cluster yet, so can join 
      checkIfAlreadyClusterMember.middlewares.cluster.js`);
      return next();
    }
    if (type === 'authenticate' && !clusterMember) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does not belong to this cluster checkIfAlreadyClusterMember.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_NOT_CLUSTER_MEMBER, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_ALREADY_CLUSTER_MEMBER_MIDDLEWARE);
    }
    if (type === 'authenticate' && clusterMember) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user belongs to this cluster and can proceed checkIfAlreadyClusterMember.middlewares.cluster.js`);
      req.clusterMember = clusterMember;
      return next();
    }
  } catch (error) {
    error.label = enums.CHECK_IF_ALREADY_CLUSTER_MEMBER_MIDDLEWARE;
    logger.error(`checking if user belongs to cluster failed::${enums.CHECK_IF_ALREADY_CLUSTER_MEMBER_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if cluster voting decision ticket exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfClusterDecisionTicketExists = async(req, res, next) => {
  try {
    const { params: { ticket_id }, user } = req;
    const [ existingTicket ] = await processAnyData(clusterQueries.fetchClusterDecisionTicketByTicketId, [ ticket_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if ticket is existing in the DB checkIfClusterDecisionTicketExists.middlewares.cluster.js`);
    if (existingTicket) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster decision ticket is existing in the DB 
      checkIfClusterDecisionTicketExists.middlewares.cluster.js`);
      const [ clusterMember ] = await processAnyData(clusterQueries.fetchActiveClusterMemberDetails, [ existingTicket.cluster_id, user.user_id ]);
      if (clusterMember) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user belongs to cluster where ticket is raised 
        checkIfClusterDecisionTicketExists.middlewares.cluster.js`);
        req.votingTicketDetails = existingTicket;
        req.clusterMember = clusterMember;
        return next();
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does not belong to cluster where ticket is raised 
      checkIfClusterDecisionTicketExists.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_NOT_CLUSTER_MEMBER, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_DECISION_TICKET_EXISTS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster decision ticket does not exist in the DB 
    checkIfClusterDecisionTicketExists.middlewares.cluster.js`);
    return ApiResponse.error(res, enums.CLUSTER_DECISION_TICKET_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_DECISION_TICKET_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_CLUSTER_DECISION_TICKET_EXISTS_MIDDLEWARE;
    logger.error(`checking if cluster decision ticket exists failed::${enums.CHECK_IF_CLUSTER_DECISION_TICKET_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if cluster voting decision ticket exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfUserHasPreviouslyDecided = async(req, res, next) => {
  try {
    const { params: { ticket_id }, user } = req;
    const [ userDecisionDetails ] = await processAnyData(clusterQueries.checkIfUserPreviouslyVoted, [ ticket_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user previously decided checkIfUserHasPreviouslyDecided.middlewares.cluster.js`);
    if (userDecisionDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has previously decided checkIfUserHasPreviouslyDecided.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_PREVIOUSLY_DECIDED, enums.HTTP_FORBIDDEN, enums.CHECK_IF_USER_HAS_PREVIOUSLY_DECIDED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user has not previously decided and can proceed to decide 
    checkIfUserHasPreviouslyDecided.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_USER_HAS_PREVIOUSLY_DECIDED_MIDDLEWARE;
    logger.error(`checking if user has previously decided failed::${enums.CHECK_IF_USER_HAS_PREVIOUSLY_DECIDED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if cluster voting decision ticket has been concluded on
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIClusterDecisionHasBeenConcluded = async(req, res, next) => {
  try {
    const { votingTicketDetails, user } = req;
    if (votingTicketDetails.is_concluded) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster decision ticket has been decided and ticket fulfilled 
      checkIClusterDecisionHasBeenConcluded.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.VOTING_DECISION_ALREADY_CONCLUDED, enums.HTTP_FORBIDDEN, enums.CHECK_IF_CLUSTER_DECISION_HAS_BEEN_CONCLUDED_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster decision ticket is still open and not yet fulfilled 
    checkIClusterDecisionHasBeenConcluded.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_CLUSTER_DECISION_HAS_BEEN_CONCLUDED_MIDDLEWARE;
    logger.error(`checking if cluster decision ticket has been concluded failed::${enums.CHECK_IF_CLUSTER_DECISION_HAS_BEEN_CONCLUDED_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if cluster is a public or private cluster
 * @param {string} type - a type to know which of the checks to make
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfPublicOrPrivateCluster = (type = '') => async(req, res, next) => {
  try {
    const { cluster, user } = req;
    if (type === 'public' && cluster.type === 'public') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster is a public cluster checkIfPublicOrPrivateCluster.middlewares.cluster.js`);
      return next();
    }
    if (type === 'private' && cluster.type === 'private') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster is a private cluster checkIfPublicOrPrivateCluster.middlewares.cluster.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster is not a ${type} cluster checkIfPublicOrPrivateCluster.middlewares.cluster.js`);
    return ApiResponse.error(res, enums.CLUSTER_TYPE_NOT_PUBLIC_OR_PRIVATE(cluster.type), enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE;
    logger.error(`checking if cluster is a public or private cluster failed::${enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * user takes voting decision on request to join cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with empty data field
 * @memberof ClusterMiddleware
 */
export const userTakesRequestToJoinClusterDecision = async(req, res, next) => {
  const { params: { ticket_id }, votingTicketDetails, cluster, clusterMember, body, user } = req;
  const activityType = body.decision === 'yes' ? 50 : 51;
  try {
    if (votingTicketDetails.type === 'join cluster') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster decision is for ${votingTicketDetails.type} 
      userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
      const [ requestingNMemberDetails ] = await processAnyData(userQueries.getUserByUserId, [ votingTicketDetails.ticket_raised_by ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: details of requesting cluster member fetched from the DB 
      userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
      if (
        (dayjs().format('YYYY-MM-DD HH:mm:ss') > dayjs(cluster.join_cluster_closes_at).format('YYYY-MM-DD HH:mm:ss')) || 
          (Number(cluster.maximum_members) === Number(cluster.current_members))
      ) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster can no longer be joined or members added to the this cluster 
        userTakesRequestToJoinClusterDecision.middlewares.cluster.js`);
        await processOneOrNoneData(clusterQueries.updateDecisionTicketFulfillment, [ ticket_id ]);
        sendPushNotification(requestingNMemberDetails.user_id, PushNotifications.joinClusterRequestClusterJoiningClosed(cluster.name), requestingNMemberDetails.fcm_token);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: requesting cluster member rejected and push notification sent to requesting member 
        userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
        userActivityTracking(req.user.user_id, activityType, 'fail');
        return ApiResponse.error(res, enums.CLUSTER_CLOSED_FOR_MEMBERSHIP, enums.HTTP_FORBIDDEN, enums.USER_TAKES_REQUEST_TO_JOIN_CLUSTER_DECISION_MIDDLEWARE);
      }
      const [ currentClusterMember ] = await processAnyData(clusterQueries.fetchActiveClusterMemberDetails, 
        [ votingTicketDetails.cluster_id, requestingNMemberDetails.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if requesting member was a current cluster member 
      userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
      if (currentClusterMember) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: requesting user already belongs to this cluster 
        userTakesRequestToJoinClusterDecision.middlewares.cluster.js`);
        await processOneOrNoneData(clusterQueries.updateDecisionTicketFulfillment, [ ticket_id ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: requesting cluster member cannot be added and ticket is closed 
        userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
        userActivityTracking(req.user.user_id, activityType, 'fail');
        return ApiResponse.error(res, enums.USER_ALREADY_CLUSTER_MEMBER, enums.HTTP_CONFLICT, enums.USER_TAKES_REQUEST_TO_JOIN_CLUSTER_DECISION_MIDDLEWARE);
      }
      await processOneOrNoneData(clusterQueries.recordUserVoteDecision, [ ticket_id, votingTicketDetails.cluster_id, user.user_id, clusterMember.is_admin, body.decision ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user voting decision recorded successfully 
      userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
      const currentVoteCount = await processOneOrNoneData(clusterQueries.fetchCurrentTicketVotes, [ ticket_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: current number of casted votes counted from the DB 
      userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
      const decisionType = body.decision === 'yes' ? 'accepted' : 'declined';
      const [ hasAdminVotedYes ] = await processAnyData(clusterQueries.checkIfAdminHasVotedYes, [ ticket_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if admin has voted from the DB userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
      const currentNonAdminYesVoteCount = await processOneOrNoneData(clusterQueries.fetchCurrentTicketYesVotesByNonAdmins, [ ticket_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: current number of casted votes by non cluster admin counted from the DB 
      userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
      const [ formerClusterMember ] = await processAnyData(clusterQueries.fetchDeactivatedClusterMemberDetails, 
        [ votingTicketDetails.cluster_id, requestingNMemberDetails.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if requesting member was a one time cluster member 
      userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
      if (
        (Number(votingTicketDetails.current_cluster_members) === 1 && clusterMember.is_admin && body.decision === 'yes')  || 
        // since admin is the only current team member, only admin can accept join request
          ((Number(votingTicketDetails.current_cluster_members) > 1) && (hasAdminVotedYes) && (Number(currentNonAdminYesVoteCount.count) >= 1))
      ) {  // for a cluster of more than one member, the admin and another cluster member should accept request
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster admin and or another cluster member has accepted requesting member 
        userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
        await Promise.all([
          formerClusterMember ? processOneOrNoneData(clusterQueries.reinstateClusterMember, [ votingTicketDetails.cluster_id, requestingNMemberDetails.user_id ]) : 
            processOneOrNoneData(clusterQueries.createClusterMember, [ votingTicketDetails.cluster_id, requestingNMemberDetails.user_id, false ]),
          processOneOrNoneData(clusterQueries.incrementClusterMembersCount, [ votingTicketDetails.cluster_id ]),
          processOneOrNoneData(clusterQueries.updateDecisionTicketFulfillment, [ ticket_id ])
        ]);
        sendClusterNotification(requestingNMemberDetails, cluster, { is_admin: false }, 
          `${requestingNMemberDetails.first_name} ${requestingNMemberDetails.last_name} joined your cluster`, 'join-cluster', {});
        sendPushNotification(requestingNMemberDetails.user_id, PushNotifications.joinClusterRequestAccepted(cluster.name), requestingNMemberDetails.fcm_token);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: requesting cluster member created and push notification sent to requesting member 
        userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
        userActivityTracking(req.user.user_id, activityType, 'success');
        userActivityTracking(req.user.user_id, 52, 'success');
        return ApiResponse.success(res, enums.REQUEST_TO_JOIN_CLUSTER_DECISION(decisionType), enums.HTTP_OK);
      }
      if ((clusterMember.is_admin && body.decision === 'no') || (Number(currentVoteCount.count) === Number(votingTicketDetails.current_cluster_members))) { 
        // since admin must accept for requesting member to be accepted
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster admin has either rejected requesting member or the request does not meet with the 
        acceptance criteria of one member and admin userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
        await processOneOrNoneData(clusterQueries.updateDecisionTicketFulfillment, [ ticket_id ]);
        sendPushNotification(requestingNMemberDetails.user_id, PushNotifications.joinClusterRequestRejected(cluster.name), requestingNMemberDetails.fcm_token);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: requesting cluster member rejected and push notification sent to requesting member 
        userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
        userActivityTracking(req.user.user_id, activityType, 'success');
        userActivityTracking(req.user.user_id, 53, 'success');
        return ApiResponse.success(res, enums.REQUEST_TO_JOIN_CLUSTER_DECISION(decisionType), enums.HTTP_OK);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: users decision recorded successfully userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
      userActivityTracking(req.user.user_id, activityType, 'success');
      return ApiResponse.success(res, enums.REQUEST_TO_JOIN_CLUSTER_DECISION(decisionType), enums.HTTP_OK);
    }
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.USER_TAKES_REQUEST_TO_JOIN_CLUSTER_DECISION_MIDDLEWARE;
    logger.error(`taking decision on a request to join cluster failed::${enums.USER_TAKES_REQUEST_TO_JOIN_CLUSTER_DECISION_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * generate cluster unique code
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const generateClusterUniqueCode = async(req, res, next) => {
  const { body, user } = req;
  const activityType = body.type === 'public' ? 47 : 48;
  try {
    const uniqueCode = await generateReferralCode(7);
    const [ existingUniqueCode ] = await processAnyData(clusterQueries.checkIfClusterIsUnique, [ uniqueCode ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if cluster unique code is existing generateClusterUniqueCode.middlewares.cluster.js`);
    if (existingUniqueCode) {
      return generateClusterUniqueCode(req, res, next);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully generates cluster unique code generateClusterUniqueCode.middlewares.cluster.js`);
    body.clusterCode = uniqueCode;
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.GENERATE_CLUSTER_UNIQUE_CODE_MIDDLEWARE;
    logger.error(`generating cluster unique code failed::${enums.GENERATE_CLUSTER_UNIQUE_CODE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check If invitee already cluster member
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfInviteeAlreadyClusterMember = async(req, res, next) => {
  try {
    const {user, params: {cluster_id}, cluster: { members}} = req;
    const [ memberData ] = members;
    const [ clusterMember ] = await processAnyData(clusterQueries.checkIfClusterMemberAlreadyExist, [ memberData.user_id, cluster_id  ]);
    if (clusterMember) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
      decoded that user is already a cluster member checkIfInviteeAlreadyExist.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_ALREADY_CLUSTER_MEMBER, enums.HTTP_CONFLICT, enums.CHECK_IF_INVITEE_ALREADY_EXIST_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does not belong to this cluster yet, so can join 
    checkIfInviteeAlreadyExist.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_INVITEE_ALREADY_EXIST_MIDDLEWARE;
    logger.error(`Check if invitee already exist failed::${enums.CHECK_IF_INVITEE_ALREADY_EXIST_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check If user can leave cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfUserCanLeaveCluster =  async(req, res, next) => {
  try {
    const { cluster, clusterMember, user } = req;
    if (clusterMember.loan_status === 'active') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms user is on an active loan in the cluster 
      checkIfUserIsOnActiveLoan.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_ON_ACTIVE_LOAN, enums.HTTP_FORBIDDEN, enums.CHECK_IF_USER_CAN_LEAVE_A_CLUSTER_MIDDLEWARE);
    }
    if (clusterMember.is_admin && Number(cluster.current_members) > 1) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms user is an admin and not the last member 
      checkIfUserIsAnAdmin.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_IS_AN_ADMIN, enums.HTTP_FORBIDDEN, enums.CHECK_IF_USER_CAN_LEAVE_A_CLUSTER_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_USER_CAN_LEAVE_A_CLUSTER_MIDDLEWARE;
    logger.error(`checking if user can leave a cluster failed::${enums.CHECK_IF_USER_CAN_LEAVE_A_CLUSTER_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check If cluster member Is Admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfClusterMemberIsAdmin = async(req, res, next) => {
  try {
    const {user} = req;
    const  [ clusterAdmin ]  = await processAnyData(clusterQueries.checkIfClusterMemberIsAdmin, 
      [ user.user_id, req.params.cluster_id  ]);
    if (!clusterAdmin) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: 
      the decoded user is not a cluster member admin  checkIfClusterMemberIsAdmin.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_MEMBER_NOT_ADMIN, enums.HTTP_CONFLICT, enums.CHECK_IF_CLUSTER_MEMBER_IS_ADMIN_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_CLUSTER_MEMBER_IS_ADMIN_MIDDLEWARE;
    logger.error(`Check if cluster member is admin failed::${enums.CHECK_IF_CLUSTER_MEMBER_IS_ADMIN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check If cluster is on active loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */

export const checkIfClusterIsOnActiveLoan = async(req, res, next) => {
  try {
    const { user, cluster } = req;
    if (cluster.loan_status === 'active') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms cluster on an active loan in the cluster 
      checkIfClusterIsOnActiveLoan.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_IS_ON_ACTIVE_LOAN, enums.HTTP_FORBIDDEN, enums.CHECK_IF_CLUSTER_IS_ON_ACTIVE_LOAN_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_CLUSTER_IS_ON_ACTIVE_LOAN_MIDDLEWARE;
    logger.error(`Check if cluster is on active loan failed::${enums.CHECK_IF_CLUSTER_IS_ON_ACTIVE_LOAN_MIDDLEWARE}`, error.message);
    return next(error); 
  }
};

/**
 * check If there is more than one person in a cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */

export const checkIfThereIsMoreThanOnePersonInTheCluster = async(req, res, next) => {
  try {
    const { user, body, cluster } = req;
    if ((cluster.current_members > 1) && (body.maximum_members < cluster.current_members)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms there is more than one person in the cluster 
      checkIfThereIsMoreThanOnePersonInTheCluster.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_CAN_NOT_EDIT('maximum numbers'), enums.HTTP_FORBIDDEN, enums.CHECK_IF_MORE_THAN_ONE_PERSON_IS_IN_THE_CLUSTER_MIDDLEWARE);
    }
    if ((cluster.current_members > 1) && (body.loan_goal_target)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms there is more than one person in the cluster 
      checkIfThereIsMoreThanOnePersonInTheCluster.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_CAN_NOT_EDIT('loan goal target'), enums.HTTP_FORBIDDEN, enums.CHECK_IF_MORE_THAN_ONE_PERSON_IS_IN_THE_CLUSTER_MIDDLEWARE);
    }
    if ((cluster.current_members > 1) && (body.minimum_monthly_income)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: successfully confirms there is more than one person in the cluster 
      checkIfThereIsMoreThanOnePersonInTheCluster.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_CAN_NOT_EDIT('minimum monthly income'),enums.HTTP_FORBIDDEN, enums.CHECK_IF_MORE_THAN_ONE_PERSON_IS_IN_THE_CLUSTER_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_MORE_THAN_ONE_PERSON_IS_IN_THE_CLUSTER_MIDDLEWARE;
    logger.error(`Checking if cluster has more than one member failed::${enums.CHECK_IF_MORE_THAN_ONE_PERSON_IS_IN_THE_CLUSTER_MIDDLEWARE}`, error.message);
    return next(error);
  }
};


/**
 * request to delete cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with no data
 * @memberof AuthMiddleware
 */
export const requestToDeleteCluster = async(req, res, next) => {
  try {
    const { params: { ticket_id }, body, cluster, user, votingTicketDetails, clusterMember } = req;
    if (votingTicketDetails.type === 'delete cluster') {
      const activityType = req.body.decision === 'yes' ? 60 : 61;
      const decisionType = body.decision === 'yes' ? 'accepted' : 'declined';
      if (user.user_id === votingTicketDetails.ticket_raised_by) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user that raised ticket trying to vote requestToDeleteCluster.middleware.cluster.js`);
        return ApiResponse.error(res, enums.USER_CANNOT_TAKE_DECISION_ON_THIS_TICKET, enums.HTTP_FORBIDDEN, enums.REQUEST_TO_DELETE_CLUSTER_MIDDLEWARE);
      }
      const payload = ClusterPayload.recordUserVoteDecision(body, cluster, user, ticket_id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: vote recorded requestToDeleteCluster.middleware.cluster.js`);
      if (body.decision === 'yes') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user ${decisionType} cluster deletion request requestToDeleteCluster.middleware.cluster.js`);
        await processOneOrNoneData(clusterQueries.recordUserVoteDecision, payload);
        sendClusterNotification(user, cluster, clusterMember, `${user.first_name} ${user.last_name} accepted to delete cluster`, 'delete-cluster', {});
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster member accept to delete cluster group and all notifications sent successfully 
        requestToDeleteCluster.middleware.cluster.js`);
        userActivityTracking(req.user.user_id, activityType, 'success');
        const [ voteCount ] = await processAnyData(clusterQueries.fetchCurrentTicketVotes, [ ticket_id ]);
        if (Number(votingTicketDetails.current_cluster_members) === Number(voteCount.count)) {
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirm that all users have voted and about to delete cluster 
          requestToDeleteCluster.middleware.cluster.js`);
          const clusterMembersToken = await collateUsersFcmTokens(cluster.members);
          await Promise.allSettled([
            processAnyData(clusterQueries.removeClusterMembers, [ req.cluster.cluster_id ]),
            processOneOrNoneData(clusterQueries.deleteAcluster, [ req.cluster.cluster_id ]),
            processOneOrNoneData(clusterQueries.updateDecisionTicketFulfillment, [ ticket_id ])
          ]);
          sendMulticastPushNotification(PushNotifications.clusterDeletedSuccessfully(cluster), clusterMembersToken, 'cluster-deleted', cluster.cluster_id);
          sendClusterNotification(user, cluster, clusterMember, `${user.first_name} ${user.last_name} cluster deleted`, 'delete-cluster', {});
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster deleted and notifications sent successfully requestToDeleteCluster.middleware.cluster.js`);
          userActivityTracking(req.user.user_id, 62, 'success');
          return ApiResponse.success(res, enums.CLUSTER_DELETED_SUCCESSFULLY, enums.HTTP_OK, { cluster_id: cluster.cluster_id  });
        }
        return ApiResponse.success(res, enums.REQUEST_TO_DELETE_CLUSTER(decisionType), enums.HTTP_OK, 
          { user_id: user.user_id, decision: 'accepted', cluster_id: cluster.cluster_id });
      }
      if (body.decision === 'no') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user ${decisionType} cluster deletion requestToDeleteCluster.middleware.cluster.js`);
        await processAnyData(clusterQueries.recordUserVoteDecision, payload);
        await processOneOrNoneData(clusterQueries.updateDecisionTicketFulfillment, [ ticket_id ]);
        sendClusterNotification(user, cluster, clusterMember, `${user.first_name} ${user.last_name} declined request to delete cluster`, 'delete-cluster', {});
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster member has declined request to delete cluster and notifications sent successfully 
        requestToDeleteCluster.middleware.cluster.js`);
        userActivityTracking(req.user.user_id, activityType, 'success');
        return ApiResponse.success(res, enums.REQUEST_TO_DELETE_CLUSTER(decisionType), enums.HTTP_OK, 
          { user_id: user.user_id, decision: 'declined', cluster_id: cluster.cluster_id });
      }
    }
    return next();
  } catch (error) {
    const activityType = req.body.decision === 'yes' ? 60 : 61;
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.REQUEST_TO_DELETE_CLUSTER_MIDDLEWARE;
    logger.error(`Requesting to delete cluster failed::${enums.REQUEST_TO_DELETE_CLUSTER_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
* new admin cluster acceptance
* @param {Request} req - The request from the endpoint.
* @param {Response} res - The response returned by the method.
* @param {Next} next - Call the next operation.
* @returns { JSON } - A JSON with no data
* @memberof AuthMiddleware
*/
export const newAdminClusterAcceptance = async(req, res, next) => {
  try {
    const { body, cluster, user, votingTicketDetails, params: { ticket_id } } = req;
    const [ clusterMember ] = await processAnyData(clusterQueries.fetchActiveClusterMemberDetails, [ cluster.cluster_id, user.user_id ]);
    if (votingTicketDetails.type === 'cluster admin') {
      const activityType = req.body.decision === 'yes' ? 65 : 66;
      const decisionType = body.decision === 'yes' ? 'accepted' : 'declined';
      if (votingTicketDetails.suggested_cluster_admin !== user.user_id) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user id dose not equal suggested user id newAdminClusterAcceptance.middleware.cluster.js`);
        return ApiResponse.error(res, enums.USER_CANNOT_PERFORM_ACTION, enums.HTTP_FORBIDDEN, enums.NEW_ADMIN_CLUSTER_ACCEPTANCE_MIDDLEWARE);
      }
      if (body.decision === 'yes') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user ${decisionType} request to become new cluster admin 
        newAdminClusterAcceptance.middleware.cluster.js`);
        await Promise.all([
          processOneOrNoneData(clusterQueries.newAdmin, [ votingTicketDetails.cluster_id, user.user_id ]),
          processOneOrNoneData(clusterQueries.setAdmin, [ votingTicketDetails.cluster_id, user.user_id ]),
          processOneOrNoneData(clusterQueries.removeAdmin, [ votingTicketDetails.cluster_id, cluster.admin ]),
          processOneOrNoneData(clusterQueries.updateDecisionTicketFulfillment, [ ticket_id ])
        ]);
        sendClusterNotification(user, cluster, clusterMember, `${user.first_name} ${user.last_name} accepted to become new cluster admin`, 'admin-cluster', {});
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user accepted cluster admin role and all notifications sent successfully 
        newAdminClusterAcceptance.middleware.cluster.js`);
        userActivityTracking(req.user.user_id, 67, 'success');
        return ApiResponse.success(res, enums.CLUSTER_ADMIN_ACCEPTANCE(decisionType), enums.HTTP_OK, 
          { user_id: user.user_id, decision: 'accepted', cluster_id: cluster.cluster_id });
      }
      await processOneOrNoneData(clusterQueries.updateDecisionTicketFulfillment, [ ticket_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user ${decisionType} suggest to become an admin  newAdminClusterAcceptance.middleware.cluster.js`);
      sendClusterNotification(user, cluster, clusterMember, `${user.first_name} ${user.last_name} declined to become admin`, 'admin-cluster', {});
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user declined taking over as new admin cluster and notifications sent successfully  
      newAdminClusterAcceptance.middleware.cluster.js`);
      userActivityTracking(req.user.user_id, activityType, 'success');
      return ApiResponse.success(res, enums.CLUSTER_ADMIN_ACCEPTANCE(decisionType), enums.HTTP_OK, { 
        user_id: user.user_id, decision: 'declined', cluster_id: cluster.cluster_id
      });
    }
    return next();
  } catch (error) {
    const activityType = req.body.decision === 'yes' ? 65 : 66;
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.NEW_ADMIN_CLUSTER_ACCEPTANCE_MIDDLEWARE;
    logger.error(`new admin cluster acceptance failed::${enums.NEW_ADMIN_CLUSTER_ACCEPTANCE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
