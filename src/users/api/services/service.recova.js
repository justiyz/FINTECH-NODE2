import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';
import {DOJAH_VIN_VERIFICATION_SERVICE} from "../../lib/enums/lib.enum.labels";

const {SEEDFI_NODE_ENV} = config;

const dojahSDK = require('api')('@zeeh/v1.0#fs4sj9tl74p65ce');
const dojahSecretKey = '';
const dojahAppId = '';
const dojahApiURL = '';
// dojahSDK.auth(dojahSecretKey);

const createConsentRequest = async (bvn, user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      // Dojah sandbox returns a fixed value, this is done for flexibility sake while testing and developing
      return userMockedTestResponses.dojahVerifyBvnTestResponse(user, bvn);
    }
    const options = {
      method: 'get',
      url: `https://staging.recova.ng/recova_ofi_handshake/api/ConsentRequest/CreateConsentRequest`,
      headers: {
        AppId: config.SEEDFI_DOJAH_APP_ID,
        Authorization: config.SEEDFI_DOJAH_SECRET_KEY,
        accept: 'application/json',
        'Accept-Encoding': 'gzip,deflate,compress'
      }
    };
    const data = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Recova::${ enums.DOJAH_BVN_VERIFICATION_SERVICE }`, error.message);
    return error;
  }
};

export {createConsentRequest};
