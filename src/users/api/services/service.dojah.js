import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';
import {DOJAH_VIN_VERIFICATION_SERVICE} from "../../lib/enums/lib.enum.labels";

const {SEEDFI_NODE_ENV} = config;

const dojahBvnVerificationCheck = async (bvn, user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      // Dojah sandbox returns a fixed value, this is done for flexibility sake while testing and developing
      return userMockedTestResponses.dojahVerifyBvnTestResponse(user, bvn);
    }
    const options = {
      method: 'get',
      url: `${ config.SEEDFI_DOJAH_APIS_BASE_URL }/api/v1/kyc/bvn/full?bvn=${ bvn }`,
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
    logger.error(`Connecting to Dojah API for bvn validation failed::${ enums.DOJAH_BVN_VERIFICATION_SERVICE }`, error.message);
    return error;
  }
};

const dojahVINVerification = async (vin, user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      // Dojah sandbox returns a fixed value, this is done for flexibility sake while testing and developing
      return userMockedTestResponses.dojahVerifyVINTestResponse(user, vin);
    }

    const options = {
      method: 'GET',
      url: 'https://api.dojah.io/api/v1/kyc/vin',
      headers: {
        accept: 'application/json',
        AppId: config.SEEDFI_DOJAH_APP_ID,
        Authorization: config.SEEDFI_DOJAH_SECRET_KEY,
        'Accept-Encoding': 'gzip,deflate,compress'
      }
    };
    const data = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to Dojah for VIN validation failed::${ enums.DOJAH_VIN_VERIFICATION_SERVICE }`, error.message);
    return error;
  }
};

export {dojahBvnVerificationCheck, dojahVINVerification as dojahVINVerification};
