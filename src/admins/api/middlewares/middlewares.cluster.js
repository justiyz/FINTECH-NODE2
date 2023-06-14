import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ClusterQueries from '../../../users/api/queries/queries.cluster';
import AdminClusterQueries from '../../../admins/api/queries/queries.cluster';
import UserQueries from '../queries/queries.user';
import enums from '../../../users/lib/enums';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import { generateReferralCode } from '../../../users/lib/utils/lib.util.helpers';


/**
 * check if cluster name unique
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminClusterMiddleware
 */
export const checkIfClusterNameUnique = async(req, res, next) => {
  const { body, admin } = req;
  try {
    const [ existingCluster ] = await processAnyData(ClusterQueries.checkIfClusterIsUnique, [ body.name?.trim().toLowerCase() ]);
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

/**
 * generate cluster unique code
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminClusterMiddleware
 */
export const generateClusterUniqueCode = async(req, res, next) => {
  const { body, admin } = req;
  try {
    const uniqueCode = await generateReferralCode(7);
    const [ existingUniqueCode ] = await processAnyData(ClusterQueries.checkIfClusterIsUnique, [ uniqueCode ]);
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
  
/**
 * admin check if cluster exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminClusterMiddleware
 */
export const checkIfClusterExists = async(req, res, next) => {
  try {
    const { params: { cluster_id }, admin } = req;
    const [ existingCluster ] = await processAnyData(AdminClusterQueries.checkIfClusterExists, [ cluster_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: checked if cluster is existing in the DB checkIfClusterExists.middlewares.cluster.js`);
    if (existingCluster) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: cluster is existing in the DB checkIfClusterExists.middlewares.cluster.js`);
      if (existingCluster.is_deleted) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: cluster no longer exists in the DB checkIfClusterExists.middlewares.cluster.js`);
        return ApiResponse.error(res, enums.CLUSTER_NO_LONGER_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_CLUSTER_EXISTS_MIDDLEWARE);
      }
      const clusterMembers = await processAnyData(ClusterQueries.fetchActiveClusterMembers, [ existingCluster.cluster_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: cluster active members fetched from the DB checkIfClusterExists.middlewares.cluster.js`);
      req.cluster = existingCluster;
      req.cluster.members = clusterMembers;
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
 * middle to check cluster member exist
 * @param {Type} type - The type for conditioning function
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminClusterMiddleware
 */
export const checkClusterMemberExist = (type) => async(req, res, next) => {
  try {
    const { params: { cluster_id, user_id }, cluster: { members }  } = req;
    const userDetails = 
      await processOneOrNoneData(UserQueries.getUserByUserEmailOrPhoneNumber, [ req.body.email || req.body.phone_number ]);
    const existingClusterMember = await processOneOrNoneData(AdminClusterQueries.fetchClusterMember, [ cluster_id, user_id ]);

    if (type === 'confirm' && members.find((data) => data.email === req.body.email)) {
      logger.info(`${enums.CURRENT_TIME_STAMP} :::Info: user already belongs to this cluster checkClusterMemberExist.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.USER_ALREADY_CLUSTER_MEMBER, enums.HTTP_CONFLICT, enums.CHECK_CLUSTER_MEMBER_EXIST_MIDDLEWARE);
    }

    if (type === 'validate' && !existingClusterMember) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
      decoded that cluster member does not exist in the DB checkClusterMemberExist.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_MEMBER_NOT_EXISTING, enums.HTTP_BAD_REQUEST, enums.CHECK_CLUSTER_MEMBER_EXIST_MIDDLEWARE);
    }
    req.userDetails = userDetails;
    req.userClusterDetails = existingClusterMember;
    return next();
  } catch (error) {
    error.label = enums.CHECK_CLUSTER_MEMBER_EXIST_MIDDLEWARE;
    logger.error(`checking if cluster member exists failed::${enums.CHECK_CLUSTER_MEMBER_EXIST_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check cluster current status
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminClusterMiddleware
 */
export const checkClusterCurrentStatus = async(req, res, next) => {
  const { cluster, admin, body } = req;
  try {
    if (cluster.status === 'active' && body.status === 'active') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: cluster status is active and status action is to activate 
      checkClusterCurrentStatus.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_STATUS_SAME_AS_STATUS_ACTION(cluster.status), enums.HTTP_BAD_REQUEST, enums.CHECK_CLUSTER_CURRENT_STATUS_MIDDLEWARE);
    }
    if (cluster.status === 'deactivated' && body.status === 'deactivated') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: cluster status is deactivated and status action is to deactivate 
      checkClusterCurrentStatus.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.CLUSTER_STATUS_SAME_AS_STATUS_ACTION(cluster.status), enums.HTTP_BAD_REQUEST, enums.CHECK_CLUSTER_CURRENT_STATUS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: cluster status and action status are not the same checkClusterCurrentStatus.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_CLUSTER_CURRENT_STATUS_MIDDLEWARE;
    logger.error(`checking if cluster current status is nit same as what is being sent failed::${enums.CHECK_CLUSTER_CURRENT_STATUS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if cluster has existing loan obligations
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns single cluster details.
 * @memberof AdminClusterMiddleware
 */
export const checkClusterLoanStatus = async(req, res, next) => {
  const { cluster, admin, body } = req;
  try {
    if (body.status === 'active') {
      return next();
    }
    if (cluster.loan_status !== 'inactive') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: cluster loan status is not inactive checkClusterLoanStatus.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.ACTIVE_CLUSTER_LOAN_OBLIGATIONS, enums.HTTP_FORBIDDEN, enums.CHECK_CLUSTER_LOAN_STATUS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: cluster loan status is inactive checkClusterLoanStatus.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_CLUSTER_LOAN_STATUS_MIDDLEWARE;
    logger.error(`checking if cluster has an active loan obligation in the DB failed::${enums.CHECK_CLUSTER_LOAN_STATUS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if cluster member has existing loan obligations
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminClusterMiddleware
 */
export const checkUserClusterLoanStatus = async(req, res, next) => {
  const { userClusterDetails, admin } = req;
  try {
    if (userClusterDetails.loan_status !== 'inactive') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: user cluster loan status is not inactive checkUserClusterLoanStatus.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.ACTIVE_CLUSTER_MEMBER_LOAN_OBLIGATIONS, enums.HTTP_FORBIDDEN, enums.CHECK_USER_CLUSTER_LOAN_STATUS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.user_id}:::Info: user cluster loan status is inactive checkUserClusterLoanStatus.middlewares.cluster.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_USER_CLUSTER_LOAN_STATUS_MIDDLEWARE;
    logger.error(`checking if user has an active cluster loan status in the DB failed::${enums.CHECK_USER_CLUSTER_LOAN_STATUS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * filter cluster invite already existing member
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response)
 * @memberof AdminClusterMiddleware
 */
export const clusterMemberBulkInvite = async(req, res, next) => {
  try {
    const { cluster: { members }, body: {data} } = req;

    const clusterMembers = new Set(members.map(({ email, phone_number }) => email || phone_number));
    const userInvite = data.filter(({ email, phone_number }) => !(clusterMembers.has(email) || clusterMembers.has(phone_number)));

    if (!userInvite.length) return ApiResponse.success(res, enums.CLUSTER_MEMBER_ALREADY_EXIST, enums.HTTP_OK);
   
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
    successfully filtered newly invited members with already existing cluster members in the DB  clusterMemberBulkInvite.admin.middlewares.bvn.js`);
    req.userInvite = userInvite;
    return next();
  } catch (error) {
    error.label = enums.CLUSTER_MEMBER_BULK_INVITE_MIDDLEWARE;
    logger.error(`checking if user has an active cluster loan status in the DB failed::${enums.CLUSTER_MEMBER_BULK_INVITE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

export const adminClusterRestriction = async(req, res, next) => {
  try {
    if (!req.cluster.is_created_by_admin) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
      admin is restricted from inviting/removing user on cluster not created by admin adminClusterRestriction.admin.middlewares.cluster.js`);
      return ApiResponse.error(res, enums.ADMIN_CLUSTER_RESTRICTED_ACTION, enums.HTTP_FORBIDDEN, enums.ADMIN_CLUSTER_RESTRICTED_ACTION_MIDDLEWARE);
    }

    return next();
  } catch (error) {
    error.label = enums.CHECK_ADMIN_TYPE_MIDDLEWARE;
    logger.error(`checking if queried admin is super admin failed::${enums.CHECK_ADMIN_TYPE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
