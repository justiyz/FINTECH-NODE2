const {
  SEEDFI_NODE_ENV,
  SEEDFI_TEST_PORT,
  SEEDFI_TEST_DATABASE_URL,
  SEEDFI_TEST_MESSAGE_FORWARDING,
  SEEDFI_TEST_ENCODING_AUTHENTICATION_SECRET,
  SEEDFI_TEST_BCRYPT_SALT_ROUND,
  SEEDFI_TEST_SENDGRID_API_KEY,
  SEEDFI_TEST_SENDGRID_FROM,
  SEEDFI_TEST_BACKEND_BASE_URL,
  SEEDFI_TEST_VERIFY_EMAIL_MOBILE_REDIRECT_URL,
  SEEDFI_TEST_ADMIN_WEB_BASE_URL,
  SEEDFI_TEST_PAYSTACK_APIS_BASE_URL,
  SEEDFI_TEST_PAYSTACK_SECRET_KEY,
  SEEDFI_TEST_DOJAH_APIS_BASE_URL,
  SEEDFI_TEST_DOJAH_APP_ID,
  SEEDFI_TEST_DOJAH_SECRET_KEY,
  SEEDFI_TEST_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL,
  SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_TYPE,
  SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
  SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
  SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
  SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
  SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
  SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
  SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL,
  SEEDFI_TEST_FIREBASE_DATABASE_URL,
  SEEDFI_TEST_UNDERWRITING_SERVICE_BASE_URL,
  SEEDFI_TEST_UNDERWRITING_SERVICE_API_KEY,
  SEEDFI_TEST_ADMIN_EMAIL_ADDRESS,
  SEEDFI_TEST_AMAZON_S3_ACCESS_KEY_ID,
  SEEDFI_TEST_AMAZON_S3_SECRET_ACCESS_KEY,
  SEEDFI_TEST_AMAZON_S3_BUCKET_REGION,
  SEEDFI_TEST_AMAZON_S3_BUCKET,
  SEEDFI_TEST_TERMII_SMS_URL,
  SEEDFI_TEST_TERMII_API_KEY,
  SEEDFI_TEST_TERMII_SENDER_ID,
  SEEDFI_TEST_YOU_VERIFY_BASE_URL,
  SEEDFI_TEST_YOU_VERIFY_API_KEY,
  SEEDFI_TEST_YOU_VERIFY_WEBHOOK_SIGNING_KEY,
  SEEDFI_TEST_MONO_BASE_URL,
  SEEDFI_TEST_MONO_APP_SECRET_KEY,
  SEEDFI_TEST_FIREBASE_WEB_API_KEY,
  SEEDFI_TEST_FIREBASE_DYNAMIC_LINK_DOMAIN_URI_PREFIX,
  SEEDFI_TEST_FIREBASE_DYNAMIC_LINK_ANDROID_PACKAGE_NAME,
  SEEDFI_TEST_FIREBASE_DYNAMIC_LINK_IOS_BUNDLE_ID,
  SEEDFI_TEST_DATADOG_API_KEY,
  SEEDFI_TEST_DATADOG_APPLICATION_NAME,
  SEEDFI_TEST_NEW_DEVICE_LOGIN_WAVER_USERS,
  SEEDFI_TEST_ALLOWABLE_ORIGINS,
  SEEDFI_TEST_ZEEH_URL,
  SEEDFI_TEST_ZEEH_APP_ID,
  SEEDFI_TEST_ZEEH_SECRET_KEY,
  SEEDFI_TEST_ZEEH_PUBLIC_KEY,
  SEEDFI_TEST_ZEEH_SANDBOX_KEY,
  SEEDFI_TEST_BANK_ACCOUNT_STATEMENT_PROCESSOR
} = process.env;

export default {
  SEEDFI_NODE_ENV,
  SEEDFI_PORT: SEEDFI_TEST_PORT,
  SEEDFI_DATABASE_URL: SEEDFI_TEST_DATABASE_URL,
  SEEDFI_MESSAGE_FORWARDING: SEEDFI_TEST_MESSAGE_FORWARDING,
  SEEDFI_ENCODING_AUTHENTICATION_SECRET: SEEDFI_TEST_ENCODING_AUTHENTICATION_SECRET,
  SEEDFI_BCRYPT_SALT_ROUND: SEEDFI_TEST_BCRYPT_SALT_ROUND,
  SEEDFI_SENDGRID_API_KEY: SEEDFI_TEST_SENDGRID_API_KEY,
  SEEDFI_SENDGRID_FROM: SEEDFI_TEST_SENDGRID_FROM,
  SEEDFI_BACKEND_BASE_URL: SEEDFI_TEST_BACKEND_BASE_URL,
  SEEDFI_VERIFY_EMAIL_MOBILE_REDIRECT_URL: SEEDFI_TEST_VERIFY_EMAIL_MOBILE_REDIRECT_URL,
  SEEDFI_ADMIN_WEB_BASE_URL: SEEDFI_TEST_ADMIN_WEB_BASE_URL,
  SEEDFI_PAYSTACK_APIS_BASE_URL: SEEDFI_TEST_PAYSTACK_APIS_BASE_URL,
  SEEDFI_PAYSTACK_SECRET_KEY: SEEDFI_TEST_PAYSTACK_SECRET_KEY,
  SEEDFI_DOJAH_APIS_BASE_URL: SEEDFI_TEST_DOJAH_APIS_BASE_URL,
  SEEDFI_DOJAH_APP_ID: SEEDFI_TEST_DOJAH_APP_ID,
  SEEDFI_DOJAH_SECRET_KEY: SEEDFI_TEST_DOJAH_SECRET_KEY,
  SEEDFI_ZEEH_URL: SEEDFI_TEST_ZEEH_URL,
  SEEDFI_ZEEH_APP_ID: SEEDFI_TEST_ZEEH_APP_ID,
  SEEDFI_ZEEH_SECRET_KEY: SEEDFI_TEST_ZEEH_SECRET_KEY,
  SEEDFI_ZEEH_PUBLIC_KEY: SEEDFI_TEST_ZEEH_PUBLIC_KEY,
  SEEDFI_ZEEH_SANDBOX_KEY: SEEDFI_TEST_ZEEH_SANDBOX_KEY,
  SEEDFI_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL: SEEDFI_TEST_PAYSTACK_CANCEL_PAYMENT_REDIRECT_URL,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_TYPE: SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_TYPE,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_PROJECT_ID: SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID: SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY: SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL: SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_ID: SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_AUTH_URI: SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_TOKEN_URI: SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL: SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
  SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL: SEEDFI_TEST_FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL,
  SEEDFI_FIREBASE_DATABASE_URL: SEEDFI_TEST_FIREBASE_DATABASE_URL,
  SEEDFI_UNDERWRITING_SERVICE_BASE_URL: SEEDFI_TEST_UNDERWRITING_SERVICE_BASE_URL,
  SEEDFI_UNDERWRITING_SERVICE_API_KEY: SEEDFI_TEST_UNDERWRITING_SERVICE_API_KEY,
  SEEDFI_ADMIN_EMAIL_ADDRESS: SEEDFI_TEST_ADMIN_EMAIL_ADDRESS,
  SEEDFI_AMAZON_S3_ACCESS_KEY_ID: SEEDFI_TEST_AMAZON_S3_ACCESS_KEY_ID,
  SEEDFI_AMAZON_S3_SECRET_ACCESS_KEY: SEEDFI_TEST_AMAZON_S3_SECRET_ACCESS_KEY,
  SEEDFI_AMAZON_S3_BUCKET_REGION: SEEDFI_TEST_AMAZON_S3_BUCKET_REGION,
  SEEDFI_AMAZON_S3_BUCKET: SEEDFI_TEST_AMAZON_S3_BUCKET,
  SEEDFI_TERMII_SMS_URL: SEEDFI_TEST_TERMII_SMS_URL,
  SEEDFI_TERMII_API_KEY: SEEDFI_TEST_TERMII_API_KEY,
  SEEDFI_TERMII_SENDER_ID: SEEDFI_TEST_TERMII_SENDER_ID,
  SEEDFI_YOU_VERIFY_BASE_URL: SEEDFI_TEST_YOU_VERIFY_BASE_URL,
  SEEDFI_YOU_VERIFY_API_KEY: SEEDFI_TEST_YOU_VERIFY_API_KEY,
  SEEDFI_YOU_VERIFY_WEBHOOK_SIGNING_KEY: SEEDFI_TEST_YOU_VERIFY_WEBHOOK_SIGNING_KEY,
  SEEDFI_MONO_BASE_URL: SEEDFI_TEST_MONO_BASE_URL,
  SEEDFI_MONO_APP_SECRET_KEY: SEEDFI_TEST_MONO_APP_SECRET_KEY,
  SEEDFI_FIREBASE_WEB_API_KEY: SEEDFI_TEST_FIREBASE_WEB_API_KEY,
  SEEDFI_FIREBASE_DYNAMIC_LINK_DOMAIN_URI_PREFIX: SEEDFI_TEST_FIREBASE_DYNAMIC_LINK_DOMAIN_URI_PREFIX,
  SEEDFI_FIREBASE_DYNAMIC_LINK_ANDROID_PACKAGE_NAME: SEEDFI_TEST_FIREBASE_DYNAMIC_LINK_ANDROID_PACKAGE_NAME,
  SEEDFI_FIREBASE_DYNAMIC_LINK_IOS_BUNDLE_ID: SEEDFI_TEST_FIREBASE_DYNAMIC_LINK_IOS_BUNDLE_ID,
  SEEDFI_DATADOG_API_KEY: SEEDFI_TEST_DATADOG_API_KEY,
  SEEDFI_DATADOG_APPLICATION_NAME: SEEDFI_TEST_DATADOG_APPLICATION_NAME,
  SEEDFI_NEW_DEVICE_LOGIN_WAVER_USERS: SEEDFI_TEST_NEW_DEVICE_LOGIN_WAVER_USERS,
  SEEDFI_ALLOWABLE_ORIGINS: SEEDFI_TEST_ALLOWABLE_ORIGINS,
  SEEDFI_BANK_ACCOUNT_STATEMENT_PROCESSOR: SEEDFI_TEST_BANK_ACCOUNT_STATEMENT_PROCESSOR
};
