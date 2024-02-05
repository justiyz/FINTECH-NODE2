import ClusterPayload from '../../../admins/lib/payloads/lib.payload.cluster';
import ClusterQueries from '../../../admins/api/queries/queries.cluster';
import UserQueries from '../../../admins/api/queries/queries.user';
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
import { sendSms } from '../services/services.sms';
import { clusterInvitation } from '../../lib/templates/sms';
import { createShortLink } from '../../../users/config/firebase/serviceShort.url';
const { SEEDFI_NODE_ENV } = config;

/**
 * Admin creates cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns newly created cluster details.
 * @memberof AdminClusterController
 */
export const createCluster = async(req, res, next) => {
  const { body, admin } = req;
  const adminName = `${admin.first_name} ${admin.last_name}`;
  try {
    const createClusterPayload = ClusterPayload.createClusterPayload(body, admin);
    const newClusterDetails = await processOneOrNoneData(ClusterQueries.createCluster, createClusterPayload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: cluster created successfully createCluster.controllers.cluster.js`);
    await adminActivityTracking(admin.admin_id, 32, 'success', descriptions.create_cluster(adminName, newClusterDetails.name));
    return ApiResponse.success(res, enums.CLUSTER_CREATED_SUCCESSFULLY, enums.HTTP_OK, newClusterDetails);
  } catch (error) {
    await adminActivityTracking(admin.admin_id, 32, 'fail', descriptions.create_cluster_failed(`${req.admin.first_name} ${req.admin.last_name}`));
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
 * @memberof AdminClusterController
 */

export const fetchAndFilterClusters = async(req, res, next) => {
  try {
    const { query, admin } = req;
    if (query.type === 'admin_cluster') {
      const payload = ClusterPayload.fetchClusters(query);
      const [ adminClusters, [ adminClustersCount ] ] = await Promise.all([
        processAnyData(ClusterQueries.fetchAdminCreatedClustersDetails, payload),
        processAnyData(ClusterQueries.fetchAdminCreatedClustersCount, payload)
      ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched admin created clusters from the DB
      fetchAndFilterClusters.admin.controllers.cluster.js`);
      const data = {
        page: parseFloat(req.query.page) || 1,
        total_count: Number(adminClustersCount.total_count),
        total_pages: Helpers.calculatePages(Number(adminClustersCount.total_count), Number(req.query.per_page) || 10),
        adminClusters
      };
      return ApiResponse.success(res, enums.CLUSTERS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
    }
    const payload = ClusterPayload.fetchClusters(query);
    const [ clusters, [ clusterCount ] ] = await Promise.all([
      processAnyData(ClusterQueries.fetchClustersDetails, payload),
      processAnyData(ClusterQueries.fetchClusterCount, payload)
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
 * @memberof AdminClusterController
 */
export const fetchSingleClusterDetails = async(req, res, next) => {
  try {
    const { params: { cluster_id }, admin }  = req;
    const [ clusterDetails, membersDetails, clustersInvitees ]  = await Promise.all([
      processOneOrNoneData(ClusterQueries.fetchSingleClusterDetails, cluster_id),
      processAnyData(ClusterQueries.fetchClusterMembersDetails, cluster_id),
      processAnyData(ClusterQueries.fetchClustersInvitees, cluster_id)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched single cluster details and its members
    from the DB fetchSingleClusterDetails.admin.controllers.cluster.js`);
    const data = {
      cluster: clusterDetails,
      members: membersDetails,
      clustersInvitees
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
 * @memberof AdminClusterController
 */
export const clusterMemberInvite = async(req, res, next) => {
  try {
    const {body, admin, cluster, userDetails } = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    const payload = ClusterPayload.clusterInvite(body, cluster, admin,  body.type, userDetails);
    const clusterInviteInfo = {inviter: admin.first_name, name: cluster.name};
    const invitedClusterMember = await processOneOrNoneData(ClusterQueries.adminInviteClusterMember, payload);

    const inviteDetails = {admin_id: admin.admin_id, cluster_id: cluster.cluster_id, unique_code: cluster.unique_code};
    const link = await createShortLink(inviteDetails);
    const smsInvite = {cluster_name: cluster.name, link};
    const data = { email: body.email?.trim().toLowerCase(), cluster_name: cluster.name, join_url: link };

    if ((body.type === 'email' || body.type === 'phone_number') && !userDetails) {
      const sendInvite = body.type === 'phone_number' ?
        sendSms(body.phone_number, clusterInvitation(smsInvite)) :  MailService('Cluster Loan Invitation', 'adminClusterInvite', { ...data });
      await sendInvite;
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
      decoded that invited user is not a valid user in the DB. clusterMemberInvite.admin.controllers.cluster.js`);
      return ApiResponse.success(res, enums.ADMIN_CLUSTER_MEMBER_INVITE, enums.HTTP_OK, invitedClusterMember);
    }

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
    decoded that invited user is a valid and active user in the DB. clusterMemberInvite.admin.controllers.cluster.js`);

    if (SEEDFI_NODE_ENV === 'test') {
      return ApiResponse.success(res, enums.ADMIN_CLUSTER_MEMBER_INVITE, enums.HTTP_OK, invitedClusterMember);
    }

    sendPushNotification(userDetails.user_id, PushNotifications.clusterMemberInvitation(), userDetails.fcm_token);
    sendUserPersonalNotification(userDetails, `${cluster.name} cluster invite`,
      PersonalNotifications.inviteClusterMember(clusterInviteInfo), 'cluster-invitation', { ...cluster });
    await MailService('Cluster Loan Invitation', 'adminClusterInvite', { ...data });
    await adminActivityTracking(admin.admin_id, 37, 'success', descriptions.cluster_member_invite(adminName));
    return ApiResponse.success(res, enums.ADMIN_CLUSTER_MEMBER_INVITE, enums.HTTP_OK, invitedClusterMember);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 37, 'fail', descriptions.cluster_member_invite_failed(`${req.admin.first_name} ${req.admin.last_name}`));
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
 * @memberof AdminClusterController
 */
export const activateAndDeactivateCluster = async(req, res, next) => {
  const {body, admin, cluster: { cluster_id, name } } = req;
  const adminName = `${admin.first_name} ${admin.last_name}`;
  const activityType = body.status === 'active' ? 33 : 34;
  const description = body.status === 'active' ? descriptions.activate_cluster(adminName, name) : descriptions.deactivate_cluster(adminName, name);
  try {
    const cluster = await processOneOrNoneData(ClusterQueries.activateOrDeactivateCluster, [ cluster_id, body.status ]);
    if(body.status === 'deactivated'){
      await processAnyData(ClusterQueries.deleteAllClusterMember, [ cluster_id ])
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
    decoded that admin have ${body.status} ${name} cluster in the DB. activateAndDeactivateCluster.admin.controllers.cluster.js`);
    await adminActivityTracking(req.admin.admin_id, activityType, 'success', description);
    return ApiResponse.success(res, enums.ADMIN_EDIT_CLUSTER_STATUS(body.status, name), enums.HTTP_OK, cluster);
  } catch (error) {
    error.label = enums.ACTIVATE_AND_DEACTIVATE_CLUSTER_CONTROLLER;
    logger.error(`Admin activate/deactivate cluster failed::${enums.ACTIVATE_AND_DEACTIVATE_CLUSTER_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * admin deletes/removes cluster member from cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminClusterController
 */
export const deleteClusterMember = async(req, res, next) => {
  const {params: { user_id, cluster_id }, admin, cluster, userClusterDetails } = req;
  const adminName = `${admin.first_name} ${admin.last_name}`;
  try {
    const data = await processOneOrNoneData(ClusterQueries.deleteClusterMember,
      [ cluster_id.trim(), user_id.trim() ]);
    await processOneOrNoneData(ClusterQueries.reduceClusterMembersCount, [ cluster_id.trim() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
     admin have successfully remove cluster member in the DB. deleteClusterMember.admin.controllers.cluster.js`);
    await adminActivityTracking(admin.admin_id, 36, 'success', descriptions.delete_cluster_member(adminName, userClusterDetails.first_name, cluster.name));
    return ApiResponse.success(res, enums.ADMIN_DELETES_CLUSTER_MEMBER, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.DELETE_CLUSTER_MEMBER_CONTROLLER;
    logger.error(`Admin deletes cluster member failed::${enums.DELETE_CLUSTER_MEMBER_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * cluster member bulk invite
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns array of invited member with details
 * @memberof AdminClusterController
 */
export const clusterMemberBulkInvite = async(req, res, next) => {
  try {
    const { admin, cluster, userInvite } = req;
    const inviteDetails = {admin_id: admin.admin_id, cluster_id: cluster.cluster_id, unique_code: cluster.unique_code};
    const link = await createShortLink(inviteDetails);
    const smsInvite = {cluster_name: cluster.name, link};
    const clusterInviteInfo = {inviter: admin.first_name, name: cluster.name};
    const userData = await Promise.all(
      userInvite.map(async(data) => {
        const payload = ClusterPayload.clusterInvite(data, cluster, admin, req.body.type);
        const [ existingUser ] = await processAnyData(UserQueries.getUserByUserEmailOrPhoneNumber, [ data.email || data.phone_number ]);
        if (existingUser) {
          sendPushNotification(existingUser.user_id, PushNotifications.clusterMemberInvitation(), existingUser.fcm_token);
          sendUserPersonalNotification(existingUser, `${cluster.name} cluster invite`,
            PersonalNotifications.inviteClusterMember(clusterInviteInfo), 'cluster-invitation', { ...cluster });
        }
        if (req.body.type === 'phone_number') {
          const invitedMemberBySms = await processOneOrNoneData(ClusterQueries.adminInviteClusterMember, payload);
          await sendSms(data.phone_number, clusterInvitation(smsInvite));
          return invitedMemberBySms;
        }
        const inviteInfo = { join_url: link, email: data.email?.trim().toLowerCase(), cluster_name: cluster.name };
        const invitedMemberByEmail = await processOneOrNoneData(ClusterQueries.adminInviteClusterMember, payload);
        await MailService('Cluster Loan Invitation', 'adminClusterInvite', { ...inviteInfo });
        return invitedMemberByEmail;
      })
    );
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
    admin have successfully sent bulk invite to users. clusterMemberBulkInvite.admin.controllers.cluster.js`);
    return ApiResponse.success(res, enums.ADMIN_CLUSTER_MEMBER_INVITE, enums.HTTP_OK, userData);
  } catch (error) {
    error.label = enums.CLUSTER_MEMBER_BULK_INVITE_CONTROLLER;
    logger.error(`Admin cluster member bulk invite failed::${enums.CLUSTER_MEMBER_BULK_INVITE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * admin edits cluster interest rate type and value
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns updated cluster details.
 * @memberof AdminClusterController
 */
export const editClusterInterestRates = async(req, res, next) => {
  const { body, admin, cluster } = req;
  const adminName = `${admin.first_name} ${admin.last_name}`;
  try {
    const payload = ClusterPayload.clusterInterestRates(body, cluster);
    const data = await processOneOrNoneData(ClusterQueries.editClusterInterests, payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info:
     admin have successfully updated cluster interest rate details in the DB. editClusterInterestRates.admin.controllers.cluster.js`);
    await adminActivityTracking(admin.admin_id, 55, 'success', descriptions.edit_cluster_interest_rate(adminName, cluster.name));
    return ApiResponse.success(res, enums.CLUSTER_INTEREST_RATE_DETAILS_UPDATED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    await adminActivityTracking(admin.admin_id, 55, 'fail', descriptions.edit_cluster_interest_rate_failed(adminName, cluster.name));
    error.label = enums.EDIT_CLUSTER_INTEREST_RATES_CONTROLLER;
    logger.error(`Admin editing cluster interests failed::${enums.EDIT_CLUSTER_INTEREST_RATES_CONTROLLER}`, error.message);
    return next(error);
  }
};
