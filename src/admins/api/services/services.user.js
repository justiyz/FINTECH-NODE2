import DB from '../../externalServices/services.db';
import enums from '../../../users/lib/enums';

export const editUserStatus = (payload) => DB.transact('editUserStatus', payload, enums.ADMIN_USER_QUERY);
export const getUserByUserId = (payload) => DB.transact('getUserByUserId', payload, enums.ADMIN_USER_QUERY);
export const fetchUserReferrals = (payload) => DB.transact('fetchUserReferrals', payload, enums.ADMIN_USER_QUERY);
export const fetchUserAccountDetails = async(payload) => DB.multipleTransaction([
  await DB.transact('fetchUserDebitCards', payload, enums.ADMIN_USER_QUERY),
  await DB.transact('fetchUserBankAccounts', payload, enums.ADMIN_USER_QUERY)
]);

export const fetchUsers = async(payload) => DB.multipleTransaction([
  await DB.transact('fetchUsers', payload, enums.ADMIN_USER_QUERY),
  await DB.transact('fetchUsersCount', payload, enums.ADMIN_USER_QUERY)
]);
