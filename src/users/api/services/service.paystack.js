import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';

const { SEEDFI_NODE_ENV } = config;

const fetchBanks = async() => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.paystackFetchBankListsTestResponse();
    }
    const options = {
      method: 'get',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/bank?country=nigeria`,
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to paystack API for fetch list of banks failed::${enums.PAYSTACK_FETCH_BANKS_SERVICE}`, error.message);
    return error;
  }
};

const resolveAccount = async(account_number, bank_code) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.paystackResolveAccountNumberTestResponse();
    }
    const options = {
      method: 'get',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to paystack API to resolve bank account name enquiry failed::${enums.PAYSTACK_RESOLVE_BANK_ACCOUNT_NAME_SERVICE}`, error.message);
    return error;
  }
};

const initializeCardPayment = async(user, paystackAmountFormatting, reference) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.paystackInitializeCardPaymentTestResponse(reference);
    }
    const options = {
      method: 'post',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/transaction/initialize`,
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        email: user.email,
        amount: parseFloat(paystackAmountFormatting),
        currency: 'NGN',
        reference,
        channels: [ 'card' ],
        metadata: { 
          'cancel_action': config.SEEDFI_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL // This value is provided by the mobile app developer
        }
      }
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to paystack API to initialize card payment failed::${enums.PAYSTACK_INITIATE_CARD_PAYMENT_SERVICE}`, error.message);
    return error;
  }
};

const confirmPaystackPaymentStatusByReference = async(reference) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.paystackVerifyTransactionStatusTestResponse(reference);
    }
    const options = {
      method: 'get',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/transaction/verify/${reference}`,
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`verifying paystack transaction status failed::${enums.CONFIRM_PAYSTACK_PAYMENT_STATUS_BY_REFERENCE_SERVICE}`, error.message);
    return error;
  }
};

const raiseARefundTickedForCardTokenizationTransaction = async(transaction_id) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.paystackInitiateRefundTestResponse(transaction_id);
    }
    const options = {
      method: 'post',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/refund`,
      data: {
        transaction: transaction_id
      },
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`calling paystack refund API failed::${enums.CONFIRM_PAYSTACK_PAYMENT_STATUS_BY_REFERENCE_SERVICE}`, error.message);
    return error;
  }
};

export { 
  fetchBanks, 
  resolveAccount, 
  initializeCardPayment,
  confirmPaystackPaymentStatusByReference,
  raiseARefundTickedForCardTokenizationTransaction
};
