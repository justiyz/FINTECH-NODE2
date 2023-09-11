import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';

const { SEEDFI_NODE_ENV } = config;

const createUserYouVerifyCandidate = async(user, userBvn) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.seedfiYouVerifyUserCandidateCreationTestResponse(user);
    }
    const options = {
      method: 'post',
      url: `${config.SEEDFI_YOU_VERIFY_BASE_URL}/v2/api/addresses/candidates/identity`,
      headers: {
        token: `${config.SEEDFI_YOU_VERIFY_API_KEY}`
      },
      data: { 
        type: 'bvn',
        idNumber: userBvn,
        subjectConsent: true
      }
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to you verify to create a user candidate 
    failed::${enums.CREATE_USER_YOU_VERIFY_CANDIDATE_SERVICE}`, error.message);
    return error;
  }
};

const createUserYouVerifyCandidateUsingProfile = async(user) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.seedfiYouVerifyUserCandidateCreationTestResponse(user);
    }
    const options = {
      method: 'post',
      url: `${config.SEEDFI_YOU_VERIFY_BASE_URL}/v2/api/addresses/candidates`,
      headers: {
        token: `${config.SEEDFI_YOU_VERIFY_API_KEY}`
      },
      data: { 
        firstName: user.first_name,
        lastName: user.last_name,
        mobile: '0' + user.phone_number.substring(4),
        dateOfBirth: user.date_of_birth,
        email: user.email,
        image: user.image_url
      }
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to you verify to create a user candidate 
    failed::${enums.CREATE_USER_YOU_VERIFY_CANDIDATE_SERVICE}`, error.message);
    return error;
  }
};

const initiateUserYouVerifyAddressVerification = async(user, body, candidateId, requestId) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.seedfiYouVerifyUserAddressVerificationRequestTestResponse(user, body, requestId, candidateId);
    }
    const options = {
      method: 'post',
      url: `${config.SEEDFI_YOU_VERIFY_BASE_URL}/v2/api/addresses/individual/request`,
      headers: {
        token: `${config.SEEDFI_YOU_VERIFY_API_KEY}`
      },
      data: { 
        candidateId: candidateId,
        description: 'Verify the candidate',
        address: {
          flatNumber: '',
          buildingName: '',
          buildingNumber: body.house_number,
          landmark: body.landmark,
          street: body.street,
          subStreet: '',
          state: body.state,
          city: body.city,
          lga: body.lga
        },
        subjectConsent: true,
        metadata: {
          requestId: requestId
        }     
      }
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to you verify to initiate address verification for user 
      failed::${enums.INITIATE_YOU_VERIFY_ADDRESS_VERIFICATION_SERVICE}`, error.message);
    return error;
  }
};

export { createUserYouVerifyCandidate, initiateUserYouVerifyAddressVerification, createUserYouVerifyCandidateUsingProfile };
