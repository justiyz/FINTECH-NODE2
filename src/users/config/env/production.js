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
  SEEDFI_PROD_ADMIN_WEB_BASE_URL,
  SEEDFI_PROD_PAYSTACK_APIS_BASE_URL,
  SEEDFI_PROD_PAYSTACK_SECRET_KEY,
  SEEDFI_PROD_DOJAH_APIS_BASE_URL,
  SEEDFI_PROD_DOJAH_APP_ID,
  SEEDFI_PROD_DOJAH_SECRET_KEY,
  SEEDFI_PROD_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL,
  SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_TYPE,
  SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
  SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
  SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
  SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
  SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
  SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
  SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL,
  SEEDFI_PROD_FIREBASE_DATABASE_URL,
  SEEDFI_PROD_UNDERWRITING_SERVICE_BASE_URL,
  SEEDFI_PROD_UNDERWRITING_SERVICE_API_KEY,
  SEEDFI_PROD_ADMIN_EMAIL_ADDRESS,
  SEEDFI_PROD_AMAZON_S3_ACCESS_KEY_ID,
  SEEDFI_PROD_AMAZON_S3_SECRET_ACCESS_KEY,
  SEEDFI_PROD_AMAZON_S3_BUCKET_REGION,
  SEEDFI_PROD_AMAZON_S3_BUCKET
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
  SEEDFI_ADMIN_WEB_BASE_URL: SEEDFI_PROD_ADMIN_WEB_BASE_URL,
  SEEDFI_PAYSTACK_APIS_BASE_URL: SEEDFI_PROD_PAYSTACK_APIS_BASE_URL,
  SEEDFI_PAYSTACK_SECRET_KEY: SEEDFI_PROD_PAYSTACK_SECRET_KEY,
  SEEDFI_DOJAH_APIS_BASE_URL: SEEDFI_PROD_DOJAH_APIS_BASE_URL,
  SEEDFI_DOJAH_APP_ID: SEEDFI_PROD_DOJAH_APP_ID,
  SEEDFI_DOJAH_SECRET_KEY: SEEDFI_PROD_DOJAH_SECRET_KEY,
  SEEDFI_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL: SEEDFI_PROD_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_TYPE: SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_TYPE,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_PROJECT_ID: SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID: SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY: SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL: SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_ID: SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_AUTH_URI: SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_TOKEN_URI: SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL: SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL: SEEDFI_PROD_FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL,
  SEEDFI_FIREBASE_DATABASE_URL: SEEDFI_PROD_FIREBASE_DATABASE_URL,
  SEEDFI_UNDERWRITING_SERVICE_BASE_URL: SEEDFI_PROD_UNDERWRITING_SERVICE_BASE_URL,
  SEEDFI_UNDERWRITING_SERVICE_API_KEY: SEEDFI_PROD_UNDERWRITING_SERVICE_API_KEY,
  SEEDFI_ADMIN_EMAIL_ADDRESS: SEEDFI_PROD_ADMIN_EMAIL_ADDRESS,
  SEEDFI_AMAZON_S3_ACCESS_KEY_ID: SEEDFI_PROD_AMAZON_S3_ACCESS_KEY_ID,
  SEEDFI_AMAZON_S3_SECRET_ACCESS_KEY: SEEDFI_PROD_AMAZON_S3_SECRET_ACCESS_KEY,
  SEEDFI_AMAZON_S3_BUCKET_REGION: SEEDFI_PROD_AMAZON_S3_BUCKET_REGION,
  SEEDFI_AMAZON_S3_BUCKET: SEEDFI_PROD_AMAZON_S3_BUCKET
};
