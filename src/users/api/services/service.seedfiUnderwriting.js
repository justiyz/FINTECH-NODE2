import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';

const { SEEDFI_NODE_ENV } = config;

const personalLoanApplicationEligibilityCheck = async(payload) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.seedfiUnderwritingApprovedLoanApplicationTestResponse(payload);
    }
    const options = {
      method: 'post',
      url: `${config.SEEDFI_UNDERWRITING_SERVICE_BASE_URL}/v1/loan_processing_engine/`,
      headers: {
        Authorization: `Api-Key ${config.SEEDFI_UNDERWRITING_SERVICE_API_KEY}`
      },
      data: { ...payload }
    };
    const data = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to seedfi underwriting service for loan personal eligibility check failed::${enums.PERSONAL_LOAN_APPLICATION_ELIGIBILITY_CHECK_SERVICE}`, error.message);
    return error;
  }
};

export { personalLoanApplicationEligibilityCheck };
