const {
  SEEDFI_NODE_ENV,
  SEEDFI_TEST_PORT,
  SEEDFI_TEST_DATABASE_URL,
  SEEDFI_TEST_MESSAGE_FORWARDING,
  SEEDFI_TEST_AFRICASTALKING_SMS_API_KEY,
  SEEDFI_TEST_AFRICASTALKING_SMS_USERNAME,
  SEEDFI_TEST_AFRICASTALKING_SMS_SENDER_ID,
  SEEDFI_TEST_STERLING_APIS_BASE_URL,
  SEEDFI_TEST_ENCODING_AUTHENTICATION_SECRET,
  SEEDFI_TEST_BCRYPT_SALT_ROUND,
  SEEDFI_TEST_SENDGRID_API_KEY,
  SEEDFI_TEST_SENDGRID_FROM,
  SEEDFI_TEST_BACKEND_BASE_URL,
  SEEDFI_TEST_VERIFY_EMAIL_MOBILE_REDIRECT_URL,
  SEEDFI_TEST_ADMIN_WEB_BASE_URL
} = process.env;

export default {
  SEEDFI_NODE_ENV,
  SEEDFI_PORT: SEEDFI_TEST_PORT,
  SEEDFI_DATABASE_URL: SEEDFI_TEST_DATABASE_URL,
  SEEDFI_MESSAGE_FORWARDING: SEEDFI_TEST_MESSAGE_FORWARDING,
  SEEDFI_AFRICASTALKING_SMS_API_KEY: SEEDFI_TEST_AFRICASTALKING_SMS_API_KEY,
  SEEDFI_AFRICASTALKING_SMS_USERNAME: SEEDFI_TEST_AFRICASTALKING_SMS_USERNAME,
  SEEDFI_AFRICASTALKING_SMS_SENDER_ID: SEEDFI_TEST_AFRICASTALKING_SMS_SENDER_ID,
  SEEDFI_STERLING_APIS_BASE_URL: SEEDFI_TEST_STERLING_APIS_BASE_URL,
  SEEDFI_ENCODING_AUTHENTICATION_SECRET: SEEDFI_TEST_ENCODING_AUTHENTICATION_SECRET,
  SEEDFI_BCRYPT_SALT_ROUND: SEEDFI_TEST_BCRYPT_SALT_ROUND,
  SEEDFI_SENDGRID_API_KEY: SEEDFI_TEST_SENDGRID_API_KEY,
  SEEDFI_SENDGRID_FROM: SEEDFI_TEST_SENDGRID_FROM,
  SEEDFI_BACKEND_BASE_URL: SEEDFI_TEST_BACKEND_BASE_URL,
  SEEDFI_VERIFY_EMAIL_MOBILE_REDIRECT_URL: SEEDFI_TEST_VERIFY_EMAIL_MOBILE_REDIRECT_URL,
  SEEDFI_ADMIN_WEB_BASE_URL: SEEDFI_TEST_ADMIN_WEB_BASE_URL
};
