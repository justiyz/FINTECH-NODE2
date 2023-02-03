import admin from 'firebase-admin';
import { serviceAccountCredentials } from './serviceAccount';
import config from '../index';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountCredentials),
  databaseURL: config.SEEDFI_FIREBASE_DATABASE_URL
});

export { admin };
