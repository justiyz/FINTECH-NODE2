import dayjs from 'dayjs';
import axios from 'axios';
import config from '../../../users/config';
import enums from '../../../users/lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';

const { SEEDFI_NODE_ENV } = config;

/**
 * @param {{
 * first_name: String
 * last_name: String,
 * bvn: String,
 * date_of_birth: String,
 * phone_number: String,
 * gender: String
 * }} payload - The user details.
 * @returns {object} - Returns user credit score breakdown.
 * @memberof SeedfiCreditscoringService
 */
const userCreditScoreBreakdown = async (payload) => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.seedfiUnderwritingUserAndLoanApplicationOrrBreakdownTestResponse(user_id, loan_id);
    }
    const options = {
      method: 'post',
      url: `https://stg-creditscoring.theseedfi.com/creditscoring/api/demo/calculate-credit-score/`,
      data: {
        "first_name": "John",
        "last_name": "Doe",
        "bvn": "12345678901",
        "date_of_birth": "1990-01-15",
        "phone_number": "1234567890",
        "gender": "Male"
      },
    };
    const data = await axios(options);
    return data;
  } catch (error) {
    logger.error(`Connecting to seedfi creditscoring service for merchant user credit score failed::SeedfiCreditscoringService::userCreditScoreBreakdown`, error.message);
    return error;
  }
};

export { userCreditScoreBreakdown };
