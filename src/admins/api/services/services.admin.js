import DB from '../../services/services.db';
import enums from '../../../users/lib/enums';

export const updateAdminProfile = (payload) => DB.transact('updateAdminProfile', payload, enums.ADMIN_ADMIN_QUERY);
export const getAdminByEmail = (payload) => DB.transact('getAdminByEmail', payload, enums.ADMIN_ADMIN_QUERY);
export const createAdminUserPermissions = (payload) => DB.transact('createAdminUserPermissions', payload, enums.ADMIN_ADMIN_QUERY);
export const checkIfResourcePermissionCreated = (payload) => DB.transact('checkIfResourcePermissionCreated', payload, enums.ADMIN_ADMIN_QUERY);
export const editAdminUserPermissions = (payload) => DB.transact('editAdminUserPermissions', payload, enums.ADMIN_ADMIN_QUERY);
export const getAdminByAdminId = (payload) => DB.transact('getAdminByAdminId', payload, enums.ADMIN_ADMIN_QUERY);
export const inviteAdmin = (payload) => DB.transact('addAdmin', payload, enums.ADMIN_ADMIN_QUERY);
export const editAdminStatus = (payload) => DB.transact('editAdminStatus', payload, enums.ADMIN_ADMIN_QUERY);
