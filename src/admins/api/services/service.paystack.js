import axios from 'axios';
import config from '../../../users/config';
import enums from '../../../users/lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';
import * as Hash from '../../lib/utils/lib.util.hash';

const { SEEDFI_NODE_ENV } = config;


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
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to paystack API to initialize loan repayment charge via tokenized card
    failed::${enums.PAYSTACK_INITIATE_BANK_ACCOUNT_CHARGE_FOR_LOAN_REPAYMENT_SERVICE}`, error.message);
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
    const maximum_applicable_fee = 200000;
    let amount_plus_charges = 0;
    let applicable_fee = 0;

    if (amount < 250000)
      applicable_fee = amount * 0.015;
    else
      applicable_fee = (amount * 0.015) + 10000;

    if (applicable_fee < maximum_applicable_fee)
      amount_plus_charges = ((amount + 10000) / (1 - 0.015)) + 0.01;
    else
      amount_plus_charges = amount + maximum_applicable_fee;

    return Math.ceil(getNumericValue(amount_plus_charges));
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
  initializeBankAccountChargeForLoanRepayment,
  initializeDebitCarAuthChargeForLoanRepayment
};
