import DB from '../../services/services.db';
import enums from '../../lib/enums';

export const getUserByPhoneNumber = (payload) => DB.transact('getUserByPhoneNumber', payload, enums.USER_QUERY);
export const getUserByUserId = (payload) => DB.transact('getUserByUserId', payload, enums.USER_QUERY);
export const getUserByEmail = (payload) => DB.transact('getUserByEmail', payload, enums.USER_QUERY);
export const updateUserFcmToken = (payload) => DB.singleTransact('updateUserFcmToken', payload, enums.USER_QUERY);
export const updateUserRefreshToken = (payload) => DB.singleTransact('updateUserRefreshToken', payload, enums.USER_QUERY);
export const updateUserSelfieImage = (payload) => DB.transact('updateUserSelfieImage', payload, enums.USER_QUERY);
export const updateUserBvn = (payload) => DB.transact('updateUserBvn', payload, enums.USER_QUERY);
export const saveBankAccountDetails = (payload) => DB.transact('saveBankAccountDetails', payload, enums.USER_QUERY);
export const fetchBankAccountDetails = (payload) => DB.transact('fetchBankAccountDetails', payload, enums.USER_QUERY);
export const fetchUserDebitCards = (payload) => DB.transact('fetchUserDebitCards', payload, enums.USER_QUERY);
export const fetchBankAccountDetailsById = (payload) => DB.transact('fetchBankAccountDetailsById', payload, enums.USER_QUERY);
export const deleteBankAccountDetails = (payload) => DB.transact('deleteBankAccountDetails', payload, enums.USER_QUERY);
export const updateAccountDefaultChoice = async(user_id, id) => DB.multipleTransaction([
  await DB.transact('setExistingAccountDefaultFalse', user_id, enums.USER_QUERY),
  await DB.transact('SetNewAccountDefaultTrue', [ user_id, id ], enums.USER_QUERY)
]);
export const updateAccountDisbursementChoice = async(user_id, id) => DB.multipleTransaction([
  await DB.transact('setExistingAccountDisbursementFalse', user_id, enums.USER_QUERY),
  await DB.transact('SetNewAccountDisbursementTrue', [ user_id, id ], enums.USER_QUERY)
]);
export const emailVerificationToken = (payload) => DB.transact('emailVerificationToken', payload, enums.USER_QUERY);
export const checkIfAccountExisting = (payload) => DB.transact('checkIfAccountExisting', payload, enums.USER_QUERY);
export const verifyEmail = (payload) => DB.transact('verifyEmail', payload, enums.USER_QUERY);
export const fetchAllExistingBvns = (payload) => DB.transact('fetchAllExistingBvns', payload, enums.USER_QUERY);
export const updateIdVerification = (payload) => DB.transact('updateIdVerification', payload, enums.USER_QUERY);
export const userIdVerification = (payload) => DB.transact('userIdVerification', payload, enums.USER_QUERY);
export const updateUserProfile = (payload) => DB.singleTransact('updateUserProfile', payload, enums.USER_QUERY);
