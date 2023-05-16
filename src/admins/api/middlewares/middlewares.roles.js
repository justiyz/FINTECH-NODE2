
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import roleQueries from '../queries/queries.role';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import { adminActivityTracking } from '../../lib/monitor';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import * as descriptions from '../../lib/monitor/lib.monitor.description';

/**
 * check if admin user has valid access to resource
 * @param {String} resource - The name of the admin resource
 * @param {String} action - The name of the expected action
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminRoleMiddleware
 */
export const adminAccess = (resource, action) => async(req, res, next) => {
  try {
    const { permissions } = req.admin;
    if (req.admin.role_type === 'SADM') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: confirms this is a super admin initiated action adminAccess.admin.middlewares.roles.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: confirms this is not a super admin initiated action adminAccess.admin.middlewares.roles.js`);
    const allowedRoleResource = Object.keys(permissions.role_permissions);
    const allowedAdminResource = Object.keys(permissions.admin_permissions);
    if (allowedRoleResource.includes(resource.trim()) || allowedAdminResource.includes(resource.trim())) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}::: Info: admin have access to perform action adminAccess.admin.middlewares.roles.js`);
      const allowedRolePermissions = permissions.role_permissions[`${resource}`] || [];
      const allowedAdminPermissions = permissions.admin_permissions[`${resource}`] || [];
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: check if admin have resource permissions adminAccess.admin.middlewares.roles.js`);
      if (allowedRolePermissions.includes(action) || allowedAdminPermissions.includes(action)) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}::: Info: admin have access to perform action adminAccess.admin.middlewares.roles.js`);
        return next();
      }
      return  ApiResponse.error(res, enums.ADMIN_CANNOT_PERFORM_ACTION(action, resource), enums.HTTP_FORBIDDEN, enums.ADMIN_ACCESS_MIDDLEWARE);
    }
    return  ApiResponse.error(res, enums.ADMIN_RESOURCE_ACTION(resource), enums.HTTP_FORBIDDEN, enums.ADMIN_ACCESS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.ADMIN_ACCESS_MIDDLEWARE;
    logger.error(`Validating if admin has resource access failed:::${enums.ADMIN_ACCESS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if role name is unique
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminRoleMiddleware
 */
export const checkRoleNameIsUnique = async(req, res, next) => {
  try {
    const { body: { name }, admin} = req;
    const adminName = `${admin.first_name} ${admin.last_name}`;
    
    const roleCode = Helpers.generateRandomAlphabets(5);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: random role code generated for the role checkRoleNameIsUnique.admin.middlewares.roles.js`);
    const [ codeExists ] = await processAnyData(roleQueries.fetchRole, [ roleCode.trim().toUpperCase() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: fetch result on if role code exists already in the DB 
    checkRoleNameIsUnique.admin.middlewares.roles.js`);
    if (codeExists) {
      return checkRoleNameIsUnique(req, res, next);
    }
    const [ roleName ] = await processAnyData(roleQueries.fetchRole, [ name.trim().toLowerCase() ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: admin role queried from DB using role name checkRoleNameIsUnique.admin.middlewares.roles.js`);
    if (roleName) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: admin role already exists in the DB checkRoleNameIsUnique.admin.middlewares.roles.js`);
      adminActivityTracking(req.admin.admin_id, 4, 'fail', descriptions.create_role_permission_failed(adminName, name?.trim()));
      return ApiResponse.error(res, enums.ADMIN_ROLE_NAME_EXISTS(name), enums.HTTP_CONFLICT, enums.CHECK_ROLE_NAME_IS_UNIQUE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: admin role does not exists in the DB checkRoleNameIsUnique.admin.middlewares.roles.js`);
    req.roleCode = roleCode.trim().toUpperCase();
    return next();
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 4, 'fail', descriptions.create_role_permission_failed(`${req.admin.first_name} ${req.admin.last_name}`, req.body.name?.trim()));
    error.label = enums.CHECK_ROLE_NAME_IS_UNIQUE_MIDDLEWARE;
    logger.error(`checking if admin role name already exists in the DB failed:::${enums.CHECK_ROLE_NAME_IS_UNIQUE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if role code to be manipulated is for the super admin.
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminRoleMiddleware
 */
export const checkIfSuperAdminRole = async(req, res, next) => {
  try {
    const role = req.body.role_code || req.params.role_code;
    if (!role) {
      return next();
    }
    if (role === 'SADM') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: confirms that role is a super admin role checkIfSuperAdminRole.admin.middlewares.admin.js`);
      return ApiResponse.error(res, req.body.role_code ? enums.SUPER_ADMIN_ROLE_NONASSIGNABLE : enums.ACTION_NOT_ALLOWED_FOR_SUPER_ADMIN, 
        enums.HTTP_FORBIDDEN, enums.CHECK_IF_SUPER_ADMIN_ROLE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: confirms that role is a non super admin role checkIfSuperAdminRole.admin.middlewares.admin.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_SUPER_ADMIN_ROLE_MIDDLEWARE;
    logger.error(`checking if super admin role code failed:::${enums.CHECK_IF_SUPER_ADMIN_ROLE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check role current status if active or deactivated
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminRoleMiddleware
 */
export const checkRoleCurrentStatus = async(req, res, next) => {
  try {
    const { roleDetails, query: { action } } = req;
    if (roleDetails.status === 'active' && action === 'activate') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: confirms that role status is ${roleDetails.status} and action is ${action} 
      checkRoleCurrentStatus.admin.middlewares.roles.js`);
      return ApiResponse.error(res, enums.CANNOT_PERFORM_ACTION_BASED_ON_CURRENT_STATUS(action,roleDetails.status), 
        enums.HTTP_BAD_REQUEST, enums.CHECK_ROLE_CURRENT_STATUS_MIDDLEWARE);
    }
    if (roleDetails.status === 'deactivated' && action === 'deactivate') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: confirms that role status is ${roleDetails.status} and action is ${action} 
      checkRoleCurrentStatus.admin.middlewares.roles.js`);
      return ApiResponse.error(res, enums.CANNOT_PERFORM_ACTION_BASED_ON_CURRENT_STATUS(action,roleDetails.status), 
        enums.HTTP_BAD_REQUEST, enums.CHECK_ROLE_CURRENT_STATUS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: confirms that role status is ${roleDetails.status} and action is ${action} 
    checkRoleCurrentStatus.admin.middlewares.roles.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_ROLE_CURRENT_STATUS_MIDDLEWARE;
    logger.error(`checking role status and action can work failed:::${enums.CHECK_ROLE_CURRENT_STATUS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if admin resource exists or is unique
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminRoleMiddleware
 */
export const checkAdminResources = async(req, res, next) => {
  try {
    if (!req.body.permissions) {
      return next();
    }
    const { body: { permissions } } = req;
    const uniqueResources = [];
    const nonexistingResources = [];
    const duplicateResources = [];
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: admins permissions resources about to be aggregated based on existence and uniqueness 
    checkAdminResources.admin.middlewares.roles.js`);
    const processPermissions = await permissions.map(async(permission) => {
      const [ resource ] = await processAnyData(roleQueries.fetchAdminResourceById, [ permission.resource_id ]);
      if (!resource) {
        nonexistingResources.push(permission.resource_id);
        return permission;
      }
      if (uniqueResources.includes(permission.resource_id)) {
        duplicateResources.push(resource);
        return permission;
      }
      uniqueResources.push(permission.resource_id);
      return permission;
    });
    await Promise.allSettled(processPermissions);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: admins permissions resources completely aggregated based on existence and uniqueness 
    checkAdminResources.admin.middlewares.roles.js`);
    if (nonexistingResources.length > 0) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: a resource with invalid resource_id was sent checkAdminResources.admin.middlewares.roles.js`);
      return ApiResponse.error(res, enums.RESOURCE_ID_SENT_NOT_EXISTS(nonexistingResources[0]), enums.HTTP_BAD_REQUEST, enums.CHECK_ROLE_NAME_IS_UNIQUE_MIDDLEWARE);
    }
    if (duplicateResources.length > 0) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: a resource had its resource_id repeated more than once 
      checkAdminResources.admin.middlewares.roles.js`);
      return ApiResponse.error(res, enums.RESOURCE_REPEATING_IN_PAYLOAD(duplicateResources[0].name), enums.HTTP_BAD_REQUEST, enums.CHECK_ROLE_NAME_IS_UNIQUE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: resources are both unique and existing checkAdminResources.admin.middlewares.roles.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_ADMIN_RESOURCES_MIDDLEWARE;
    logger.error(`checking if admin resource to be assigned to the role exists and are unique in the DB 
    failed:::${enums.CHECK_ROLE_NAME_IS_UNIQUE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};


/**
 * check if role name is unique
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminRoleMiddleware
 */
export const checkIfRoleHasBeenAssigned = async(req, res, next) => {
  try {
    const { params: { role_code } } = req;
    const admins = await processOneOrNoneData(roleQueries.fetchAdminByRoleType, [ role_code ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: successfully fetched admin by his role type 
    checkIfRoleHasBeenAssigned.admin.middlewares.roles.js`);
    if (admins) {
      return ApiResponse.error(res, enums.ROLE_HAS_BEEN_ASSIGNED_TO_AN_ADMIN, enums.HTTP_FORBIDDEN);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_ROLE_HAS_BEEN_ASSIGNED;
    logger.error(`checking if  role has already been assigned to an admin in the DB failed:::${enums.CHECK_IF_ROLE_HAS_BEEN_ASSIGNED}`, error.message);
    return next(error);
  }
};
  
/**
 * check if role code matches with the role in the DB.
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminRoleMiddleware
 */
export const validateRoleCode = async(req, res, next) => {
  try {
    const role = req.body.role_code || req.params.role_code;
    if (!role) {
      return next();
    }
    const [ roleCode ] =  await processAnyData(roleQueries.fetchRole, [ role ]);
    if (!roleCode) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
    successfully confirms that role code doesn't exist in the database. validateRoleCode.admin.middlewares.roles.js`);
      return ApiResponse.error(res, enums.VALIDATE_ROLE_CODE_NOT_EXIST, enums.HTTP_BAD_REQUEST, enums.VALIDATE_ROLE_CODE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
    successfully confirms that role code exist in the database. validateRoleCode.admin.middlewares.roles.js`);
    req.roleDetails = roleCode;
    return next();
  } catch (error) {
    error.label = enums.CHECK_ADMIN_RESOURCES_MIDDLEWARE;
    logger.error(`checking if role code exist failed:::${enums.CHECK_ROLE_NAME_IS_UNIQUE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if role is active
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminRoleMiddleware
 */
export const IsRoleActive = async(req, res, next) => {
  try {
    const { roleDetails } = req;
    if (roleDetails.status !== 'active') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id}:::Info: 
       decoded that role ${roleDetails.name} is deactivated. IsRoleActive.admin.middlewares.roles.js`);
      return ApiResponse.error(res, enums.IS_ROLE_ACTIVE, enums.HTTP_BAD_REQUEST, enums.IS_ROLE_ACTIVE_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.IS_ROLE_ACTIVE;
    logger.error(`checking if role code is active failed:::${enums.IS_ROLE_ACTIVE}`, error.message);
    return next(error);
  }
};
