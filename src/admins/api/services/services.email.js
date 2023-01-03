import sgMail from '../../../users/config/email';
import config from '../../../users/config/index';

const AdminMailService = async(subject, messageType, data) => {
  const msg = {
    to: data.email,
    cc: '',
    from: config.SEEDFI_SENDGRID_FROM,
    subject,
    html: ''
  };
  try {
    if (config.SEEDFI_MESSAGE_FORWARDING) {
      await sgMail.send(msg);
      logger.info(`Message sent to ${data.email}`);
    }
  } catch (error) {
    logger.error(`Error sending mail :: ${error}`);
  }
};

export default AdminMailService;
