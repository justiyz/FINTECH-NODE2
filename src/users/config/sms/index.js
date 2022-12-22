import AfricasTalking from 'africastalking';
import enums from '../../lib/enums';
import config from '..';

async function sendSMS(sendTo, messageBody) {
  try {
    if (config.SEEDFI_MESSAGE_FORWARDING === 'false') {
      return;
    }
    const africastalking = AfricasTalking({
      apiKey: config.SEEDFI_AFRICASTALKING_SMS_API_KEY,
      username: config.SEEDFI_AFRICASTALKING_SMS_USERNAME
    });
    await africastalking.SMS.send({
      to: sendTo,
      message: messageBody,
      from: config.SEEDFI_AFRICASTALKING_SMS_SENDER_ID
    });
    logger.error(`${enums.CURRENT_TIME_STAMP} SMS sent to ${sendTo}`);
  } catch (err) {
    logger.error(`${enums.CURRENT_TIME_STAMP} Error sending SMS ${err.message}`);
  }
}

export default sendSMS;
