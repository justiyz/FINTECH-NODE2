const {
  SEEDFI_NODE_ENV,
  SEEDFI_PROD_PORT,
  SEEDFI_PROD_DATABASE_URL,
  SEEDFI_PROD_MESSAGE_FORWARDING,
  SEEDFI_PROD_AFRICASTALKING_SMS_API_KEY,
  SEEDFI_PROD_AFRICASTALKING_SMS_USERNAME,
  SEEDFI_PROD_AFRICASTALKING_SMS_SENDER_ID,
  SEEDFI_PROD_ENCODING_AUTHENTICATION_SECRET,
  SEEDFI_PROD_BCRYPT_SALT_ROUND,
  SEEDFI_PROD_SENDGRID_API_KEY,
  SEEDFI_DEV_SENDGRID_FROM
} = process.env;

export default {
  SEEDFI_NODE_ENV,
  SEEDFI_PORT: SEEDFI_PROD_PORT,
  SEEDFI_DATABASE_URL: SEEDFI_PROD_DATABASE_URL,
  SEEDFI_MESSAGE_FORWARDING: SEEDFI_PROD_MESSAGE_FORWARDING,
  SEEDFI_AFRICASTALKING_SMS_API_KEY: SEEDFI_PROD_AFRICASTALKING_SMS_API_KEY,
  SEEDFI_AFRICASTALKING_SMS_USERNAME: SEEDFI_PROD_AFRICASTALKING_SMS_USERNAME,
  SEEDFI_AFRICASTALKING_SMS_SENDER_ID: SEEDFI_PROD_AFRICASTALKING_SMS_SENDER_ID,
  SEEDFI_ENCODING_AUTHENTICATION_SECRET: SEEDFI_PROD_ENCODING_AUTHENTICATION_SECRET,
  SEEDFI_BCRYPT_SALT_ROUND: SEEDFI_PROD_BCRYPT_SALT_ROUND,
  SEEDFI_SENDGRID_API_KEY: SEEDFI_PROD_SENDGRID_API_KEY,
  SEEDFI_SENDGRID_FROM: SEEDFI_DEV_SENDGRID_FROM
};
