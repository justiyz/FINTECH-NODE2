import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';


const {SEEDFI_NODE_ENV, SEEDFI_RECOVA_BASE_URL, SEEDFI_RECOVA_BEARER_TOKEN} = config;


const createConsentRequest = async (payload) => {
  try {
    const options = {
      method: 'post',
      url: `${SEEDFI_RECOVA_BASE_URL}/ConsentRequest/CreateConsentRequest`,
      headers: {
        Authorization: SEEDFI_RECOVA_BEARER_TOKEN,
        accept: 'application/json',
        // 'Accept-Encoding': 'gzip,deflate,compress'
      },
      data: payload
    };
    const { data } = await axios(options);
console.log('result', data)

    return data;
  } catch (error) {
    console.log(error);
    logger.error(`Recova::Error ${error.message} ${ enums.CREATE_CONSENT_REQUEST_SERVICE }`, error.message);
    throw error;
  }
};

const cancelMandate = async (payload) => {
  try {
    const options = {
      method: 'post',
      url: `${SEEDFI_RECOVA_BASE_URL}/Mandate/CancelMandateByLoanReference/${payload}?comment=null'`,
      headers: {
        Authorization: SEEDFI_RECOVA_BEARER_TOKEN,
        accept: 'application/json',
        // 'Accept-Encoding': 'gzip,deflate,compress'
      },
      data: null
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Recova::Error ${error.message} ${ enums.CREATE_CONSENT_REQUEST_SERVICE }`, error.message);
    throw error;
  }
};

export {
  createConsentRequest,
  cancelMandate
};
