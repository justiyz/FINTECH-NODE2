import dayjs from 'dayjs';
import clusterPayload from '../../../admins/lib/payloads/lib.payload.cluster';
import clusterQueries from '../../../users/api/queries/queries.cluster';
import userQueries from '../queries/queries.user';
import AdminQueries from '../../../admins/api/queries/queries.cluster';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import MailService from '../services/services.email';
import { sendPushNotification, sendUserPersonalNotification } from '../services/services.firebase';
import * as PushNotifications from '../../../admins/lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates/personalNotification';
import config from '../../../users/config/index';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';


const { SEEDFI_NODE_ENV } = config;

/**
 * Admin creates cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns newly created cluster details.
 * @memberof AdminUserController
 */

export const createCluster = async(req, res, next) => {
  const { body, admin } = req;
  try {
    const clusterOpenGrace = await processOneOrNoneData(clusterQueries.fetchClusterGraceOpenPeriod, [ 'join_cluster_grace_in_days' ]);
    const join_cluster_closes_at = dayjs().add(Number(clusterOpenGrace.value), 'days');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: cluster grace period for membership joining set successfully createCluster.controllers.cluster.js`);
    body.join_cluster_closes_at =  join_cluster_closes_at;
    const createClusterPayload = clusterPayload.createClusterPayload(body);
    const newClusterDetails = await processOneOrNoneData(AdminQueries.createCluster, createClusterPayload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: cluster created successfully createCluster.controllers.cluster.js`);
    adminActivityTracking(admin.admin_id, 32, 'success', descriptions.create_cluster(admin.first_name));
    return ApiResponse.success(res, enums.CLUSTER_CREATED_SUCCESSFULLY, enums.HTTP_OK, newClusterDetails);
  } catch (error) {
    adminActivityTracking(admin.admin_id, 32, 'fail', descriptions.create_cluster(req.admin.first_name));
    error.label = enums.ADMIN_CREATE_CLUSTER_CONTROLLER;
    logger.error(`creating cluster failed::${enums.ADMIN_CREATE_CLUSTER_CONTROLLER}`, error.message);
    return next(error);
  }
};


/**
 * fetches and filters all clusters
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns clusters details.
 * @memberof AdminUserController
 */

export const fetchAndFilterClusters = async(req, res, next) => {
  try {
    const { query, admin } = req;
    const payload = clusterPayload.fetchClusters(query);
    const [ clusters, [ clusterCount ] ] = await Promise.all([
      processAnyData(AdminQueries.fetchClustersDetails, payload),
      processAnyData(AdminQueries.fetchClusterCount, payload)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched clusters from the DB fetchAndFilterClusters.admin.controllers.cluster.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(clusterCount.total_count),
      total_pages: Helpers.calculatePages(Number(clusterCount.total_count), Number(req.query.per_page) || 10),
      clusters
    };
    return ApiResponse.success(res, enums.CLUSTERS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.ADMIN_FETCH_CLUSTERS_CONTROLLER;
    logger.error(`fetching clusters in the DB failed:::${enums.ADMIN_FETCH_CLUSTERS_CONTROLLER}`, error.message);
    return next(error); 
  }
};

/**
 * fetches single cluster details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminUserController
 */
export const fetchSingleClusterDetails = async(req, res, next) => {
  try {
    const { params: { cluster_id }, admin }  = req;
    const [ clusterDetails, membersDetails ]  = await Promise.all([
      processOneOrNoneData(AdminQueries.fetchSingleClusterDetails, cluster_id),
      processAnyData(AdminQueries.fetchClusterMembersDetails, cluster_id)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched single cluster details and its members 
    from the DB fetchSingleClusterDetails.admin.controllers.cluster.js`);
    const data = {
      cluster: clusterDetails,
      members: membersDetails
    };
    return ApiResponse.success(res, enums.CLUSTER__DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.ADMIN_FETCH_CLUSTERS_CONTROLLER;
    logger.error(`fetching cluster details in the DB failed:::${enums.ADMIN_FETCH_CLUSTERS_CONTROLLER}`, error.message);
    return next(error);     
  }
};

/**
 * admin invite cluster member  
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminUserController
 */
export const clusterMemberInvite = async(req, res, next) => {
  try {
    const {body, admin, cluster } = req;
    const [ invitedUser ] =  await processAnyData(userQueries.getUserByUserEmail, [ body.email.trim().toLowerCase() ]);
    const payload = clusterPayload.clusterInvite(body, cluster, admin, invitedUser);
    const inviteInfo = {inviter: admin.first_name, name: cluster.name};
    const data = {
      email: body.email.trim().toLowerCase(),
      cluster_name: cluster.name,
      join_url: body.link_url
    };

    adminActivityTracking(admin.admin_id, 40, 'success', descriptions.cluster_member_invite(admin.first_name));
    if (!invitedUser) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
      decoded that invited user email is NOT a valid email in the DB. clusterMemberInvite.admin.controllers.cluster.js`);
      const clusterInvite = await processOneOrNoneData(AdminQueries.adminInviteClusterMember, payload);
      if (SEEDFI_NODE_ENV === 'test') {
        return ApiResponse.success(res, enums.ADMIN_CLUSTER_MEMBER_INVITE, enums.HTTP_OK, clusterInvite);
      }

      await MailService('Cluster Loan Invitation', 'adminClusterInvite', { ...data });
      return ApiResponse.success(res, enums.ADMIN_CLUSTER_MEMBER_INVITE, enums.HTTP_OK, clusterInvite);
    }

    if (body.email.trim().toLowerCase() === invitedUser.email) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: 
      decoded that invited user is a valid and active user in the DB. clusterMemberInvite.admin.controllers.cluster.js`);
      const clusterMember = await processOneOrNoneData(AdminQueries.adminInviteClusterMember, payload);

      if (SEEDFI_NODE_ENV === 'test') {
        return ApiResponse.success(res, enums.ADMIN_CLUSTER_MEMBER_INVITE, enums.HTTP_OK, clusterMember);
      }

      sendPushNotification(invitedUser.user_id, PushNotifications.clusterMemberInvitation, invitedUser.fcm_token);
      sendUserPersonalNotification(invitedUser, `${cluster.name} cluster invite`, PersonalNotifications.inviteClusterMember(inviteInfo), 'cluster-invitation', { ...cluster });
      await MailService('Cluster Loan Invitation', 'adminClusterInvite', { ...data });
      return ApiResponse.success(res, enums.ADMIN_CLUSTER_MEMBER_INVITE, enums.HTTP_OK, clusterMember);
    }
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 40, 'success', descriptions.cluster_member_invite(req.admin.first_name));
    error.label = enums.CLUSTER_MEMBER_INVITE_CONTROLLER;
    logger.error(`Admin inviting cluster member failed::${enums.CLUSTER_MEMBER_INVITE_CONTROLLER}`, error.message);
    return next(error);
  }
};


/**
 * admin activate and deactivate cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminUserController
 */
export const activateAndDeactivateCluster = async(req, res, next) => {
  const {body, admin, cluster: { cluster_id, name } } = req;
  const activityType = body.status === 'active' ? 33 : 34;
  const description = body.status === 'active' ? descriptions.activate_cluster(admin.first_name, name) : descriptions.deactivate_cluster(admin.first_name, name);
  try {
    const cluster = await processOneOrNoneData(AdminQueries.activateOrDeactivateCluster, [ cluster_id, body.status ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: 
    decoded that admin have ${body.status} ${name} cluster in the DB. activateAndDeactivateCluster.admin.controllers.cluster.js`);
    adminActivityTracking(req.admin.admin_id, activityType, 'success', description);
    return ApiResponse.success(res, enums.ADMIN_EDIT_CLUSTER_STATUS(body.status, name), enums.HTTP_OK, cluster);
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, activityType, 'fail', description);
    error.label = enums.ACTIVATE_AND_DEACTIVATE_CLUSTER_CONTROLLER;
    logger.error(`Admin activate/deactivate cluster failed::${enums.ACTIVATE_AND_DEACTIVATE_CLUSTER_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * admin activate and deactivate cluster member
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminUserController
 */
export const activateAndDeactivateClusterMember = async(req, res, next) => {
  const {body, params: { user_id, cluster_id },admin } = req;
  const activityType = body.status === 'active' ? 39 : 40;
  const description = body.status === 'active' ? descriptions.deactivated_cluster_member(admin.first_name) : descriptions.activate_cluster_member(admin.first_name);
  try {
    const data = await processOneOrNoneData(AdminQueries.activateOrDeactivateClusterMember, 
      [ cluster_id.trim(), user_id.trim(), body.status ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: 
     admin have successfully ${body.status} cluster member in the DB. activateAndDeactivateClusterMember.admin.controllers.cluster.js`);
    adminActivityTracking(admin.admin_id, activityType, 'success', description);
    return ApiResponse.success(res, enums.ADMIN_EDIT_CLUSTER_MEMBER_STATUS(body.status), enums.HTTP_OK, data);
  } catch (error) {
    adminActivityTracking(admin.admin_id, activityType, 'fail', description);
    error.label = enums.ACTIVATE_AND_DEACTIVATE_CLUSTER_CONTROLLER;
    logger.error(`Admin activate/deactivate cluster member failed::${enums.ACTIVATE_AND_DEACTIVATE_CLUSTER_CONTROLLER}`, error.message);
    return next(error);
  }
};
