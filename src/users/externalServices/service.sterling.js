import axios from 'axios';
import config from '../config';
import enums from '../lib/enums';
import * as userMockedTestResponses from '../../../tests/response/response.user';

const { SEEDFI_NODE_ENV } = config;

const sterlingBvnVerificationCheck = async(bvn, user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.sterlingVerifyBvnTestResponse(user);
    }
    const options = {
      method: 'post',
      url: `${config.SEEDFI_STERLING_APIS_BASE_URL}/api/User/v2/VerifyBVN`,
      data: {
        bvn,
        dateOfBirth: user.date_of_birth
      }
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to sterling API for bvn validation failed::${enums.STERLING_BVN_VERIFICATION_SERVICE}`, error.message);
    return error;
  }
};

export { sterlingBvnVerificationCheck };
