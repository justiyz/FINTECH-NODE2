import DB from '../../services/services.db';
import enums from '../../lib/enums';

export const getUserByPhoneNumber = (payload) => DB.transact('getUserByPhoneNumber', payload, enums.USER_QUERY);
export const getUserByUserId = (payload) => DB.transact('getUserByUserId', payload, enums.USER_QUERY);
export const getUserByEmail = (payload) => DB.transact('getUserByEmail', payload, enums.USER_QUERY);
export const updateUserFcmToken = (payload) => DB.singleTransact('updateUserFcmToken', payload, enums.USER_QUERY);
export const updateUserRefreshToken = (payload) => DB.singleTransact('updateUserRefreshToken', payload, enums.USER_QUERY);
export const updateUserBvn = (payload) => DB.transact('updateUserBvn', payload, enums.USER_QUERY);
export const emailVerificationToken = (payload) => DB.transact('emailVerificationToken', payload, enums.USER_QUERY);
export const verifyEmail = (payload) => DB.transact('verifyEmail', payload, enums.USER_QUERY);
