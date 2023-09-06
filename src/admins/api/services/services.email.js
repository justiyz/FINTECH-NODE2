import sgMail from '../../../users/config/email';
import config from '../../../users/config/index';
import { commonTemplate } from '../../lib/templates/email/template.common';

const AdminMailService = async(subject, messageType, data) => {
  const msg = {
    to: data.email,
    cc: '',
    from: {
      name: 'SeedFi',
      email: config.SEEDFI_SENDGRID_FROM
    },
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

export default AdminMailService;
