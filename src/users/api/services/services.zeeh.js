import enums from '../../lib/enums';
import config from '../../config';
import axios from 'axios';
import * as userMockedTestResponses from '../../../../tests/response/response.user';
import {
  dojahVerifyInternationPassportResponse,
  zeehVerifyInternationalPassportResponse
} from "../../../../tests/response/response.user";

const { SEEDFI_NODE_ENV } = config;

const zeehSDK = require('api')('@zeeh/v1.0#fs4sj9tl74p65ce');
zeehSDK.auth(config.SEEDFI_ZEEH_PUBLIC_KEY);


const zeehDriversLicenseVerificationCheck = async(license_number, user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      return userMockedTestResponses.zeehVerifyBvnTestResponse(user, license_number);
    }
    const result = await zeehSDK.getDriverInformation({
      licenseNo: license_number,
      publicKey: config.SEEDFI_ZEEH_PUBLIC_KEY,
      'zeeh-private-key': config.SEEDFI_ZEEH_SECRET_KEY
    });
    return result.data;
  } catch (error) {
    logger.error(`${enums.CURRENT_TIME_STAMP} Error querying Drivers License for this reason ====>>> ${error}`);
    return error;
  }

};
const zeehBVNVerificationCheck = async(bvn, user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      return userMockedTestResponses.zeehVerifyBvnTestResponse(user, bvn);
    }
    const response = await zeehSDK.getBvnInformation({
      bvn: bvn,
      publicKey: config.SEEDFI_ZEEH_PUBLIC_KEY,
      'zeeh-private-key': config.SEEDFI_ZEEH_SECRET_KEY
    });
    response.data['entity'] = response.data;
    return response.data.entity;
  } catch (error) {
    if (error.message === 'Not Found') {
      logger.error(`${enums.CURRENT_TIME_STAMP} Error querying BVN for this reason ====>>> ${error}`);
    } else {
      logger.error(`${enums.CURRENT_TIME_STAMP} Error querying BVN for this reason ====>>> ${error}`);
    }
    logger.error(`${enums.CURRENT_TIME_STAMP} Error querying BVN for this reason ====>>> ${error}`);
    return error;
  }
};

const zeehPassportNumberVerificationCheck = async (user, document_id) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      return userMockedTestResponses.zeehVerifyInternationalPassportResponse(user, document_id);
    }

    const options = {
      method: 'POST',
      url: `https://api.zeeh.africa/api/v1/passport/live/lookup/${config.SEEDFI_ZEEH_PUBLIC_KEY}`,
      headers: {
        accept: 'application/json',
        'zeeh-private-key': config.SEEDFI_ZEEH_SECRET_KEY,
        'content-type': 'application/json',
        publicKey: config.SEEDFI_ZEEH_PUBLIC_KEY
      },
      data: {
        passportNumber: document_id,
        firstName: user.first_name,
        lastName: user.last_name,
        dob: user.date_of_birth
      }
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`${enums.CURRENT_TIME_STAMP} Error querying Internation Passport Number for this reason ====>>> ${error}`);
    return error;
  }
};

const zeehNINVerificationCheck = async (nin, user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      return userMockedTestResponses.zeehVerifyBvnTestResponse(user, nin);
    }
    const options = {
      method: 'GET',
      url: `${config.SEEDFI_ZEEH_URL}/api/v1/nin/live/lookup/${config.SEEDFI_ZEEH_PUBLIC_KEY}?nin=${nin}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        'zeeh-private-key': config.SEEDFI_ZEEH_SECRET_KEY,
        publicKey: config.SEEDFI_ZEEH_PUBLIC_KEY
      }
    };
    const { data } = await axios(options);
    return data;

  } catch (error) {
    logger.error(`${enums.CURRENT_TIME_STAMP} Error querying NIN for this reason ====>>> ${error.message}`);
    return error;
  }
};

const zeehVINVerificationCheck = async (vin, user, state) => {

  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      // return userMockedTestResponses.zeehVerifyVINTestResponse(user, vin);
    }
    const options = {
      method: 'GET',
      url: `${ config.SEEDFI_ZEEH_URL }/vin/live/lookup/${ config.SEEDFI_ZEEH_PUBLIC_KEY }?vin=${ vin }&state=${ state }&last_name=${ last_name }`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'zeeh-private-key': config.SEEDFI_ZEEH_SECRET_KEY,
        publicKey: config.SEEDFI_ZEEH_PUBLIC_KEY
      }
    };
    const { data } = await axios(options);
    return data;

  } catch (error) {
    logger.error(`${enums.CURRENT_TIME_STAMP} Error querying Voters Identity Number (VIN) for this reason ====>>> ${error}`);
    return error;
  }
};


export {
  zeehBVNVerificationCheck,
  zeehNINVerificationCheck,
  zeehDriversLicenseVerificationCheck,
  zeehVINVerificationCheck,
  zeehPassportNumberVerificationCheck
};
