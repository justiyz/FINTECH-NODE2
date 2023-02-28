import dayjs from 'dayjs';
import clusterQueries from '../queries/queries.cluster';
import { processOneOrNoneData } from '../services/services.db';
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
    return ApiResponse.success(res, enums.CLUSTER_CREATED_SUCCESSFULLY, enums.HTTP_OK, newClusterDetails );
  } catch (error) {
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.CREATE_CLUSTER_CONTROLLER;
    logger.error(`creating cluster failed::${enums.CREATE_CLUSTER_CONTROLLER}`, error.message);
    return next(error);
  }
};
