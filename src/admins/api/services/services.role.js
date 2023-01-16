import DB from '../../services/services.db';
import enums from '../../../users/lib/enums';

export const fetchRole = (payload) => DB.transact('fetchRole', payload, enums.ADMIN_ROLE_QUERY);
export const fetchAdminResourceById = (payload) => DB.transact('fetchAdminResourceById', payload, enums.ADMIN_ROLE_QUERY);
export const createAdminUserRole = (payload) => DB.transact('createAdminUserRole', payload, enums.ADMIN_ROLE_QUERY);
export const createRolesPermissions = (payload) => DB.transact('createRolesPermissions', payload, enums.ADMIN_ROLE_QUERY);
export const fetchAdminResources = (payload) => DB.transact('fetchAdminResources', payload, enums.ADMIN_ROLE_QUERY);
export const fetchNonSuperAdminRoles = (payload) => DB.transact('fetchNonSuperAdminRoles', payload, enums.ADMIN_ROLE_QUERY);
export const deleteRole = (payload) => DB.noReturnTransact('deleteRole', payload, enums.ADMIN_ROLE_QUERY);
export const fetchAdminByRoleType = (payload) => DB.singleTransact('fetchAdminByRoleType', payload, enums.ADMIN_ROLE_QUERY);
export const deleteRoleType = (payload) => DB.noReturnTransact('deleteRoleType', payload, enums.ADMIN_ROLE_QUERY);
export const getRoles = async(payload) => DB.multipleTransaction([
  await DB.transact('getAllRoles', payload, enums.ADMIN_ROLE_QUERY),
  await DB.transact('getRoleCount', payload, enums.ADMIN_ROLE_QUERY)
]);
