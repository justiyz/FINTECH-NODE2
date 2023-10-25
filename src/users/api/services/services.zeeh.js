import enums from '../../lib/enums';
import config from '../../config';
import axios from 'axios';
import * as userMockedTestResponses from '../../../../tests/response/response.user';

const { SEEDFI_NODE_ENV } = config;

const zeehSDK = require('api')('@zeeh/v1.0#fs4sj9tl74p65ce');
const zeehPublicKey = 'pk_G34V5k1M2ENkfLTbXJIuXEMgU';
const zeehPrivateKey = 'pv_El9fbd9ZyAcXhAIWZPxCj5XbF';
const zeehApiURL = 'https://api.zeeh.africa/api/v1';
zeehSDK.auth(zeehPublicKey);


const zeehDriversLicenseVerificationCheck = async(license_number, user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      return userMockedTestResponses.zeehVerifyBvnTestResponse(user, license_number);
    }
    const result = await zeehSDK.getDriverInformation({
      licenseNo: license_number,
      publicKey: zeehPublicKey,
      'zeeh-private-key': zeehPrivateKey
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
      publicKey: zeehPublicKey,
      'zeeh-private-key': zeehPrivateKey
    });
    response.data['entity'] = response.data;
    return response.data.entity;
  } catch (error) {
    if (error.message === 'Not Found') {
    //   throw new FundmeException('BVN: ' + error.message, 404)
      logger.error(`${enums.CURRENT_TIME_STAMP} Error querying BVN for this reason ====>>> ${error}`);
    } else {
    //   throw new FundmeException('BVN: ' + error.message, 400)
      logger.error(`${enums.CURRENT_TIME_STAMP} Error querying BVN for this reason ====>>> ${error}`);
    }
    logger.error(`${enums.CURRENT_TIME_STAMP} Error querying BVN for this reason ====>>> ${error}`);
    return error;
  }
};

const zeehNINVerificationCheck = async(nin, user) =>{
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      return userMockedTestResponses.zeehVerifyBvnTestResponse(user, nin);
    }

    const options = {
      method: 'GET',
      url: `${zeehApiURL}/nin/live/lookup/${zeehPublicKey}?nin=${nin}`,
      headers: {
        accept: 'application/json',
        'zeeh-private-key': zeehPrivateKey,
        publicKey: zeehPublicKey
      }
    };

    const { data } = await axios(options);
    return data;

  } catch (error) {
    logger.error(`${enums.CURRENT_TIME_STAMP} Error querying BVN for this reason ====>>> ${error}`);
    return error;
  }
};

const zeehVINVerificationCheck = async(vin, user, state, lastname) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      return userMockedTestResponses.zeehVerifyVINTestResponse(user, vin);
    }

    const options = {
      method: 'GET',
      url: `${zeehApiURL}/vin/live/lookup/${zeehPublicKey}?vin=${vin}&state=${state}&last_name=${lastname}`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'zeeh-private-key': zeehPrivateKey,
        publicKey: zeehPublicKey
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
  zeehVINVerificationCheck
};
