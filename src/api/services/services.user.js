import DB from '../../services/services.db';
import enums from '../../lib/enums';

export const getUser = (payload) => DB.transact('getUser', payload, enums.USER_QUERY);
export const getUserByUserId = (payload) => DB.transact('getUserByUserId', payload, enums.USER_QUERY);
export const getUserByEmail = (payload) => DB.transact('getUserByEmail', payload, enums.USER_QUERY);
