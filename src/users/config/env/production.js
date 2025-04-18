const {
  SEEDFI_NODE_ENV,
  SEEDFI_PROD_PORT,
  SEEDFI_PROD_DATABASE_URL,
  SEEDFI_PROD_MESSAGE_FORWARDING,
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
  SEEDFI_PROD_AMAZON_S3_BUCKET,
  SEEDFI_PROD_TERMII_SMS_URL,
  SEEDFI_PROD_TERMII_API_KEY,
  SEEDFI_PROD_TERMII_SENDER_ID,
  SEEDFI_PROD_YOU_VERIFY_BASE_URL,
  SEEDFI_PROD_YOU_VERIFY_API_KEY,
  SEEDFI_PROD_YOU_VERIFY_WEBHOOK_SIGNING_KEY,
  SEEDFI_PROD_MONO_BASE_URL,
  SEEDFI_PROD_MONO_APP_SECRET_KEY,
  SEEDFI_PROD_FIREBASE_WEB_API_KEY,
  SEEDFI_PROD_FIREBASE_DYNAMIC_LINK_DOMAIN_URI_PREFIX,
  SEEDFI_PROD_FIREBASE_DYNAMIC_LINK_ANDROID_PACKAGE_NAME,
  SEEDFI_PROD_FIREBASE_DYNAMIC_LINK_IOS_BUNDLE_ID,
  SEEDFI_PROD_DATADOG_API_KEY,
  SEEDFI_PROD_DATADOG_APPLICATION_NAME,
  SEEDFI_PROD_NEW_DEVICE_LOGIN_WAVER_USERS,
  SEEDFI_PROD_ALLOWABLE_ORIGINS,
  SEEDFI_PROD_ZEEH_URL,
  SEEDFI_PROD_ZEEH_APP_ID,
  SEEDFI_PROD_ZEEH_SECRET_KEY,
  SEEDFI_PROD_ZEEH_PUBLIC_KEY,
  SEEDFI_PROD_ZEEH_SANDBOX_KEY,
  SEEDFI_PROD_BANK_ACCOUNT_STATEMENT_PROCESSOR,
  SEEDFI_PROD_CLOUDINARY_UPLOAD_URI,
  SEEDFI_PROD_CLOUDINARY_CLOUD_NAME,
  SEEDFI_PROD_CLOUDINARY_API_KEY,
  SEEDFI_PROD_CLOUDINARY_API_SECRET,
  SEEDFI_PROD_SHOP_PERCENTAGE,
  SEEDFI_PROD_UNDERWRITING_APP_ACCESS_TOKEN,
  SEEDFI_PROD_RECOVA_BEARER_TOKEN,
  SEEDFI_PROD_LOAN_DISBURSEMENT_ACCOUNT_NUMBER,
  SEEDFI_PROD_LOAN_DISBURSEMENT_ACCOUNT_NAME,
  SEEDFI_PROD_LOAN_DISBURSEMENT_BANK_CODE,
  SEEDFI_PROD_LOAN_DISBURSEMENT_BANK_NAME,
  SEEDFI_PROD_RECOVA_BASE_URL,
  SEEDFI_PROD_RECOVA_INSTITUTION_CODE,
  SEEDFI_PROD_MERCHANT_ADMIN_WEB_BASE_URL,
  SEEDFI_PROD_API_VERSION,
  SEEDFI_PROD_DOJAH_SIGNATURE,
  SEEDFI_PROD_MONO_REDIRECT_URL,
} = process.env;

export default {
  SEEDFI_NODE_ENV,
  SEEDFI_PORT: SEEDFI_PROD_PORT,
  SEEDFI_DATABASE_URL: SEEDFI_PROD_DATABASE_URL,
  SEEDFI_MESSAGE_FORWARDING: SEEDFI_PROD_MESSAGE_FORWARDING,
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
  SEEDFI_ZEEH_URL: SEEDFI_PROD_ZEEH_URL,
  SEEDFI_ZEEH_APP_ID: SEEDFI_PROD_ZEEH_APP_ID,
  SEEDFI_ZEEH_SECRET_KEY: SEEDFI_PROD_ZEEH_SECRET_KEY,
  SEEDFI_ZEEH_PUBLIC_KEY: SEEDFI_PROD_ZEEH_PUBLIC_KEY,
  SEEDFI_ZEEH_SANDBOX_KEY: SEEDFI_PROD_ZEEH_SANDBOX_KEY,
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
  SEEDFI_AMAZON_S3_BUCKET: SEEDFI_PROD_AMAZON_S3_BUCKET,
  SEEDFI_TERMII_SMS_URL: SEEDFI_PROD_TERMII_SMS_URL,
  SEEDFI_TERMII_API_KEY: SEEDFI_PROD_TERMII_API_KEY,
  SEEDFI_TERMII_SENDER_ID: SEEDFI_PROD_TERMII_SENDER_ID,
  SEEDFI_YOU_VERIFY_BASE_URL: SEEDFI_PROD_YOU_VERIFY_BASE_URL,
  SEEDFI_YOU_VERIFY_API_KEY: SEEDFI_PROD_YOU_VERIFY_API_KEY,
  SEEDFI_YOU_VERIFY_WEBHOOK_SIGNING_KEY: SEEDFI_PROD_YOU_VERIFY_WEBHOOK_SIGNING_KEY,
  SEEDFI_MONO_BASE_URL: SEEDFI_PROD_MONO_BASE_URL,
  SEEDFI_MONO_APP_SECRET_KEY: SEEDFI_PROD_MONO_APP_SECRET_KEY,
  SEEDFI_FIREBASE_WEB_API_KEY: SEEDFI_PROD_FIREBASE_WEB_API_KEY,
  SEEDFI_FIREBASE_DYNAMIC_LINK_DOMAIN_URI_PREFIX: SEEDFI_PROD_FIREBASE_DYNAMIC_LINK_DOMAIN_URI_PREFIX,
  SEEDFI_FIREBASE_DYNAMIC_LINK_ANDROID_PACKAGE_NAME: SEEDFI_PROD_FIREBASE_DYNAMIC_LINK_ANDROID_PACKAGE_NAME,
  SEEDFI_FIREBASE_DYNAMIC_LINK_IOS_BUNDLE_ID: SEEDFI_PROD_FIREBASE_DYNAMIC_LINK_IOS_BUNDLE_ID,
  SEEDFI_DATADOG_API_KEY: SEEDFI_PROD_DATADOG_API_KEY,
  SEEDFI_DATADOG_APPLICATION_NAME: SEEDFI_PROD_DATADOG_APPLICATION_NAME,
  SEEDFI_NEW_DEVICE_LOGIN_WAVER_USERS: SEEDFI_PROD_NEW_DEVICE_LOGIN_WAVER_USERS,
  SEEDFI_ALLOWABLE_ORIGINS: SEEDFI_PROD_ALLOWABLE_ORIGINS,
  SEEDFI_BANK_ACCOUNT_STATEMENT_PROCESSOR: SEEDFI_PROD_BANK_ACCOUNT_STATEMENT_PROCESSOR,
  SEEDFI_CLOUDINARY_UPLOAD_URI: SEEDFI_PROD_CLOUDINARY_UPLOAD_URI,
  SEEDFI_CLOUDINARY_CLOUD_NAME: SEEDFI_PROD_CLOUDINARY_CLOUD_NAME,
  SEEDFI_CLOUDINARY_API_KEY: SEEDFI_PROD_CLOUDINARY_API_KEY,
  SEEDFI_CLOUDINARY_API_SECRET: SEEDFI_PROD_CLOUDINARY_API_SECRET,
  SEEDFI_SHOP_PERCENTAGE: SEEDFI_PROD_SHOP_PERCENTAGE,
  SEEDFI_UNDERWRITING_APP_ACCESS_TOKEN: SEEDFI_PROD_UNDERWRITING_APP_ACCESS_TOKEN,
  SEEDFI_RECOVA_BEARER_TOKEN: SEEDFI_PROD_RECOVA_BEARER_TOKEN,
  SEEDFI_LOAN_DISBURSEMENT_ACCOUNT_NUMBER: SEEDFI_PROD_LOAN_DISBURSEMENT_ACCOUNT_NUMBER,
  SEEDFI_LOAN_DISBURSEMENT_ACCOUNT_NAME: SEEDFI_PROD_LOAN_DISBURSEMENT_ACCOUNT_NAME,
  SEEDFI_LOAN_DISBURSEMENT_BANK_CODE: SEEDFI_PROD_LOAN_DISBURSEMENT_BANK_CODE,
  SEEDFI_LOAN_DISBURSEMENT_BANK_NAME: SEEDFI_PROD_LOAN_DISBURSEMENT_BANK_NAME,
  SEEDFI_RECOVA_BASE_URL: SEEDFI_PROD_RECOVA_BASE_URL,
  SEEDFI_RECOVA_INSTITUTION_CODE: SEEDFI_PROD_RECOVA_INSTITUTION_CODE,
  SEEDFI_MERCHANT_ADMIN_WEB_BASE_URL: SEEDFI_PROD_MERCHANT_ADMIN_WEB_BASE_URL,
  SEEDFI_API_VERSION: SEEDFI_PROD_API_VERSION,
  SEEDFI_DOJAH_SIGNATURE: SEEDFI_PROD_DOJAH_SIGNATURE,
  SEEDFI_MONO_REDIRECT_URL: SEEDFI_PROD_MONO_REDIRECT_URL,
};
