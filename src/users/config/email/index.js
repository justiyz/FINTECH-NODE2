import 'dotenv/config';
import config from '../index';

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(config.SEEDFI_SENDGRID_API_KEY);

export default sgMail;
