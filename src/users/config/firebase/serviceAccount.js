import 'dotenv/config';
import config from '../index';

export const serviceAccountCredentials = {
  type: config.SEEDFI_FIREBASE_SERVICE_ACCOUNT_TYPE,
  project_id: config.SEEDFI_FIREBASE_SERVICE_ACCOUNT_PROJECT_ID,
  private_key_id: config.SEEDFI_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  private_key: config.SEEDFI_FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(
    /\\n/g,
    '\n'
  ),
  client_email: config.SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_EMAIL,
  client_id: config.SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_ID,
  auth_uri: config.SEEDFI_FIREBASE_SERVICE_ACCOUNT_AUTH_URI,
  token_uri: config.SEEDFI_FIREBASE_SERVICE_ACCOUNT_TOKEN_URI,
  auth_provider_x509_cert_url: config.SEEDFI_FIREBASE_SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: config.SEEDFI_FIREBASE_SERVICE_ACCOUNT_CLIENT_CERT_URL
};
