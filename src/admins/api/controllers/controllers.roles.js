import * as RoleService from '../services/services.role';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { adminActivityTracking } from '../../lib/monitor';

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
    await RoleService.createAdminUserRole([ body.name.trim().toLowerCase(), roleCode ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: role created in the DB createRole.admin.controllers.roles.js`);
    const updateRolesPermissions = await body.permissions.map(async(permission) => {
      await RoleService.createRolesPermissions([ roleCode, permission.resource_id, permission.user_permissions.join() ]);
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
    const resources = await RoleService.fetchAdminResources();
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id} Info: admin module permission resources fetched from the DB adminPermissionResources.admin.controllers.roles.js`);
    return ApiResponse.success(res, enums.ADMIN_RESOURCES_FETCHED_SUCCESSFULLY, enums.HTTP_OK, resources);
  } catch (error) {
    error.label = enums.ADMIN_PERMISSION_RESOURCES_CONTROLLER;
    logger.error(`fetching all admin module permission resources from the DB failed:::${enums.ADMIN_PERMISSION_RESOURCES_CONTROLLER}`, error.message);
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
    const admins = await RoleService.fetchNonSuperAdminRoles();
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
    await RoleService.deleteRoleType(role_code);
    await RoleService.deleteRole(role_code);
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
