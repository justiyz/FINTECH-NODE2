import DB from '../../services/services.db';
import enums from '../../../users/lib/enums';

export const getAdminByEmail = (payload) => DB.transact('getAdminByEmail', payload, enums.ADMIN_AUTH_QUERY);
