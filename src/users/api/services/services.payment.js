import DB from '../../services/services.db';
import enums from '../../lib/enums';

export const initializeCardPayment = (payload) => DB.transact('initializeCardPayment', payload, enums.PAYMENT_QUERY);
export const fetchTransactionByReference = (payload) => DB.transact('fetchTransactionByReference', payload, enums.PAYMENT_QUERY);
export const checkIfCardPreviouslySaved = (payload) => DB.transact('checkIfCardPreviouslySaved', payload, enums.PAYMENT_QUERY);
export const fetchUserSavedCard = (payload) => DB.transact('fetchUserSavedCard', payload, enums.PAYMENT_QUERY);
export const updateUserCardAuthToken = (payload) => DB.transact('updateUserCardAuthToken', payload, enums.PAYMENT_QUERY);
export const updateTransactionPaymentStatus = (payload) => DB.transact('updateTransactionPaymentStatus', payload, enums.PAYMENT_QUERY);
export const saveCardDetails = (payload) => DB.transact('saveCardDetails', payload, enums.PAYMENT_QUERY);
export const updateTransactionIsInitiatedRefund = (payload) => DB.transact('updateTransactionIsInitiatedRefund', payload, enums.PAYMENT_QUERY);
export const updateTransactionRefundStatus = (payload) => DB.transact('updateTransactionRefundStatus', payload, enums.PAYMENT_QUERY);
