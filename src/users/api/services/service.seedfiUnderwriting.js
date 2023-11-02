import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';

const { SEEDFI_NODE_ENV } = config;

const loanApplicationEligibilityCheck = async(payload) => {
  try {
    // if (SEEDFI_NODE_ENV === 'development') {
    //   return userMockedTestResponses.seedfiUnderwritingApprovedLoanApplicationTestResponse(payload);
    // }
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
    logger.error(`Connecting to seedfi underwriting service for loan personal eligibility check
    failed::${enums.LOAN_APPLICATION_ELIGIBILITY_CHECK_SERVICE}`, error.message);
    return error;
  }
};

const loanApplicationRenegotiation = async(body, user, existingLoanApplication) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.seedfiUnderwritingLoanRenegotiationTestResponse(body, existingLoanApplication);
    }
    const options = {
      method: 'post',
      url: `${config.SEEDFI_UNDERWRITING_SERVICE_BASE_URL}/v1/renegotiations/`,
      headers: {
        Authorization: `Api-Key ${config.SEEDFI_UNDERWRITING_SERVICE_API_KEY}`
      },
      data: {
        user_id: user.user_id,
        loan_application_id: existingLoanApplication.member_loan_id ? `${existingLoanApplication.member_loan_id}` : `${existingLoanApplication.loan_id}`,
        new_loan_duration_in_month: `${body.new_loan_duration_in_month}`,
        new_loan_amount: parseFloat(body.new_loan_amount)
      }
    };
    const data = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to seedfi underwriting service for loan renegotiation
    failed::${enums.LOAN_APPLICATION_RENEGOTIATION_SERVICE}`, error.message);
    return error;
  }
};

export { loanApplicationEligibilityCheck, loanApplicationRenegotiation };
