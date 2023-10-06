import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';
import * as Hash from '../../lib/utils/lib.util.hash';

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

const resolveAccount = async(account_number, bank_code, user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.paystackResolveAccountNumberTestResponse(account_number, user);
    }
    const options = {
      method: 'get',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}:::PAYSTACK OBJECT DATA: ${options.toString()}`);
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
    const amountRequestedType = SEEDFI_NODE_ENV === 'development' ? 10000 : parseFloat(paystackAmountFormatting);
    // this is because paystack will not process transaction greater than 1 Million

    const options = {
      method: 'post',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/transaction/initialize`,
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        email: user.email,
        amount: calculateAmountPlusPaystackTransactionCharge(amountRequestedType),
        currency: 'NGN',
        reference,
        channels: [ 'card' ],
        metadata: {
          'cancel_action': config.SEEDFI_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL // This value is a paystack value "https://standard.paystack.co/close"
        }
      }
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}:::PAYSTACK OBJECT DATA: ${options.toString()}`);
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to paystack API to initialize card payment failed::${enums.PAYSTACK_INITIATE_CARD_PAYMENT_SERVICE}`, error.message);
    return error;
  }
};

const initializeBankTransferPayment = async(user, paystackAmountFormatting, reference) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.paystackInitializeCardPaymentTestResponse(reference);
    }
    const amountRequestedType = SEEDFI_NODE_ENV === 'development' ? 10000 : parseFloat(paystackAmountFormatting);
    // this is because paystack will not process transaction greater than 1 Million
    const amountToBeCharged = await calculateAmountPlusPaystackTransactionCharge(amountRequestedType);
    const options = {
      method: 'post',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/transaction/initialize`,
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        email: user.email,
        amount: amountToBeCharged,
        currency: 'NGN',
        reference,
        channels: [ 'bank_transfer' ],
        metadata: {
          'cancel_action': config.SEEDFI_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL // This value is a paystack value "https://standard.paystack.co/close"
        }
      }
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}:::PAYSTACK OBJECT DATA: ${options.toString()}`);
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to paystack API to initialize bank transfer payment failed::${enums.PAYSTACK_INITIATE_BANK_TRANSFER_PAYMENT_SERVICE}`, error.message);
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
    logger.info(`${enums.CURRENT_TIME_STAMP}:::PAYSTACK OBJECT DATA: ${options.toString()}`);
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
    logger.info(`${enums.CURRENT_TIME_STAMP}:::PAYSTACK OBJECT DATA: ${options.toString()}`);
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`calling paystack refund API failed::${enums.RAISE_A_REFUND_TICKED_FOR_CARD_TOKENIZATION_TRANSACTION_SERVICE}`, error.message);
    return error;
  }
};

const fetchSeedfiPaystackBalance = async() => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.paystackPlatformBalanceCheckerTestResponse();
    }
    const options = {
      method: 'get',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/balance`,
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`checking seedfi paystack balance failed::${enums.FETCH_SEEDFI_PAYSTACK_BALANCE_SERVICE}`, error.message);
    return error;
  }
};

const createTransferRecipient = async(userDisbursementAccountDetails) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.paystackUserRecipientCodeCreationTestResponse(userDisbursementAccountDetails);
    }
    const options = {
      method: 'post',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/transferrecipient`,
      data: {
        type: 'nuban',
        name: userDisbursementAccountDetails.account_name,
        account_number: userDisbursementAccountDetails.account_number,
        bank_code: userDisbursementAccountDetails.bank_code,
        currency: 'NGN'
      },
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    logger.info(`${enums.CURRENT_TIME_STAMP}:::PAYSTACK OBJECT DATA (createTransferRecipient): ${options.toString()}`);
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`calling paystack create transfer recipient failed::${enums.CREATE_TRANSFER_RECEIPT_SERVICE}`, error.message);
    return error;
  }
};

const initiateTransfer = async(userTransferRecipient, existingLoanApplication, reference) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.initiatePaystackBankTransferTestResponse(userTransferRecipient, existingLoanApplication, reference);
    }
    const amountRequestedType = SEEDFI_NODE_ENV === 'development' ? 100 : parseFloat(existingLoanApplication.amount_requested);
    // this is because paystack will not process transaction greater than 1 Million
    const options = {
      method: 'post',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/transfer`,
      data: {
        source: 'balance',
        amount: amountRequestedType * 100, // Paystack requires amount to be in kobo for naira payment
        reference,
        recipient: userTransferRecipient,
        reason: 'Loan facility disbursement'
      },
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    logger.info(`PAYSTACK DATA(Initiate Transfer): ${options.toString()}`);
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`calling paystack initiate transfer failed::${enums.INITIATE_TRANSFER_SERVICE}`, error.message);
    return error;
  }
};

const initializeBankAccountChargeForLoanRepayment = async(user, paystackAmountFormatting, reference, bankAccountDetails) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.initiateChargeViaBankAccountPaystackTestResponse(reference);
    }
    const bankCodeType = SEEDFI_NODE_ENV === 'development' ? '057' : bankAccountDetails.bank_code;
    const bankAccountNumberChoice = SEEDFI_NODE_ENV === 'development' ? '0000000000' : bankAccountDetails.account_number;
    const userBirthdayChoice = SEEDFI_NODE_ENV === 'development' ? '1995-12-23' : user.date_of_birth;
    const amountRequestedType = SEEDFI_NODE_ENV === 'development' ? 10000 : parseFloat(paystackAmountFormatting);
    const amountToBeCharged = await calculateAmountPlusPaystackTransactionCharge(amountRequestedType);
    // this is because paystack will not process transaction greater than 1 Million
    const options = {
      method: 'post',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/charge`,
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        email: user.email,
        amount: amountToBeCharged,
        reference,
        bank: {
          code: bankCodeType,
          account_number: bankAccountNumberChoice
        },
        birthday: userBirthdayChoice
      }
    };
    logger.info(`PAYSTACK DATA: ${options}`);
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to paystack API to initialize loan repayment charge via bank account
    failed::${enums.PAYSTACK_INITIATE_BANK_ACCOUNT_CHARGE_FOR_LOAN_REPAYMENT_SERVICE}`, error.message);
    return error;
  }
};

const initializeDebitCarAuthChargeForLoanRepayment = async(user, paystackAmountFormatting, reference, debitCardDetails) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.initiateChargeViaCardAuthTokenPaystackTestResponse(reference);
    }
    const amountRequestedType = SEEDFI_NODE_ENV === 'development' ? 10000 : parseFloat(paystackAmountFormatting);
    logger.info(`AmountRequestType ${amountRequestedType}:::Info: Logs the amount to be passed to paystack`);
    // this is because paystack will not process transaction greater than 1 Million in test environment
    const amountToBeCharged = await calculateAmountPlusPaystackTransactionCharge(amountRequestedType);
    const options = {
      method: 'post',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/transaction/charge_authorization`,
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        email: user.email,
        amount: amountToBeCharged,
        reference,
        authorization_code: await Hash.decrypt(decodeURIComponent(debitCardDetails.auth_token))
      }
    };
    logger.info(`PAYSTACK DATA: ${options.toString()}`);
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to paystack API to initialize loan repayment charge via tokenized card
    failed::${enums.PAYSTACK_INITIATE_BANK_ACCOUNT_CHARGE_FOR_LOAN_REPAYMENT_SERVICE}`, error.message);
    return error;
  }
};

const submitPaymentOtpWithReference = async(body, reference) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.paystackSubmitOtpTestResponse(reference);
    }
    const options = {
      method: 'post',
      url: `${config.SEEDFI_PAYSTACK_APIS_BASE_URL}/charge/submit_otp`,
      headers: {
        Authorization: `Bearer ${config.SEEDFI_PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        otp: body.otp.trim(),
        reference
      }
    };
    logger.info(`PAYSTACK DATA: ${options.toString()}`);
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to paystack API to submit user payment otp failed::${enums.SUBMIT_PAYMENT_OTP_WITH_REFERENCE_SERVICE}`, error.message);
    return error;
  }
};

// eslint-disable-next-line valid-jsdoc
/**
 * Repayment Calculation
 * Loan Repayment Amount (LRA) -> passed as a parameter
 * Applicable Fee: (LRA * 1.5%) + 100
 * @returns {Promise<*>}
 * If Applicable Fee is > 2000
 * Final Amount: LRA + 2000
 * Else Final Amount: ((LRA +100)/(1-1.5%)) +0.01
 */
const calculateAmountPlusPaystackTransactionCharge = async(loan_repayment_amount) => {
  try {
    let amount = parseFloat(loan_repayment_amount.toString());
    const maximum_applicable_fee = 2000;
    let amount_plus_charges = 0;
    let applicable_fee = 0;

    if (amount < 2500)
      applicable_fee = amount * 0.015;
    else
      applicable_fee = (amount * 0.015) + 100;

    if (applicable_fee < maximum_applicable_fee)
      amount_plus_charges = ((amount + 100) / (1 - 0.015)) + 0.01;
    else
      amount_plus_charges = amount + maximum_applicable_fee;

    return getNumericValue(amount_plus_charges);
  } catch (error) {
    logger.error(`Error calculating the transaction fee for the process::${enums.SUBMIT_PAYMENT_OTP_WITH_REFERENCE_SERVICE}`, error.message);
    return error;
  }
};

function getNumericValue(input) {
  logger.info(`AmountRequestType ${input}:::Info: Logs the amount to be passed to paystack plus charges`);
  logger.info(`Datatype of AmountRequestType ${typeof input}:::Info: Logs the amount to be passed to paystack plus charges`);
  if (typeof input === 'string' || typeof input === 'object') {
    logger.info(`The type of input to be processed: ${typeof input}. The value of input to be processed: ${input}`);
    return Number(input);
  } else if (typeof input === 'number') {
    logger.info(`The type of input to be processed: ${typeof input}. The value of input to be processed: ${input}`);
    return input;
  } else {
    logger.info(`The type of input to be processed: ${typeof input}. The value of input to be processed: ${input}`);
    return NaN; // Return NaN for unsupported types
  }
}

export {
  fetchBanks,
  resolveAccount,
  initializeCardPayment,
  initializeBankTransferPayment,
  confirmPaystackPaymentStatusByReference,
  raiseARefundTickedForCardTokenizationTransaction,
  fetchSeedfiPaystackBalance,
  createTransferRecipient,
  initiateTransfer,
  initializeBankAccountChargeForLoanRepayment,
  initializeDebitCarAuthChargeForLoanRepayment,
  submitPaymentOtpWithReference,
  calculateAmountPlusPaystackTransactionCharge
};
