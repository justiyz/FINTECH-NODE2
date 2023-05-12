import dayjs from 'dayjs';
import AdminPayload from '../../../admins/lib/payloads/lib.payload.cluster';
import clusterQueries from '../../../users/api/queries/queries.cluster';
import AdminQueries from '../../../admins/api/queries/queries.cluster';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { processAnyData, processOneOrNoneData } from '../services/services.db';



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
    const createClusterPayload = AdminPayload.createClusterPayload(body);
    const newClusterDetails = await processOneOrNoneData(AdminQueries.createCluster, createClusterPayload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: cluster created successfully createCluster.controllers.cluster.js`);
    return ApiResponse.success(res, enums.CLUSTER_CREATED_SUCCESSFULLY, enums.HTTP_OK, newClusterDetails);
  } catch (error) {
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
    const payload = AdminPayload.fetchClusters(query);
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


