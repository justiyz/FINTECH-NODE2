import { db } from '../../users/config/db';
import adminAuthQuery from '../api/queries/queries.auth';

export const queries = {
  adminAuthQuery
};

export default {
  transact: (query, data, type) => db.any(queries[type][query], data),
  singleTransact: (query, data, type) => db.oneOrNone(queries[type][query], data),
  noReturnTransact: (query, data, type) => db.none(queries[type][query], data)
};
