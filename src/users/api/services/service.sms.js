import axios from 'axios';
import config from '../../config';
import enums from '../../lib/enums';

const { SEEDFI_NODE_ENV, SEEDFI_TERMII_API_KEY, SEEDFI_TERMII_SMS_URL, SEEDFI_TERMII_SENDER_ID } = config;

const sendSms = async(sendTo, messageBody) => {
  try {
    if (SEEDFI_NODE_ENV === 'test' || SEEDFI_NODE_ENV === 'development') {
      return;
    }
    const recipient = sendTo.substring(1);
    const options = {
      method: 'post',
      url: SEEDFI_TERMII_SMS_URL,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        to: recipient,
        from: SEEDFI_TERMII_SENDER_ID,
        sms: messageBody,
        type: 'plain',
        channel: 'dnd',
        api_key: SEEDFI_TERMII_API_KEY
      }
    };
    await axios(options);
    logger.info(`${enums.CURRENT_TIME_STAMP} SMS sent to ${sendTo}`);
  } catch (error) {
    logger.error(`${enums.CURRENT_TIME_STAMP} Error sending SMS for this reason ====>>> ${error.response.data.message}`);
    return error;
  }
};

export { sendSms };

