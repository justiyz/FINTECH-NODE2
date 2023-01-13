import DB from '../../services/services.db';
import enums from '../../../users/lib/enums';

export const getAdminByEmail = (payload) => DB.transact('getAdminByEmail', payload, enums.ADMIN_ADMIN_QUERY);
export const getAdminByAdminId = (payload) => DB.transact('getAdminByAdminId', payload, enums.ADMIN_ADMIN_QUERY);
export const inviteAdmin = (payload) => DB.transact('addAdmin', payload, enums.ADMIN_ADMIN_QUERY);
