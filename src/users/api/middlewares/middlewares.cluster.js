import clusterQueries from '../queries/queries.cluster';
import { processAnyData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import { formatUserIncomeRange, generateReferralCode } from '../../lib/utils/lib.util.helpers';
import { userActivityTracking } from '../../lib/monitor';

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
    const [ existingCluster ] = await processAnyData(clusterQueries.checkIfClusterIsUnique, [ body.name.trim().toLowerCase() ]);
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
  const { body, user } = req;
  const activityType = body.type === 'public' ? 47 : 48;
  try {
    if (user.income_range === null) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user is yet to update income range compareUserIncomeRange.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.UPDATE_INCOME_RANGE_FOR_CLUSTER_CREATION, enums.HTTP_BAD_REQUEST, enums.COMPARE_CLUSTER_INCOME_RANGE_MIDDLEWARE);
    }
    // eslint-disable-next-line no-unused-vars
    const { lowerBoundIncome, upperBoundIncome } = formatUserIncomeRange(user.income_range);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user income range from DB properly formatted compareUserIncomeRange.middlewares.cluster.js`);
    if (parseFloat(upperBoundIncome) >= parseFloat(body.minimum_monthly_income)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user minimum income is greater than or equal to cluster minimum income compareUserIncomeRange.middlewares.cluster.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user minimum income is less than cluster minimum income compareUserIncomeRange.middlewares.cluster.js`);
    userActivityTracking(req.user.user_id, activityType, 'fail');
    return ApiResponse.error(res, enums.CLUSTER_MINIMUM_INCOME_GREATER_THAN_USER_MINIMUM_INCOME_EXISTING, enums.HTTP_BAD_REQUEST, enums.COMPARE_CLUSTER_INCOME_RANGE_MIDDLEWARE);
  } catch (error) {
    userActivityTracking(req.user.user_id, activityType, 'fail');
    error.label = enums.COMPARE_CLUSTER_INCOME_RANGE_MIDDLEWARE;
    logger.error(`comparing cluster income range failed::${enums.COMPARE_CLUSTER_INCOME_RANGE_MIDDLEWARE}`, error.message);
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
      generateClusterUniqueCode(req, res, next);
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

