import sgMail from '../../config/email';
import config from '../../config/index';
import { commonTemplate } from '../../lib/templates/email/template.common';

const MailService = async(subject, messageType, data) => {
  const msg = {
    to: data.email,
    cc: '',
    from: config.SEEDFI_SENDGRID_FROM,
    subject,
    html: commonTemplate(messageType, data)
  };
  try {
    if (config.SEEDFI_MESSAGE_FORWARDING === 'true') {
      await sgMail.send(msg);
      logger.info(`Message sent to ${data.email}`);
    }
    return;
  } catch (error) {
    logger.error(`Error sending mail :: ${error}`);
  }
};

export default MailService;
