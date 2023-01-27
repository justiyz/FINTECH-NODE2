import { db } from '../../users/config/db';
import adminAuthQuery from '../api/queries/queries.auth';
import adminAdminQuery from '../api/queries/queries.admin';
import adminRoleQuery from '../api/queries/queries.role';
import adminLogQuery from '../api/queries/queries.log';
import adminUserQuery from '../api/queries/queries.user';

export const queries = {
  adminAuthQuery,
  adminAdminQuery,
  adminRoleQuery,
  adminLogQuery,
  adminUserQuery
};

export default {
  singleTransact: (query, data, type) => db.oneOrNone(queries[type][query], data),
  noReturnTransact: (query, data, type) => db.none(queries[type][query], data),
  transact: (query, data, type) => db.any(queries[type][query], data),
  multipleTransaction: transactions => {
    const result = db.tx(t => t.batch(transactions));
    return result;
  }
};
