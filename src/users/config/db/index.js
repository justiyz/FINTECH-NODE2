import pgp from 'pg-promise';
import promise from 'bluebird';
import config from '../index';
import { admin } from '../firebase/index';

// Initialize postgres database
const pg = pgp({ promiseLib: promise, noWarnings: true });
const db = pg(config.SEEDFI_DATABASE_URL);

// Initialize google firestore database
const dbFireStore = admin.firestore();

export { db, dbFireStore };
