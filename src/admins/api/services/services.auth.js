import DB from '../../services/services.db';
import enums from '../../../users/lib/enums';


export const fetchAdminPassword = (payload) => DB.transact('fetchAdminPassword', payload, enums.ADMIN_AUTH_QUERY);
export const fetchAdminByVerificationToken = (payload) => DB.transact('fetchAdminByVerificationToken', payload, enums.ADMIN_AUTH_QUERY);
export const updateLoginToken = (payload) => DB.transact('updateLoginToken', payload, enums.ADMIN_AUTH_QUERY);
export const fetchPermissions = async(role_type, admin_id) => DB.multipleTransaction([
  await DB.transact('fetchRolePermissions', role_type, enums.ADMIN_AUTH_QUERY),
  await DB.transact('fetchAdminPermissions', admin_id, enums.ADMIN_AUTH_QUERY)
]);
