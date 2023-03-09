import roleQueries from '../queries/queries.role';
import authQueries from '../queries/queries.auth';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import * as Helpers from '../../lib/utils/lib.util.helpers';
import enums from '../../../users/lib/enums';
import { adminActivityTracking } from '../../lib/monitor';
import RolePayload from '../../lib/payloads/lib.payload.roles.js';
import { processAnyData, processNoneData } from '../services/services.db';

/**
 * create role for admin users
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns admin details.
 * @memberof AdminRoleController
 */
export const createRole = async(req, res, next) => {
  try {
    const { body, admin, roleCode } = req;
    await processAnyData(roleQueries.createAdminUserRole, [ body.name.trim().toLowerCase(), roleCode ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: role created in the DB createRole.admin.controllers.roles.js`);
    const updateRolesPermissions = await body.permissions.map(async(permission) => {
      await processAnyData(roleQueries.createRolesPermissions, [ roleCode, permission.resource_id, permission.user_permissions.join() ]);
      return permission;
    });
    await Promise.all([ updateRolesPermissions ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: created role permissions set in the DB createRole.admin.controllers.roles.js`);
    adminActivityTracking(req.admin.admin_id, 4, 'success');
    body.roleCode = roleCode;
    return ApiResponse.success(res, enums.ROLE_CREATION_SUCCESSFUL, enums.HTTP_OK, body);
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 4, 'fail');
    error.label = enums.CREATE_ROLE_CONTROLLER;
    logger.error(`creating role and permissions in the DB failed:::${enums.CREATE_ROLE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch all admin resources
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns admin resources details.
 * @memberof AdminRoleController
 */
export const adminPermissionResources = async(req, res, next) => {
  try {
    const { admin } = req;
    const resources = await processAnyData(roleQueries.fetchAdminResources, [  ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: admin module permission resources fetched from the DB adminPermissionResources.admin.controllers.roles.js`);
    return ApiResponse.success(res, enums.ADMIN_RESOURCES_FETCHED_SUCCESSFULLY, enums.HTTP_OK, resources);
  } catch (error) {
    error.label = enums.ADMIN_PERMISSION_RESOURCES_CONTROLLER;
    logger.error(`fetching all admin module permission resources from the DB failed:::${enums.ADMIN_PERMISSION_RESOURCES_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch role details and permissions
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns non-super admin roles .
 * @memberof AdminRoleController
 */

export const rolePermissions = async(req, res, next) => {
  try {
    const { admin, params: { role_code } } = req;
    const [ roleDetails ] = await processAnyData(roleQueries.fetchRole, [ role_code ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: role details fetched from DB rolePermissions.admin.controllers.roles.js`);
    const adminResources = await processAnyData(roleQueries.fetchAdminResources, [  ]);
    const permissions = await processAnyData(authQueries.fetchRolePermissions, [ role_code ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: role permissions with system resources fetched from DB rolePermissions.admin.controllers.roles.js`);
    const fullRoleBasedResources = await Helpers.processRoleBasedPermissions(role_code, adminResources, permissions);
    const data = {
      ...roleDetails,
      fullRoleBasedResources
    };
    return ApiResponse.success(res, enums.ROLE_PERMISSIONS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.ROLE_PERMISSIONS_CONTROLLER;
    logger.error(`fetching role details with permissions from the DB failed:::${enums.ROLE_PERMISSIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * edit role with permission
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns non-super admin roles .
 * @memberof AdminRoleController
 */

export const editRoleWithPermissions = async(req, res, next) => {
  try {
    const { admin, body, params: { role_code } } = req;
    if (body.name) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: role name is being edited editRoleWithPermissions.admin.middlewares.roles.js`);
      const [ roleName ] = await processAnyData(roleQueries.fetchRole, [ body.name.trim().toLowerCase() ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: admin role queried from DB using role name editRoleWithPermissions.admin.middlewares.roles.js`);
      if (roleName) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: admin role with name already exists in the DB editRoleWithPermissions.admin.middlewares.roles.js`);
        return ApiResponse.error(res, enums.ADMIN_ROLE_NAME_EXISTS(body.name), enums.HTTP_CONFLICT, enums.CHECK_ROLE_NAME_IS_UNIQUE_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: admin role name not existing in the DB editRoleWithPermissions.admin.middlewares.roles.js`);
      await processAnyData(roleQueries.updateRoleName, [ role_code, body.name.trim().toLowerCase() ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: role name edited successfully editRoleWithPermissions.admin.middlewares.roles.js`);
    }
    if (body.permissions) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: role permissions is being edited editRoleWithPermissions.admin.middlewares.roles.js`);
      const editRolesPermissions = await body.permissions.map(async(permission) => {
        const [ resourcePermissionExists ] = await processAnyData(roleQueries.checkIfResourcePermissionCreated, [ role_code,  permission.resource_id ]);
        !resourcePermissionExists ? await processAnyData(roleQueries.createRolesPermissions, [ role_code,  permission.resource_id, permission.user_permissions.join() ]) :
          await processAnyData(roleQueries.editRolePermissions, [ role_code,  permission.resource_id, permission.user_permissions.join() ]);
        return permission;
      });
      await Promise.all([ editRolesPermissions ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: role permissions edited successfully editRoleWithPermissions.admin.middlewares.roles.js`);
    }
    adminActivityTracking(req.admin.admin_id, 15, 'success');
    return ApiResponse.success(res, enums.EDIT_ROLE_DETAILS_SUCCESSFUL, enums.HTTP_OK, { role_code, ...body });
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 15, 'fail');
    error.label = enums.ROLE_PERMISSIONS_CONTROLLER;
    logger.error(`editing role and role permissions failed:::${enums.ROLE_PERMISSIONS_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch role details and permissions
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns details of updated role .
 * @memberof AdminRoleController
 */

export const activateDeactivateRole = async(req, res, next) => {
  const { query: { action }, params: { role_code } } = req;
  try {
    const updatingStatus = action === 'activate' ? 'active' : 'deactivated';
    const [ updatedStatus ] = await processAnyData(roleQueries.updateRoleStatus, [ role_code, updatingStatus ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.admin.admin_id} Info: role details fetched from DB rolePermissions.admin.controllers.roles.js`);
    return ApiResponse.success(res, enums.ACTIVATE_DEACTIVATE_ROLE_SUCCESSFULLY(updatingStatus), enums.HTTP_OK, updatedStatus);
  } catch (error) {
    error.label = enums.ACTIVATE_DEACTIVATE_ROLE_CONTROLLER;
    logger.error(`updating role status in the DB failed:::${enums.ACTIVATE_DEACTIVATE_ROLE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * fetch all non-super admin roles
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns non-super admin roles .
 * @memberof AdminRoleController
 */

export const nonSuperAdminRoles = async(req, res, next) => {
  try {
    const { admin } = req;
    const admins = await processAnyData(roleQueries.fetchNonSuperAdminRoles, [  ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: non-super admin roles successfully fetched from the DB nonSuperAdminRoles.admin.controllers.roles.js`);
    return ApiResponse.success(res, enums.NON_SUPER_ADMINS_FETCHED_SUCCESSFULLY, enums.HTTP_OK, admins);
  } catch (error) {
    error.label = enums.NON_SUPER_ADMIN_CONTROLLER;
    logger.error(`fetching all non-super admin roles from the DB failed:::${enums.NON_SUPER_ADMIN_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
   * delete a role
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @param {Next} next - Call the next operation.
   * @memberof AdminRoleController
   */

export const deleteRole = async (req, res, next) => {
  try {
    const { params: { role_code }, admin } = req;
    await processNoneData(roleQueries.deleteRoleType, [ role_code ]);
    await processNoneData(roleQueries.deleteRole, [ role_code ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully deleted a role from the DB deleteRole.admin.controllers.roles.js`);
    adminActivityTracking(req.admin.admin_id, 14, 'success');
    return ApiResponse.success(res, enums.ROLE_DELETED_SUCCESSFULLY, enums.HTTP_OK);
  } catch (error) {
    adminActivityTracking(req.admin.admin_id, 14, 'fail');
    error.label = enums.DELETE_ROLE_CONTROLLER;
    logger.error(`deleting role in the DB failed:::${enums.DELETE_ROLE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
   * fetch admin roles
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @param {Next} next - Call the next operation.
   * @memberof AdminRoleController
   */

export const fetchRoles = async (req, res, next) => {
  try {
    const { query, admin } = req;
    if(query.export){
      const payload = RolePayload.fetchAllRoles(query);
      const roles = await processAnyData(roleQueries.getAllRoles, payload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched all roles from the DB fetchRoles.admin.controllers.roles.js`);
      const data = {
        total_count: roles.length,
        roles 
      };
      return ApiResponse.success(res, enums.ROLES_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
    }
    const  payload  = RolePayload.fetchRoles(query);
    const [ roles, [ rolesCount ] ] = await Promise.all([
      processAnyData(roleQueries.getRoles, payload),
      processAnyData(roleQueries.getRoleCount, payload)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully fetched roles from the DB fetchRoles.admin.controllers.roles.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(rolesCount.total_count),
      total_pages: Helpers.calculatePages(Number(rolesCount.total_count), Number(req.query.per_page) || 10),
      roles
    };
    return ApiResponse.success(res, enums.ROLES_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_ROLES;
    logger.error(`fetching roles in the DB failed:::${enums.FETCH_ROLES}`, error.message);
    return next(error);
  }
};

/**
   * fetch admins per role
   * @param {Request} req - The request from the endpoint.
   * @param {Response} res - The response returned by the method.
   * @param {Next} next - Call the next operation.
   * @memberof AdminRoleController
   */

export const fetchAdminsPerRole = async (req, res, next) => {
  try {
    const { query, params, admin } = req;
    const payload = RolePayload.fetchAdminsPerRole(query, params);
    const [ admins, [ adminRoleCount ] ] = await Promise.all([
      processAnyData(roleQueries.getAdminsPerRole, payload),
      processAnyData(roleQueries.getAdminsPerRoleCount, payload)
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info:
     successfully fetched admins per role from the DB fetchAdminsPerRole.admin.controllers.roles.js`);
    const data = {
      page: parseFloat(req.query.page) || 1,
      total_count: Number(adminRoleCount.total_count),
      total_pages: Helpers.calculatePages(Number(adminRoleCount.total_count), Number(req.query.per_page) || 10),
      admins
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: successfully return admins per role from the DB fetchAdminsPerRole.admin.controllers.roles.js`);
    return ApiResponse.success(res, enums.ADMINS_PER_ROLES_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_ADMINS_PER_ROLE_CONTROLLER;
    logger.error(`fetching admin per role in the DB failed:::${enums.FETCH_ADMINS_PER_ROLE_CONTROLLER}`, error.message);
    return next(error);
  }
};

