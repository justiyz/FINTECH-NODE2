const {
  SEEDFI_NODE_ENV,
  SEEDFI_DEV_PORT,
  SEEDFI_DEV_DATABASE_URL,
  SEEDFI_DEV_MESSAGE_FORWARDING,
  SEEDFI_DEV_ENCODING_AUTHENTICATION_SECRET,
  SEEDFI_DEV_BCRYPT_SALT_ROUND,
  SEEDFI_DEV_SENDGRID_API_KEY,
  SEEDFI_DEV_SENDGRID_FROM,
  SEEDFI_DEV_BACKEND_BASE_URL,
  SEEDFI_DEV_VERIFY_EMAIL_MOBILE_REDIRECT_URL,
  SEEDFI_DEV_ADMIN_WEB_BASE_URL,
  SEEDFI_DEV_PAYSTACK_APIS_BASE_URL,
  SEEDFI_DEV_PAYSTACK_SECRET_KEY,
  SEEDFI_DEV_DOJAH_APIS_BASE_URL,
  SEEDFI_DEV_DOJAH_APP_ID,
  SEEDFI_DEV_DOJAH_SECRET_KEY,
  SEEDFI_DEV_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL,
  SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_TYPE,
  SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
  SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
  SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
  SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
  SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
  SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
  SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL,
  SEEDFI_DEV_FIREBASE_DATABASE_URL,
  SEEDFI_DEV_UNDERWRITING_SERVICE_BASE_URL,
  SEEDFI_DEV_UNDERWRITING_SERVICE_API_KEY,
  SEEDFI_DEV_ADMIN_EMAIL_ADDRESS,
  SEEDFI_DEV_AMAZON_S3_ACCESS_KEY_ID,
  SEEDFI_DEV_AMAZON_S3_SECRET_ACCESS_KEY,
  SEEDFI_DEV_AMAZON_S3_BUCKET_REGION,
  SEEDFI_DEV_AMAZON_S3_BUCKET,
  SEEDFI_DEV_TERMII_SMS_URL,
  SEEDFI_DEV_TERMII_API_KEY,
  SEEDFI_DEV_TERMII_SENDER_ID,
  SEEDFI_DEV_YOU_VERIFY_BASE_URL,
  SEEDFI_DEV_YOU_VERIFY_API_KEY,
  SEEDFI_DEV_YOU_VERIFY_WEBHOOK_SIGNING_KEY,
  SEEDFI_DEV_MONO_BASE_URL,
  SEEDFI_DEV_MONO_APP_SECRET_KEY,
  SEEDFI_FIREBASE_DYNAMIC_LINK_PRIVATE_KEY,
  SEEDFI_DEV_DOMAIN_URL_PREFIX,
  SEEDFI_DEV_ANDROID_PACKAGE_NAME,
  SEEDFI_IOS_BUNDLE_ID
} = process.env;

export default {
  SEEDFI_NODE_ENV,
  SEEDFI_PORT: SEEDFI_DEV_PORT,
  SEEDFI_DATABASE_URL: SEEDFI_DEV_DATABASE_URL,
  SEEDFI_MESSAGE_FORWARDING: SEEDFI_DEV_MESSAGE_FORWARDING,
  SEEDFI_ENCODING_AUTHENTICATION_SECRET: SEEDFI_DEV_ENCODING_AUTHENTICATION_SECRET,
  SEEDFI_BCRYPT_SALT_ROUND: SEEDFI_DEV_BCRYPT_SALT_ROUND,
  SEEDFI_SENDGRID_API_KEY: SEEDFI_DEV_SENDGRID_API_KEY,
  SEEDFI_SENDGRID_FROM: SEEDFI_DEV_SENDGRID_FROM,
  SEEDFI_BACKEND_BASE_URL: SEEDFI_DEV_BACKEND_BASE_URL,
  SEEDFI_VERIFY_EMAIL_MOBILE_REDIRECT_URL: SEEDFI_DEV_VERIFY_EMAIL_MOBILE_REDIRECT_URL,
  SEEDFI_ADMIN_WEB_BASE_URL: SEEDFI_DEV_ADMIN_WEB_BASE_URL,
  SEEDFI_PAYSTACK_APIS_BASE_URL: SEEDFI_DEV_PAYSTACK_APIS_BASE_URL,
  SEEDFI_PAYSTACK_SECRET_KEY: SEEDFI_DEV_PAYSTACK_SECRET_KEY,
  SEEDFI_DOJAH_APIS_BASE_URL: SEEDFI_DEV_DOJAH_APIS_BASE_URL,
  SEEDFI_DOJAH_APP_ID: SEEDFI_DEV_DOJAH_APP_ID,
  SEEDFI_DOJAH_SECRET_KEY: SEEDFI_DEV_DOJAH_SECRET_KEY,
  SEEDFI_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL: SEEDFI_DEV_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_TYPE: SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_TYPE,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_PROJECT_ID: SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID: SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY: SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL: SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_ID: SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_AUTH_URI: SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_TOKEN_URI: SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL: SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL: SEEDFI_DEV_FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL,
  SEEDFI_FIREBASE_DATABASE_URL: SEEDFI_DEV_FIREBASE_DATABASE_URL,
  SEEDFI_UNDERWRITING_SERVICE_BASE_URL: SEEDFI_DEV_UNDERWRITING_SERVICE_BASE_URL,
  SEEDFI_UNDERWRITING_SERVICE_API_KEY: SEEDFI_DEV_UNDERWRITING_SERVICE_API_KEY,
  SEEDFI_ADMIN_EMAIL_ADDRESS: SEEDFI_DEV_ADMIN_EMAIL_ADDRESS,
  SEEDFI_AMAZON_S3_ACCESS_KEY_ID: SEEDFI_DEV_AMAZON_S3_ACCESS_KEY_ID,
  SEEDFI_AMAZON_S3_SECRET_ACCESS_KEY: SEEDFI_DEV_AMAZON_S3_SECRET_ACCESS_KEY,
  SEEDFI_AMAZON_S3_BUCKET_REGION: SEEDFI_DEV_AMAZON_S3_BUCKET_REGION,
  SEEDFI_AMAZON_S3_BUCKET: SEEDFI_DEV_AMAZON_S3_BUCKET,
  SEEDFI_TERMII_SMS_URL: SEEDFI_DEV_TERMII_SMS_URL,
  SEEDFI_TERMII_API_KEY: SEEDFI_DEV_TERMII_API_KEY,
  SEEDFI_TERMII_SENDER_ID: SEEDFI_DEV_TERMII_SENDER_ID,
  SEEDFI_YOU_VERIFY_BASE_URL: SEEDFI_DEV_YOU_VERIFY_BASE_URL,
  SEEDFI_YOU_VERIFY_API_KEY: SEEDFI_DEV_YOU_VERIFY_API_KEY,
  SEEDFI_YOU_VERIFY_WEBHOOK_SIGNING_KEY: SEEDFI_DEV_YOU_VERIFY_WEBHOOK_SIGNING_KEY,
  SEEDFI_MONO_BASE_URL: SEEDFI_DEV_MONO_BASE_URL,
  SEEDFI_MONO_APP_SECRET_KEY: SEEDFI_DEV_MONO_APP_SECRET_KEY,
  SEEDFI_FIREBASE_DYNAMIC_LINK_PRIVATE_KEY,
  SEEDFI_DOMAIN_URL_PREFIX: SEEDFI_DEV_DOMAIN_URL_PREFIX,
  SEEDFI_ANDROID_PACKAGE_NAME: SEEDFI_DEV_ANDROID_PACKAGE_NAME,
  SEEDFI_IOS_BUNDLE_ID
};
