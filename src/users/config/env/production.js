const {
  SEEDFI_NODE_ENV,
  SEEDFI_PROD_PORT,
  SEEDFI_PROD_DATABASE_URL,
  SEEDFI_PROD_MESSAGE_FORWARDING,
  SEEDFI_PROD_AFRICASTALKING_SMS_API_KEY,
  SEEDFI_PROD_AFRICASTALKING_SMS_USERNAME,
  SEEDFI_PROD_AFRICASTALKING_SMS_SENDER_ID,
  SEEDFI_PROD_STERLING_APIS_BASE_URL,
  SEEDFI_PROD_ENCODING_AUTHENTICATION_SECRET,
  SEEDFI_PROD_BCRYPT_SALT_ROUND,
  SEEDFI_PROD_SENDGRID_API_KEY,
  SEEDFI_PROD_SENDGRID_FROM,
  SEEDFI_PROD_BACKEND_BASE_URL,
  SEEDFI_PROD_VERIFY_EMAIL_MOBILE_REDIRECT_URL,
  SEEDFI_DEV_VERIFY_EMAIL_WEB_REDIRECT_URL
} = process.env;

export default {
  SEEDFI_NODE_ENV,
  SEEDFI_PORT: SEEDFI_PROD_PORT,
  SEEDFI_DATABASE_URL: SEEDFI_PROD_DATABASE_URL,
  SEEDFI_MESSAGE_FORWARDING: SEEDFI_PROD_MESSAGE_FORWARDING,
  SEEDFI_AFRICASTALKING_SMS_API_KEY: SEEDFI_PROD_AFRICASTALKING_SMS_API_KEY,
  SEEDFI_AFRICASTALKING_SMS_USERNAME: SEEDFI_PROD_AFRICASTALKING_SMS_USERNAME,
  SEEDFI_AFRICASTALKING_SMS_SENDER_ID: SEEDFI_PROD_AFRICASTALKING_SMS_SENDER_ID,
  SEEDFI_STERLING_APIS_BASE_URL: SEEDFI_PROD_STERLING_APIS_BASE_URL,
  SEEDFI_ENCODING_AUTHENTICATION_SECRET: SEEDFI_PROD_ENCODING_AUTHENTICATION_SECRET,
  SEEDFI_BCRYPT_SALT_ROUND: SEEDFI_PROD_BCRYPT_SALT_ROUND,
  SEEDFI_SENDGRID_API_KEY: SEEDFI_PROD_SENDGRID_API_KEY,
  SEEDFI_SENDGRID_FROM: SEEDFI_PROD_SENDGRID_FROM,
  SEEDFI_BACKEND_BASE_URL: SEEDFI_PROD_BACKEND_BASE_URL,
  SEEDFI_VERIFY_EMAIL_MOBILE_REDIRECT_URL: SEEDFI_PROD_VERIFY_EMAIL_MOBILE_REDIRECT_URL,
  SEEDFI_VERIFY_EMAIL_WEB_REDIRECT_URL: SEEDFI_DEV_VERIFY_EMAIL_WEB_REDIRECT_URL
};
