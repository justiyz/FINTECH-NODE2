import dayjs from 'dayjs';
import axios from 'axios';
import config from '../../../users/config';
import enums from '../../../users/lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';

const { SEEDFI_NODE_ENV } = config;

const userOrrScoreBreakdown = async(user_id, loan_id) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.seedfiUnderwritingUserAndLoanApplicationOrrBreakdownTestResponse(user_id, loan_id);
    }
    const options = {
      method: 'get',
      url: `${config.SEEDFI_UNDERWRITING_SERVICE_BASE_URL}/v1/loan_processing_engine/?user_id=${user_id}`,
      headers: {
        Authorization: `Api-Key ${config.SEEDFI_UNDERWRITING_SERVICE_API_KEY}`
      }
    };
    const data = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to seedfi underwriting service for user ORR score failed::${enums.USER_ORR_SCORE_BREAKDOWN_SERVICE}`, error.message);
    return error;
  }
};

const loanOrrScoreBreakdown = async(user_id, loan_id) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.seedfiUnderwritingUserAndLoanApplicationOrrBreakdownTestResponse(user_id, loan_id);
    }
    const options = {
      method: 'get',
      url: `${config.SEEDFI_UNDERWRITING_SERVICE_BASE_URL}/v1/loan_processing_engine/?loan_application_id=${loan_id}`,
      headers: {
        Authorization: `Api-Key ${config.SEEDFI_UNDERWRITING_SERVICE_API_KEY}`
      }
    };
    const data = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to seedfi underwriting service for loan application ORR score failed::${enums.LOAN_ORR_SCORE_BREAKDOWN_SERVICE}`, error.message);
    return error;
  }
};

const loanScoreCardBreakdown = async() => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.seedfiUnderwritingLoanScoreCardBreakdown();
    }
    const options = {
      method: 'get',
      url: `${config.SEEDFI_UNDERWRITING_SERVICE_BASE_URL}/v1/category_weights/`,
      headers: {
        Authorization: `Api-Key ${config.SEEDFI_UNDERWRITING_SERVICE_API_KEY}`
      }
    };
    const data = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to seedfi underwriting service for loan score card category weight failed::${enums.LOAN_SCORE_CARD_BREAKDOWN_WEIGHT_SERVICE}`, error.message);
    return error;
  }
};

const loanCategoryOrrAverageMetrics = async(queryFromType, queryToType) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.seedfiUnderwritingLoanScoreCardBreakdown();
    }
    if (queryFromType === null || queryToType === null) {
      const options = {
        method: 'get',
        url: `${config.SEEDFI_UNDERWRITING_SERVICE_BASE_URL}/v1/category_weights/metrics`,
        headers: {
          Authorization: `Api-Key ${config.SEEDFI_UNDERWRITING_SERVICE_API_KEY}`
        }
      };
      const data = await axios(options);
      return data;
    }
    const startDate = dayjs(queryFromType).format('YYYY-MM-DD');
    const endDate = dayjs(queryToType).format('YYYY-MM-DD');
    const options = {
      method: 'get',
      url: `${config.SEEDFI_UNDERWRITING_SERVICE_BASE_URL}/v1/category_weights/metrics?start_date=${startDate}&end_date=${endDate}`,
      headers: {
        Authorization: `Api-Key ${config.SEEDFI_UNDERWRITING_SERVICE_API_KEY}`
      }
    };
    const data = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to seedfi underwriting service for loan category orr average failed::${enums.LOAN_CATEGORY_ORR_AVERAGE_METRICS_SERVICE}`, error.message);
    return error;
  }
};

export { userOrrScoreBreakdown, loanOrrScoreBreakdown, loanScoreCardBreakdown, loanCategoryOrrAverageMetrics };
