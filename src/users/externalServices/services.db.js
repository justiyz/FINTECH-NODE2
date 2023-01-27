import { db } from '../config/db';
import authQuery from '../api/queries/queries.auth';
import userQuery from '../api/queries/queries.user';
import logQueries from '../api/queries/queries.log';
import paymentQuery from '../api/queries/queries.payment';

export const queries = {
  authQuery,
  userQuery,
  logQueries,
  paymentQuery
};

export default {
  transact: (query, data, type) => db.any(queries[type][query], data),
  singleTransact: (query, data, type) => db.oneOrNone(queries[type][query], data),
  noReturnTransact: (query, data, type) => db.none(queries[type][query], data),
  multipleTransaction: transactions => {
    const result = db.tx(t => t.batch(transactions));
    return result;
  }
};
