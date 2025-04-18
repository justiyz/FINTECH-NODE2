import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';

const { SEEDFI_NODE_ENV, SEEDFI_RECOVA_BASE_URL, SEEDFI_RECOVA_BEARER_TOKEN } = config;

const createConsentRequest = async payload => {
  try {
    const options = {
      method: 'post',
      url: `${SEEDFI_RECOVA_BASE_URL}/ConsentRequest/CreateConsentRequest`,
      headers: {
        Authorization: SEEDFI_RECOVA_BEARER_TOKEN,
        accept: 'application/json',
        // 'Accept-Encoding': 'gzip,deflate,compress'
      },
      data: payload,
    };
    const { data } = await axios(options);

    return data;
  } catch (error) {
    logger.error(`Recova::Error ${error.message} ${enums.CREATE_CONSENT_REQUEST_SERVICE}`, error.message);
    logger.error(`Recova::Error ${error.response.data.message} ${enums.CREATE_CONSENT_REQUEST_SERVICE}`, error.message);
    throw error;
  }
};

const cancelMandate = async payload => {
  try {
    logger.info(`Recova:: Cancelling mandate for with loan reference ${payload}`);
    const options = {
      method: 'post',
      url: `${SEEDFI_RECOVA_BASE_URL}/Mandate/CancelMandateByLoanReference/${payload}?comment=null'`,
      headers: {
        Authorization: SEEDFI_RECOVA_BEARER_TOKEN,
        accept: 'application/json',
        // 'Accept-Encoding': 'gzip,deflate,compress'
      },
      data: null,
    };
    const { data } = await axios(options);
    logger.info(`Recova:: Cancelled mandate for with loan reference ${payload} successfully`);
    return data;
  } catch (error) {
    logger.error(`Recova::Error ${error.message} ${enums.CANCEL_MANDATE_SERVICE}`, error.message);
    logger.error(`Recova::Error ${error.response.data.message} ${enums.CANCEL_MANDATE_SERVICE}`, error.message);
    throw error;
  }
};

export { createConsentRequest, cancelMandate };
