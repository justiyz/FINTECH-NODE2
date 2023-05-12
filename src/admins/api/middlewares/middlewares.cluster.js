import { processAnyData } from '../services/services.db';
import clusterQueries from '../../../users/api/queries/queries.cluster';
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
  
  
