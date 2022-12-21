import DB from '../../services/services.db';
import enums from '../../lib/enums';

export const getUserByVerificationToken = (payload) => DB.transact('getUserByVerificationToken', payload, enums.AUTH_QUERY);
export const registerUser = (payload) => DB.transact('registerUser', payload, enums.AUTH_QUERY);
export const fetchUserPassword = (payload) => DB.transact('fetchUserPassword', payload, enums.AUTH_QUERY);
export const checkIfExistingReferralCode = (payload) => DB.transact('checkIfExistingReferralCode', payload, enums.AUTH_QUERY);
export const updateReferralTrail = (payload) => DB.transact('updateReferralTrail', payload, enums.AUTH_QUERY);
export const checkIfReferralPreviouslyRecorded = (payload) => DB.transact('checkIfReferralPreviouslyRecorded', payload, enums.AUTH_QUERY);
export const verifyUserAccount = (payload) => DB.transact('verifyUserAccount', payload, enums.AUTH_QUERY);
export const loginUserAccount = (payload) => DB.transact('loginUserAccount', payload, enums.AUTH_QUERY);
export const updateVerificationToken = (payload) => DB.transact('updateVerificationToken', payload, enums.AUTH_QUERY);
export const completeUserProfile = (payload) => DB.transact('completeUserProfile', payload, enums.AUTH_QUERY);
export const resetPassword = (payload) => DB.transact('resetPassword', payload, enums.AUTH_QUERY);
export const forgotPassword = (payload) => DB.transact('forgotPassword', payload, enums.AUTH_QUERY);
export const verifyUserEmail = (payload) => DB.transact('verifyUserEmail', payload, enums.AUTH_QUERY);
export const updateUserEmail = (payload) => DB.transact('updateUserEmail', payload, enums.AUTH_QUERY);
export const editEmail = (payload) => DB.transact('editEmail', payload, enums.AUTH_QUERY);
