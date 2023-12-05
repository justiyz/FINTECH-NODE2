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

const dojahPassportNumberVerificationCheck = async (passport_number, user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      return userMockedTestResponses.dojahVerifyInternationPassportResponse(user, passport_number);
    }
    const options = {
      method: 'GET',
      url: `${config.SEEDFI_DOJAH_APIS_BASE_URL}/api/v1/kyc/passport?passport_number=${passport_number}&surname=${user.last_name}`,
      headers: {
        accept: 'application/json',
        Authorization: config.SEEDFI_DOJAH_SECRET_KEY,
        AppId: config.SEEDFI_DOJAH_APP_ID
      }
    };

    const {data} = await axios(options);
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
      url: `https://api.dojah.io/api/v1/kyc/vin?vin=${vin}`,
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

const dojahNINVerification = async (nin, user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      return userMockedTestResponses.zeehVerifyNinTestResponse(user, nin);
    }
    const options = {
      method: 'GET',
      url: `https://api.dojah.io/api/v1/kyc/nin?nin=${ nin }`,
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
    logger.error(`Connecting to Dojah for NIN validation failed::${ enums.DOJAH_NIN_VERIFICATION_SERVICE }`, error.message);
    return error;
  }
}

export {dojahBvnVerificationCheck, dojahVINVerification as dojahVINVerification, dojahNINVerification, dojahPassportNumberVerificationCheck};
