import sgMail from '../../config/email';
import config from '../../config/index';
import { commonTemplate } from '../../lib/templates/email/template.common';

const MailService = async(subject, messageType, data) => {
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

// const  MailService2 = async(subject, messageType, data) => {
//   const msg = {
//     to: data.email,
//     cc: '',
//     from: {
//       name: 'SeedFi',
//       email: config.SEEDFI_SENDGRID_FROM
//     },
//     subject,
//     html: commonTemplate2(messageType, data)
//   };
//   try {
//     if (config.SEEDFI_MESSAGE_FORWARDING === 'true') {
//       await sgMail.send(msg);
//       logger.info(`Message sent to ${data.email}`);
//     }
//     return;
//   } catch (error) {
//     logger.error(`Error sending mail :: ${error}`);
//   }
// };

export default MailService;
// export default MailService2;
// export {
//   MailService,
//   MailService2
// }
