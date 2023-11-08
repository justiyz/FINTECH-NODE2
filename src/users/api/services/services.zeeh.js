import enums from '../../lib/enums';
import config from '../../config';
import * as userMockedTestResponses from '../../../../tests/response/response.user';

const { SEEDFI_NODE_ENV } = config;

const zeehSDK = require('api')('@zeeh/v1.0#fs4sj9tl74p65ce');
const zeehPublicKey = 'pk_G34V5k1M2ENkfLTbXJIuXEMgU';
const zeehPrivateKey = 'pv_El9fbd9ZyAcXhAIWZPxCj5XbF';
zeehSDK.auth(zeehPublicKey);


const zeehDriversLicenseVerificationCheck = async(license_number, user) => {
  try {
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
      return userMockedTestResponses.zeehVerifyNinTestResponse(user, nin);
    }
    const result = await zeehSDK.getNINLookup({
      nin: nin,
      publicKey: zeehPublicKey,
      'zeeh-private-key': zeehPrivateKey
    });

    return result.data;
  } catch (error) {
    logger.error(`${enums.CURRENT_TIME_STAMP} Error querying BVN for this reason ====>>> ${error}`);
    return error;
  }

};

export {
  zeehBVNVerificationCheck,
  zeehNINVerificationCheck,
  zeehDriversLicenseVerificationCheck
};
