import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';

const personalLoanApplicationEligibilityCheck = async(payload) => {
  try {
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
    logger.error(`Connecting to seedfi underwriting service for loan personal eligibility check failed::${enums.STERLING_BVN_VERIFICATION_SERVICE}`, error.message);
    return error;
  }
};

export { personalLoanApplicationEligibilityCheck };
