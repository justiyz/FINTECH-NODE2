import { processAnyData, processOneOrNoneData } from '../services/services.db';
import clusterQueries from '../../../users/api/queries/queries.cluster';
import AdminClusterQueries from '../../../admins/api/queries/queries.cluster';
import enums from '../../../users/lib/enums';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import { generateReferralCode } from '../../../users/lib/utils/lib.util.helpers';



export const checkIfClusterNameUnique = async(req, res, next) => {
  const { body, admin } = req;
  try {
    const [ existingCluster ] = await processAnyData(clusterQueries.checkIfClusterIsUnique, [ body.name?.trim().toLowerCase() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: checked if cluster name already exists in the db checkIfClusterNameUnique.middlewares.cluster.js`);
    if (existingCluster) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: cluster name already exists in the db checkIfClusterNameUnique.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_NAME_ALREADY_EXISTING(body.name), enums.HTTP_BAD_REQUEST, enums.ADMIN_CHECK_IF_CLUSTER_NAME_UNIQUE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: cluster name does nor exists in the db checkIfClusterNameUnique.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.ADMIN_CHECK_IF_CLUSTER_NAME_UNIQUE_MIDDLEWARE;
    logger.error(`checking if cluster name already exists in the DB failed::${enums.ADMIN_CHECK_IF_CLUSTER_NAME_UNIQUE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

export const generateClusterUniqueCode = async(req, res, next) => {
  const { body, admin } = req;
  try {
    const uniqueCode = await generateReferralCode(7);
    const [ existingUniqueCode ] = await processAnyData(clusterQueries.checkIfClusterIsUnique, [ uniqueCode ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: checked if cluster unique code is existing generateClusterUniqueCode.middlewares.cluster.js`);
    if (existingUniqueCode) {
      return generateClusterUniqueCode(req, res, next);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: successfully generates cluster unique code generateClusterUniqueCode.middlewares.cluster.js`);
    body.clusterCode = uniqueCode;
    return next();
  } catch (error) {
    error.label = enums.GENERATE_CLUSTER_UNIQUE_CODE_MIDDLEWARE;
    logger.error(`generating cluster unique code failed::${enums.GENERATE_CLUSTER_UNIQUE_CODE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
  
export const checkIfClusterExists = async(req, res, next) => {
  try {
    const { params: { cluster_id }, admin } = req;
    const [ existingCluster ] = await processAnyData(clusterQueries.checkIfClusterExists, [ cluster_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: checked if cluster is existing in the DB checkIfClusterExists.middlewares.cluster.js`);
    if (existingCluster) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: cluster is existing in the DB checkIfClusterExists.middlewares.cluster.js`);
      if (existingCluster.is_deleted) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: cluster no longer exists in the DB checkIfClusterExists.middlewares.cluster.js`);
        return ApiResponse.error(res, enums.CLUSTER_NO_LONGER_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE);
      }
      const clusterMembers = await processAnyData(clusterQueries.fetchActiveClusterMembers, [ existingCluster.cluster_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: cluster active members fetched from the DB checkIfClusterExists.middlewares.cluster.js`);
      req.cluster = existingCluster;
      req.cluster.members = clusterMembers;
      req.cluster = existingCluster;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: cluster does not exist in the DB checkIfClusterExists.middlewares.cluster.js`);
    return ApiResponse.error(res, enums.CLUSTER_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE;
    logger.error(`checking if cluster exists failed::${enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * admin activate and deactivate cluster member
 * @param {Type} type - The type for conditioning function
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminUserController
 */
export const checkClusterMemberExist = (type) => async(req, res, next) => {
  try {
    const { params: { cluster_id, user_id }, cluster: { members }  } = req;
    const existingClusterMember = await processOneOrNoneData(AdminClusterQueries.fetchClusterMembers, [ cluster_id, user_id ]);
    if (type === 'confirm' && members.find((data) => data.email === req.body.email)) {
      logger.info(`${enums.CURRENT_TIME_STAMP} :::Info: user already belongs to this cluster checkClusterMemberExist.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_ALREADY_CLUSTER_MEMBER, enums.HTTP_CONFLICT, enums.CHECK_CLUSTER_MEMBER_EXIST_MIDDLEWARE);
    }
    if (type === 'validate' && !existingClusterMember) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
      decoded that cluster member does not exist in the DB checkClusterMemberExist.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_MEMBER_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_CLUSTER_MEMBER_EXIST_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_CLUSTER_MEMBER_EXIST_MIDDLEWARE;
    logger.error(`checking if cluster member exists failed::${enums.CHECK_CLUSTER_MEMBER_EXIST_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
