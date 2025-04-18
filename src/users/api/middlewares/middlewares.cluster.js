import dayjs from 'dayjs';
import clusterQueries from '../queries/queries.cluster';
import userQueries from '../queries/queries.user';
import authQueries from '../queries/queries.auth';
import loanQueries from '../queries/queries.loan';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import { generateReferralCode, collateUsersFcmTokens } from '../../lib/utils/lib.util.helpers';
import { sendPushNotification, sendClusterNotification, sendUserPersonalNotification, sendMulticastPushNotification } from '../services/services.firebase';
import * as PushNotifications from '../../lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates/personalNotification';
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
  try {
    const [ existingCluster ] = await processAnyData(clusterQueries.checkIfClusterNameIsUnique, [ body.name?.trim().toLowerCase() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if cluster name already exists in the db checkIfClusterNameUnique.middlewares.cluster.js`);
    if (existingCluster) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster name already exists in the db checkIfClusterNameUnique.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_NAME_ALREADY_EXISTING(body.name), enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_NAME_UNIQUE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster name does nor exists in the db checkIfClusterNameUnique.middlewares.cluster.js`);
    req.cluster = body; // added this line so as to be able to use the middleware that checks that a user does not belong to multiple clusters
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_CLUSTER_NAME_UNIQUE_MIDDLEWARE;
    logger.error(`checking if cluster name already exists in the DB failed::${enums.CHECK_IF_CLUSTER_NAME_UNIQUE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * comparing user monthly income
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const compareUserMonthlyIncome = async(req, res, next) => {
  try {
    const { body, user, cluster, userEmploymentDetails } = req;
    if (!userEmploymentDetails || userEmploymentDetails.monthly_income === null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user is yet to update income range compareUserMonthlyIncome.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.UPDATE_INCOME_FOR_ACTION_PERFORMANCE, enums.HTTP_BAD_REQUEST, enums.COMPARE_USER_MONTHLY_INCOME_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user income range from DB properly formatted compareUserMonthlyIncome.middlewares.cluster.js`);
    if (userEmploymentDetails && (parseFloat(userEmploymentDetails.monthly_income) >=
    (parseFloat(body.minimum_monthly_income) || parseFloat(cluster.minimum_monthly_income)))) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user minimum income is greater than or equal to cluster minimum income
      compareUserMonthlyIncome.middlewares.cluster.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user minimum income is less than cluster minimum income
    compareUserMonthlyIncome.middlewares.cluster.js`);
    return ApiResponse.error(res, enums.CLUSTER_MINIMUM_INCOME_GREATER_THAN_USER_MINIMUM_INCOME_EXISTING,
      enums.HTTP_BAD_REQUEST, enums.COMPARE_USER_MONTHLY_INCOME_MIDDLEWARE);
  } catch (error) {
    error.label = enums.COMPARE_USER_MONTHLY_INCOME_MIDDLEWARE;
    logger.error(`comparing user monthly income failed::${enums.COMPARE_USER_MONTHLY_INCOME_MIDDLEWARE}`, error.message);
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
 * checks if user already belongs to type of cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with empty data field
 * @memberof ClusterMiddleware
 */
export const checkIfUserBelongsToTypeOfCluster = async(req, res, next) => {
  try {
    const { cluster, user } = req;
    const [ [ userPublicCLuster ], [ userPrivateCLuster ], [ userAdminCreatedCLuster ] ] = await Promise.all([
      processAnyData(clusterQueries.fetchUserClusterType, [ user.user_id, 'public', false ]),
      processAnyData(clusterQueries.fetchUserClusterType, [ user.user_id, 'private', false ]),
      processAnyData(clusterQueries.fetchUserClusterType, [ user.user_id, 'private', true ])
    ]);
    if (cluster.type === 'public' && !cluster.is_created_by_admin && !userPublicCLuster) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does not belong to any public cluster yet
      checkIfUserBelongsToTypeOfCluster.middlewares.cluster.js`);
      return next();
    }
    if (cluster.type === 'private' && !cluster.is_created_by_admin && !userPrivateCLuster) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does not belong to any private cluster yet
      checkIfUserBelongsToTypeOfCluster.middlewares.cluster.js`);
      return next();
    }
    if (cluster.type === 'private' && cluster.is_created_by_admin && !userAdminCreatedCLuster) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does not belong to any admin created private cluster yet
      checkIfPublicOrPrivateCluster.middlewares.cluster.js`);
      return next();
    }
    const clusterTypeValue = cluster.type === 'public' ? 'public' : cluster.type === 'private' && cluster.is_created_by_admin ? 'admin created' : 'private';
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user already belongs to one ${clusterTypeValue} cluster
    checkIfUserBelongsToTypeOfCluster.middlewares.cluster.js`);
    return ApiResponse.error(res, enums.USER_CAN_ONLY_BE_IN_ONE_CLUSTER(clusterTypeValue), enums.HTTP_BAD_REQUEST, enums.CHECK_IF_BELONGS_TO_TYPE_OF_CLUSTER_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_BELONGS_TO_TYPE_OF_CLUSTER_MIDDLEWARE;
    logger.error(`checking if user already belong to a cluster type failed::${enums.CHECK_IF_BELONGS_TO_TYPE_OF_CLUSTER_MIDDLEWARE}`, error.message);
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
      const [ requestingUsersCurrentClusterType ] = await processAnyData(clusterQueries.fetchUserClusterType, [ votingTicketDetails.ticket_raised_by, cluster.type, false ]);
      if (requestingUsersCurrentClusterType) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: requesting user already belongs to this cluster type
        userTakesRequestToJoinClusterDecision.middlewares.cluster.js`);
        await processOneOrNoneData(clusterQueries.updateDecisionTicketFulfillment, [ ticket_id ]);
        userActivityTracking(req.user.user_id, activityType, 'fail');
        return ApiResponse.error(res, enums.USER_ALREADY_BELONG_TO_THE_CLUSTER_TYPE(cluster.type), enums.HTTP_CONFLICT,
          enums.USER_TAKES_REQUEST_TO_JOIN_CLUSTER_DECISION_MIDDLEWARE);
      }
      const [ currentClusterMember ] = await processAnyData(clusterQueries.fetchActiveClusterMemberDetails,
        [ votingTicketDetails.cluster_id, requestingNMemberDetails.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if requesting member was a current cluster member
      userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
      if (currentClusterMember) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: requesting user already belongs to this cluster
        userTakesRequestToJoinClusterDecision.middlewares.cluster.js`);
        await processOneOrNoneData(clusterQueries.updateDecisionTicketFulfillment, [ ticket_id ]);
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
        sendPushNotification(requestingNMemberDetails.user_id, PushNotifications.joinClusterRequestAccepted(cluster.name), requestingNMemberDetails.fcm_token);
        sendUserPersonalNotification(requestingNMemberDetails, 'Join cluster request accepted', PersonalNotifications.joinClusterRequestAccepted(cluster),
          'join-cluster-successful', {  });
        sendClusterNotification(requestingNMemberDetails, cluster, { is_admin: false },
          `${requestingNMemberDetails.first_name} ${requestingNMemberDetails.last_name} joined your cluster`, 'join-cluster', {});
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: requesting cluster member created and push notification sent to requesting member
        userTakesRequestToJoinClusterDecision.middleware.cluster.js`);
        if ((!cluster.is_created_by_admin) && (Number(cluster.members.length) + 1 === 5) && (!cluster.cluster_creator_received_membership_count_reward)) {
          const rewardDetails = await processOneOrNoneData(authQueries.fetchClusterRelatedRewardPointDetails, [ 'cluster_member_increase' ]);
          const rewardPoint = parseFloat(rewardDetails.point);
          const rewardDescription = 'Cluster membership increase point';
          // await processOneOrNoneData(authQueries.updateRewardPoints,
          //     [ cluster.created_by, null, rewardPoint, rewardDescription, null, 'cluster membership increase' ]);
          // await processOneOrNoneData(authQueries.updateUserPoints, [ user.user_id, parseFloat(rewardPoint), parseFloat(rewardPoint) ]);
          // const [ clusterCreator ] = await processAnyData(userQueries.getUserByUserId, [ cluster.created_by ]);
          // await processOneOrNoneData(clusterQueries.updateClusterCreatorReceivedMembershipRewardPoints, [ cluster.cluster_id ]);
          // sendUserPersonalNotification(clusterCreator, 'Cluster membership increase point',
          //   PersonalNotifications.userEarnedRewardPointMessage(rewardPoint, `cluster membership increase up to ${5}`), 'point-rewards', {});
          // sendPushNotification(clusterCreator.user_id, PushNotifications.rewardPointPushNotification(rewardPoint, `cluster membership increase up to ${5}`),
          //   clusterCreator.fcm_token);
          userActivityTracking(clusterCreator.user_id, 107, 'success');
        }
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
        sendUserPersonalNotification(requestingNMemberDetails, 'Join cluster request rejected', PersonalNotifications.joinClusterRequestRejected(cluster),
          'join-cluster-rejected', {  });
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
    if (clusterMember.loan_status !== 'inactive') {
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
      const [ currentAdminDetails ] = await processAnyData(userQueries.getUserByUserId, [ votingTicketDetails.ticket_raised_by ]);
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
        sendPushNotification(currentAdminDetails.user_id, PushNotifications.clusterNewAdminSelectionAccepted(user, cluster.name), currentAdminDetails.fcm_token);
        sendUserPersonalNotification(currentAdminDetails, 'New cluster admin request accepted', PersonalNotifications.newAdminSelectionRequestAccepted(user, cluster),
          'cluster-admin-request-accepted', {  });
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user accepted cluster admin role and all notifications sent successfully
        newAdminClusterAcceptance.middleware.cluster.js`);
        userActivityTracking(req.user.user_id, 67, 'success');
        return ApiResponse.success(res, enums.CLUSTER_ADMIN_ACCEPTANCE(decisionType), enums.HTTP_OK,
          { user_id: user.user_id, decision: 'accepted', cluster_id: cluster.cluster_id });
      }
      await processOneOrNoneData(clusterQueries.updateDecisionTicketFulfillment, [ ticket_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user ${decisionType} suggest to become an admin  newAdminClusterAcceptance.middleware.cluster.js`);
      sendClusterNotification(user, cluster, clusterMember, `${user.first_name} ${user.last_name} declined to become admin`, 'admin-cluster', {});
      sendPushNotification(currentAdminDetails.user_id, PushNotifications.clusterNewAdminSelectionDeclined(user, cluster.name), currentAdminDetails.fcm_token);
      sendUserPersonalNotification(currentAdminDetails, 'New cluster admin request declined', PersonalNotifications.newAdminSelectionRequestDeclined(user, cluster),
        'cluster-admin-request-declined', {  });
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

/**
 * check If cluster does not have an active cluster loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfClusterHasActiveLoan = async(req, res, next) => {
  try {
    const { user, cluster } = req;
    if (cluster.loan_status !== 'inactive') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that cluster has an active loan checkIfClusterHasActiveLoan.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_LOAN_APPLICATION_FAILED_DUE_TO_CURRENT_CLUSTER_STATUS(cluster.loan_status),
        enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_HAS_ACTIVE_LOAN_MIDDLEWARE);
    }
    const [ existingActiveClusterLoan ] = await processAnyData(clusterQueries.fetchClusterActiveLoans, [ cluster.cluster_id ]);
    if (existingActiveClusterLoan) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that cluster has an existing loan
      checkIfClusterHasActiveLoan.middlewares.cluster.js`);
      if (existingActiveClusterLoan.status === 'approved') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that cluster has an ${existingActiveClusterLoan.status} existing loan
        checkIfClusterHasActiveLoan.middlewares.cluster.js`);
        return ApiResponse.error(res, enums.CLUSTER_LOAN_APPLICATION_FAILED_FOR_EXISTING_APPROVED_LOAN_REASON,
          enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_HAS_ACTIVE_LOAN_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that cluster has ${existingActiveClusterLoan.status} existing loan
      checkIfClusterHasActiveLoan.middlewares.cluster.js`);
      const statusType = existingActiveClusterLoan.status === 'processing' || existingActiveClusterLoan.status === 'pending' ?
        `a ${existingActiveClusterLoan.status} loan application` :
        `an ${existingActiveClusterLoan.status} loan`;
      return ApiResponse.error(res, enums.CLUSTER_LOAN_APPLICATION_FAILED_DUE_TO_EXISTING_ACTIVE_LOAN(statusType),
        enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_HAS_ACTIVE_LOAN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms cluster has no active or in progress loan checkIfClusterHasActiveLoan.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_CLUSTER_HAS_ACTIVE_LOAN_MIDDLEWARE;
    logger.error(`Check if cluster has an active loan failed::${enums.CHECK_IF_CLUSTER_HAS_ACTIVE_LOAN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check If cluster has more than 1 cluster member to take a cluster loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkClusterMembersNumber = async(req, res, next) => {
  try {
    const { user, cluster } = req;
    if (parseFloat(cluster.members.length) <= 1) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that cluster does not have more than one active members
      checkClusterMembersNumber.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_MEMBERS_NOT_MORE_THAN_ONE, enums.HTTP_BAD_REQUEST, enums.CHECK_CLUSTER_MEMBERS_NUMBER_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that cluster have more than one active members
    checkClusterMembersNumber.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_CLUSTER_MEMBERS_NUMBER_MIDDLEWARE;
    logger.error(`Check if cluster has more than one member failed::${enums.CHECK_CLUSTER_MEMBERS_NUMBER_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check If cluster member does not have an active cluster loan
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfUserHasActiveClusterLoan = async(req, res, next) => {
  try {
    const { user } = req;
    const  [ existingClusterLoan ]  = await processAnyData(clusterQueries.fetchUserActiveClusterLoans, [ user.user_id ]);
    if (existingClusterLoan) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that user has an existing active cluster loan
      checkIfUserHasActiveClusterLoan.middlewares.cluster.js`);
      if (existingClusterLoan.status === 'approved') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that user has ${existingClusterLoan.status} existing cluster loan
        checkIfUserHasActiveClusterLoan.middlewares.cluster.js`);
        return ApiResponse.error(res, enums.LOAN_APPLICATION_FAILED_FOR_EXISTING_APPROVED_CLUSTER_LOAN_REASON,
          enums.HTTP_BAD_REQUEST, enums.CHECK_IF_USER_HAS_ACTIVE_CLUSTER_LOAN_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that user has ${existingClusterLoan.status} existing cluster loan
      checkIfUserHasActiveClusterLoan.middlewares.cluster.js`);
      const statusType = existingClusterLoan.status === 'processing' || existingClusterLoan.status === 'pending' ?
        `a ${existingClusterLoan.status} cluster loan application` :
        `an ${existingClusterLoan.status} cluster loan`;
      return ApiResponse.error(res, enums.LOAN_APPLICATION_FAILED_DUE_TO_EXISTING_ACTIVE_LOAN(statusType),
        enums.HTTP_BAD_REQUEST, enums.CHECK_IF_USER_HAS_ACTIVE_CLUSTER_LOAN_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms user has no active cluster loan checkIfUserHasActiveClusterLoan.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_USER_HAS_ACTIVE_CLUSTER_LOAN_MIDDLEWARE;
    logger.error(`Check if cluster member has an existing cluster loan failed::${enums.CHECK_IF_USER_HAS_ACTIVE_CLUSTER_LOAN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * validate total cluster amount and breakdown amount based on sharing type
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const totalLoanAmountVerificationAndBreakdown = async(req, res, next) => {
  try {
    const { user, cluster, body } = req;
    const [ clusterMaximumLoanAmountDetails, clusterMinimumLoanAmountDetails ] = await Promise.all([
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'cluster_maximum_loan_amount' ]),
      processOneOrNoneData(loanQueries.fetchAdminSetEnvDetails, [ 'cluster_minimum_loan_amount' ])
    ]);
    if ((parseFloat(body.total_amount) > (parseFloat(parseFloat(clusterMaximumLoanAmountDetails.value))))) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that cluster loan request is greater than cluster maximum allowable amount
      totalLoanAmountVerificationAndBreakdown.middlewares.cluster.js`);
      userActivityTracking(req.user.user_id, 95, 'fail');
      return ApiResponse.error(res, enums.USER_REQUESTS_FOR_CLUSTER_LOAN_AMOUNT_GREATER_THAN_ALLOWABLE, enums.HTTP_BAD_REQUEST,
        enums.TOTAL_LOAN_AMOUNT_VERIFICATION_AND_BREAKDOWN_MIDDLEWARE);
    }
    if ((parseFloat(body.total_amount) < (parseFloat(parseFloat(clusterMinimumLoanAmountDetails.value))))) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms that cluster loan request is lesser than cluster minimum allowable  amount
      totalLoanAmountVerificationAndBreakdown.middlewares.cluster.js`);
      userActivityTracking(req.user.user_id, 95, 'fail');
      return ApiResponse.error(res, enums.USER_REQUESTS_FOR_CLUSTER_LOAN_AMOUNT_LESSER_THAN_ALLOWABLE, enums.HTTP_BAD_REQUEST,
        enums.TOTAL_LOAN_AMOUNT_VERIFICATION_AND_BREAKDOWN_MIDDLEWARE);
    }
    if (body.sharing_type === 'equal') {
      const assignedAmount = (parseFloat(body.total_amount)) / parseFloat(cluster.members.length);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: confirms sharing type is equal and the sharing calculation done
      totalLoanAmountVerificationAndBreakdown.middlewares.cluster.js`);
      body.amount = parseFloat(assignedAmount);
    }
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 95, 'fail');
    error.label = enums.TOTAL_LOAN_AMOUNT_VERIFICATION_AND_BREAKDOWN_MIDDLEWARE;
    logger.error(`Validating cluster total loan amount failed::${enums.TOTAL_LOAN_AMOUNT_VERIFICATION_AND_BREAKDOWN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check cluster loan exists by id
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfClusterLoanApplicationExists = async(req, res, next) => {
  try {
    const { params: { cluster_id, loan_id }, user } = req;
    const [ existingClusterLoanApplication ] = await processAnyData(clusterQueries.fetchClusterLoanDetails, [ cluster_id, loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if cluster loan application exists in the db
    checkIfClusterLoanApplicationExists.middlewares.cluster.js`);
    if (existingClusterLoanApplication) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan application exists and belongs to the stated cluster
      checkIfClusterLoanApplicationExists.middlewares.cluster.js`);
      req.clusterLoanDetails = existingClusterLoanApplication;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan application does not exist for stated cluster
    checkIfClusterLoanApplicationExists.middlewares.cluster.js`);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_NOT_EXISTING_FOR_CLUSTER, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_LOAN_APPLICATION_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_CLUSTER_LOAN_APPLICATION_EXISTS_MIDDLEWARE;
    logger.error(`checking if general cluster loan application exists failed::${enums.CHECK_IF_CLUSTER_LOAN_APPLICATION_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check cluster member loan exists by id
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfMemberClusterLoanApplicationExists = async(req, res, next) => {
  try {
    const { params: { member_loan_id }, user } = req;
    const [ existingClusterMemberLoanApplication ] = await processAnyData(clusterQueries.fetchClusterMemberLoanDetailsByLoanId, [ member_loan_id, user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if cluster loan application exists in the db
    checkIfMemberClusterLoanApplicationExists.middlewares.cluster.js`);
    if (existingClusterMemberLoanApplication) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan application exists and belongs to authenticated user for the stated cluster
      checkIfMemberClusterLoanApplicationExists.middlewares.cluster.js`);
      req.existingLoanApplication = existingClusterMemberLoanApplication;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan application does not exist for authenticated user and/or the stated cluster
    checkIfMemberClusterLoanApplicationExists.middlewares.cluster.js`);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_MEMBER_CLUSTER_LOAN_APPLICATION_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_MEMBER_CLUSTER_LOAN_APPLICATION_EXISTS_MIDDLEWARE;
    logger.error(`checking if cluster loan application exists failed::${enums.CHECK_IF_MEMBER_CLUSTER_LOAN_APPLICATION_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check cluster loan application status is currently still pending
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkIfMemberClusterLoanApplicationStatusIsStillPending = async(req, res, next) => {
  try {
    const { existingLoanApplication, user } = req;
    if (existingLoanApplication.status === 'pending' || existingLoanApplication.status === 'approved' || existingLoanApplication.status === 'in review') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: cluster loan application status is still pending
      checkIfMemberClusterLoanApplicationStatusIsStillPending.middlewares.cluster.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application status is no longer pending
    checkIfMemberClusterLoanApplicationStatusIsStillPending.middlewares.cluster.js`);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_CANCELLING_FAILED_DUE_TO_CURRENT_STATUS(existingLoanApplication.status),
      enums.HTTP_FORBIDDEN, enums.CHECK_IF_MEMBER_CLUSTER_LOAN_APPLICATION_STATUS_IS_STILL_PENDING_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_MEMBER_CLUSTER_LOAN_APPLICATION_STATUS_IS_STILL_PENDING_MIDDLEWARE;
    logger.error(`checking if cluster loan application status is still pending
    failed::${enums.CHECK_IF_MEMBER_CLUSTER_LOAN_APPLICATION_STATUS_IS_STILL_PENDING_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * sorting of loan amount based on loan sharing type
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const sortClusterLoanAmount = async(req, res, next) => {
  try {
    const { existingLoanApplication, user, body } = req;
    body.amount = existingLoanApplication.sharing_type === 'equal' ? parseFloat(existingLoanApplication.amount_requested) : parseFloat(body.amount);
    body.duration_in_months = Number(existingLoanApplication.loan_tenor_in_months);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application amount and tenor adjusted based on sharing type
    sortClusterLoanAmount.middlewares.cluster.js`);
    if (existingLoanApplication.sharing_type === 'equal') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application sharing type is on equal basis sortClusterLoanAmount.middlewares.cluster.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application sharing type is on self allocate basis sortClusterLoanAmount.middlewares.cluster.js`);
    const [ totalAllocatedSum ] = await processAnyData(clusterQueries.fetchSumOfAllocatedLoanAmount, [ existingLoanApplication.loan_id ]);
    const toBeTotalAllocatedSum = parseFloat(totalAllocatedSum.total_allocated_amount) + parseFloat(body.amount);
    const amountAvailableForSharing = parseFloat(existingLoanApplication.total_cluster_amount) - parseFloat(totalAllocatedSum.total_allocated_amount);
    if (parseFloat(toBeTotalAllocatedSum) > parseFloat(existingLoanApplication.total_cluster_amount)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application amount will cause total cluster loan amount to be exceeded
      sortClusterLoanAmount.middlewares.cluster.js`);
      userActivityTracking(req.user.user_id, 98, 'fail');
      return ApiResponse.error(res, enums.ALLOCATED_AMOUNT_EXCEEDING_TOTAL_AMOUNT(`₦${parseFloat(amountAvailableForSharing).toFixed(2)}`), enums.HTTP_BAD_REQUEST,
        enums.SORT_CLUSTER_LOAN_AMOUNT_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application amount will not cause total cluster loan amount to be exceeded
      sortClusterLoanAmount.middlewares.cluster.js`);
    return next();
  } catch (error) {
    userActivityTracking(req.user.user_id, 98, 'fail');
    error.label = enums.SORT_CLUSTER_LOAN_AMOUNT_MIDDLEWARE;
    logger.error(`sorting cluster loan application amount anf tenor based on sharing type failed
    failed::${enums.SORT_CLUSTER_LOAN_AMOUNT_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * fetch the new total loan amounts, repayments, and interests
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const fetchGeneralClusterNewLoanAmountValues = async(req, res, next) => {
  try {
    const { clusterLoanDetails, user } = req;
    if (clusterLoanDetails.status !== 'pending') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application disbursement cannot be processed due to loan status not pending
      fetchGeneralClusterNewLoanAmountValues.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_LOAN_DISBURSEMENT_CANNOT_BE_PROCESSED_DUE_TO_LOAN_STATUS, enums.HTTP_FORBIDDEN,
        enums.FETCH_GENERAL_CLUSTER_NEW_LOAN_AMOUNT_VALUES_MIDDLEWARE);
    }
    if (!clusterLoanDetails.can_disburse_loan) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application disbursement cannot be processed yet due to incomplete members loan decision
      fetchGeneralClusterNewLoanAmountValues.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_LOAN_DISBURSEMENT_CANNOT_BE_PROCESSED_DUE_TO_LOAN_DECISIONS, enums.HTTP_FORBIDDEN,
        enums.FETCH_GENERAL_CLUSTER_NEW_LOAN_AMOUNT_VALUES_MIDDLEWARE);
    }
    const [ [ newClusterAmountValues ], [ qualifiedClusterMembersCount ] ] = await Promise.all([
      processAnyData(clusterQueries.getUpdatedLoanAmountValues, [ clusterLoanDetails.loan_id ]),
      processAnyData(clusterQueries.getCountOfQualifiedClusterMembers, [ clusterLoanDetails.loan_id ])
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: general loan application amount terms fetched successfully from the Db
    fetchGeneralClusterNewLoanAmountValues.middlewares.cluster.js`);
    if (Number(qualifiedClusterMembersCount.count) <= 1) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: Info: loan application disbursement cannot be processed due to number of qualified members not more than one
      fetchGeneralClusterNewLoanAmountValues.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_LOAN_DISBURSEMENT_CANNOT_BE_PROCESSED_DUE_TO_NOT_MORE_THAN_ONE_QUALIFIED_MEMBER, enums.HTTP_FORBIDDEN,
        enums.FETCH_GENERAL_CLUSTER_NEW_LOAN_AMOUNT_VALUES_MIDDLEWARE);
    }
    req.newClusterAmountValues = newClusterAmountValues;
    req.existingLoanApplication = {
      amount_requested: parseFloat(newClusterAmountValues.actual_total_loan_amount)
    };
    return next();
  } catch (error) {
    error.label = enums.FETCH_GENERAL_CLUSTER_NEW_LOAN_AMOUNT_VALUES_MIDDLEWARE;
    logger.error(`fetching for new general loan amounts failed::${enums.FETCH_GENERAL_CLUSTER_NEW_LOAN_AMOUNT_VALUES_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check cluster loan reschedule request exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof ClusterMiddleware
 */
export const checkClusterLoanReschedulingRequest = async(req, res, next) => {
  try {
    const { params: { reschedule_id, member_loan_id }, user } = req;
    const [ clusterLoanRescheduleRequest ] = await processAnyData(clusterQueries.fetchClusterLoanRescheduleRequest, [ reschedule_id, member_loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if cluster loan reschedule request exists
    checkClusterLoanReschedulingRequest.middlewares.cluster.js`);
    if (clusterLoanRescheduleRequest) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan reschedule request exists checkClusterLoanReschedulingRequest.middlewares.cluster.js`);
      if (clusterLoanRescheduleRequest.is_accepted) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan reschedule request has been previously processed
        checkClusterLoanReschedulingRequest.middlewares.cluster.js`);
        userActivityTracking(req.user.user_id, 75, 'fail');
        return ApiResponse.error(res, enums.LOAN_RESCHEDULE_REQUEST_PREVIOUSLY_PROCESSED_EXISTING, enums.HTTP_BAD_REQUEST,
          enums.CHECK_CLUSTER_LOAN_RESCHEDULING_REQUEST_MIDDLEWARE);
      }
      req.loanRescheduleRequest = clusterLoanRescheduleRequest;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan reschedule request does not exists
    checkClusterLoanReschedulingRequest.middlewares.cluster.js`);
    userActivityTracking(req.user.user_id, 75, 'fail');
    return ApiResponse.error(res, enums.LOAN_RESCHEDULE_REQUEST_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_CLUSTER_LOAN_RESCHEDULING_REQUEST_MIDDLEWARE);
  } catch (error) {
    userActivityTracking(req.user.user_id, 75, 'fail');
    error.label = enums.CHECK_CLUSTER_LOAN_RESCHEDULING_REQUEST_MIDDLEWARE;
    logger.error(`checking if cluster loan rescheduling request exists failed::${enums.CHECK_CLUSTER_LOAN_RESCHEDULING_REQUEST_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
