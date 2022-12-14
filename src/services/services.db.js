
import { db } from '../config/db';
import authQuery from '../api/queries/queries.auth';
import userQuery from '../api/queries/queries.user';
import logQueries from '../api/queries/queries.log';

export const queries = {
  authQuery,
  userQuery,
  logQueries
};

export default {
  transact: (query, data, type) => db.any(queries[type][query], data),
  singleTransact: (query, data, type) => db.oneOrNone(queries[type][query], data),
  noReturnTransact: (query, data, type) => db.none(queries[type][query], data)
};
