import DB from '../../services/services.db';
import enums from '../../../users/lib/enums';

export const fetchRole = (payload) => DB.transact('fetchRole', payload, enums.ADMIN_ROLE_QUERY);
export const fetchAdminResourceById = (payload) => DB.transact('fetchAdminResourceById', payload, enums.ADMIN_ROLE_QUERY);
export const createAdminUserRole = (payload) => DB.transact('createAdminUserRole', payload, enums.ADMIN_ROLE_QUERY);
export const createRolesPermissions = (payload) => DB.transact('createRolesPermissions', payload, enums.ADMIN_ROLE_QUERY);
export const fetchAdminResources = (payload) => DB.transact('fetchAdminResources', payload, enums.ADMIN_ROLE_QUERY);
