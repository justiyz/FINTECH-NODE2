import dayjs from 'dayjs';
import clusterQueries from '../queries/queries.cluster';
import { processOneOrNoneData, processAnyData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import ClusterPayload from '../../lib/payloads/lib.payload.cluster';
import { createClusterNotification } from '../services/services.firebase';
import { userActivityTracking } from '../../lib/monitor';


/**
 * create cluster
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the cluster details
 * @memberof ClusterController
 */
export const createCluster = async (req, res, next) => {
  const { body, user } = req;
  const activityType = body.type === 'public' ? 47 : 48;
  try {
    const clusterOpenGrace = await processOneOrNoneData(clusterQueries.fetchClusterGraceOpenPeriod, [ 'join_cluster_grace_in_days' ]);
    const join_cluster_closes_at = dayjs().add(Number(clusterOpenGrace.value), 'days');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster grace period for membership joining set successfully createCluster.controllers.cluster.js`);
    body.join_cluster_closes_at = join_cluster_closes_at;
    const createClusterPayload = ClusterPayload.createClusterPayload(body, user);
    const newClusterDetails = await processOneOrNoneData(clusterQueries.createCluster, createClusterPayload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster created successfully successfully createCluster.controllers.cluster.js`);
    const clusterMemberDetails = await processOneOrNoneData(clusterQueries.createClusterMember, [ newClusterDetails.cluster_id, user.user_id, true ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster admin member created successfully successfully createCluster.controllers.cluster.js`);
    createClusterNotification(user, body, newClusterDetails, clusterMemberDetails, `${user.first_name} ${user.last_name} created ${body.type} cluster ${body.name}`, 'create-cluster', {});
    userActivityTracking(req.user.user_id, activityType, 'success');
    return ApiResponse.success(res, enums.CLUSTER_CREATED_SUCCESSFULLY, enums.HTTP_OK, { ...newClusterDetails, user_referral_code: user.referral_code } );
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

export const fetchClusters = async (req, res, next) => {
  try {
    const {query: { type }, user} = req;
    if(type === 'explore') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: type ${type} is decoded fetchClusters.users.controllers.user.js`);
      const clusters = await processAnyData(clusterQueries.fetchClusters);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched all available clusters in the DB fetchClusters.users.controllers.user.js`); 
      await Promise.all(
        clusters.map(async(cluster)=> {
          const [ userClusters ] = await processAnyData(clusterQueries.fetchActiveClusterUser, [ user.user_id, cluster.cluster_id ]);
          if(userClusters){
            cluster.is_member = true;
            return cluster;
          }
          cluster.is_member = false;
          return cluster;
        })
      );
      
      return ApiResponse.success(res, enums.CLUSTER_FETCHED_SUCCESSFULLY, enums.HTTP_OK, clusters);
    }
    if(type === 'my cluster') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: type ${type} is decoded fetchClusters.users.controllers.user.js`);
      const userClusters = await processAnyData(clusterQueries.fetchUserClusters, user.user_id );
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched all user clusters in the DB fetchClusters.users.controllers.user.js`);
      for(let cluster of userClusters){
        cluster.is_member = true;
      }
      return ApiResponse.success(res, enums.CLUSTER_FETCHED_SUCCESSFULLY, enums.HTTP_OK, userClusters);
    }
    if(type === 'created') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: type ${type} is decoded fetchClusters.users.controllers.user.js`);
      const createdClusters = await processAnyData(clusterQueries.fetchUserCreatedClusters, user.user_id );
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched clusters created by user in the DB fetchClusters.users.controllers.user.js`);
      await Promise.all(
        createdClusters.map(async(cluster)=> {
          const [ userClusters ] = await processAnyData(clusterQueries.fetchActiveClusterUser, [ user.user_id, cluster.cluster_id ]);
          if(userClusters){
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

export const fetchClusterDetails = async (req, res, next) => {
  try {
    const { params:{ cluster_id }, user } = req;
    const clusterDetails = await processOneOrNoneData(clusterQueries.fetchClusterDetails, cluster_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id} Info: successfully fetched cluster details in the DB fetchClusters.users.controllers.user.js`);
    return ApiResponse.success(res, enums.CLUSTER_DETAILS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, {...clusterDetails, user_referral_code: user.referral_code});
  } catch (error) {
    error.label = enums.FETCH_CLUSTER_DETAILS_CONTROLLER;
    logger.error(`fetching cluster details failed::${enums.FETCH_CLUSTER_DETAILS_CONTROLLER}`, error.message);
    return next(error);
  }
};
