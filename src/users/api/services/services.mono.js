import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';
import * as userMockedTestResponses from '../../../../tests/response/response.user';

const { SEEDFI_NODE_ENV } = config;

const generateMonoAccountId = async body => {
  try {
    if (SEEDFI_NODE_ENV === 'test') {
      return userMockedTestResponses.seedfiMonoAccountIdGenerationTestResponse();
    }
    const options = {
      method: 'post',
      url: `${config.SEEDFI_MONO_BASE_URL}/account/auth`,
      headers: {
        'mono-sec-key': config.SEEDFI_MONO_APP_SECRET_KEY,
      },
      data: {
        code: body.mono_account_code.trim(),
      },
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(
      `Connecting to mono service to generate account id using token code
    failed::${enums.GENERATE_MONO_ACCOUNT_ID_SERVICE}`,
      error.message
    );
    return error;
  }
};

const initiateMonoAccountLinking = async body => {
  try {
    console.log('se', config.SEEDFI_MONO_APP_SECRET_KEY);
    const options = {
      method: 'post',
      url: `${config.SEEDFI_MONO_BASE_URL}/v2/accounts/initiate`,
      headers: {
        'mono-sec-key': config.SEEDFI_MONO_APP_SECRET_KEY,
      },
      data: {
        customer: {
          name: body.name.trim(),
          email: body.email.trim(),
        },
        meta: { ref: `${body.ref}`.trim() },
        scope: 'auth',
        redirect_url: config.SEEDFI_MONO_REDIRECT_URL || 'https://theseedfi.com/mono/callback',
      },
    };
    const { data } = await axios(options);
    return data;
  } catch (error) {
    logger.error(
      `Connecting to mono service to inititate account linking
    failed::${enums.INITIATE_MONO_ACCOUNT_LINKING}`,
      error.message
    );
    return error;
  }
};

export { generateMonoAccountId, initiateMonoAccountLinking };
