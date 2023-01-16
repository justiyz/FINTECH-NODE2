import DB from '../services/services.db';
import enums from '../../users/lib/enums';
import * as Helpers from '../lib/utils/lib.util.helpers';

export const fetchAllAdmins = async(query, filter) => {
  const {
    page, per_page, search
  } = query;
  
  const { start_date, end_date, status } = filter;
  const pageType = !page ? 1 : page;
  const returnPerPage = !per_page ? 10 : per_page;
  const fetch = returnPerPage * pageType - returnPerPage;
  const condition = search ? `${search.toLowerCase()}%` : null;
  let result;
  const getAndSearchPayload = [ condition, fetch, per_page ];
  const getAndFilterPayload = [ status, start_date, end_date, fetch, per_page ];

  if ((start_date && end_date) || status)  {
    result = await DB.transact('fetchAllAdmin', getAndFilterPayload, enums.ADMIN_ADMIN_QUERY);
  } else {
    result = await DB.transact('fetchAndSearchAllAdmin', getAndSearchPayload, enums.ADMIN_ADMIN_QUERY);
  }
  const count = result.length !== 0 ? result[0].total : 0;
  if (Array.isArray(result)) {
    result.forEach((item) => delete item.total);
  }
  return {
    page: pageType,
    total_count: Number(count),
    total_page: Helpers.calculatePages(Number(count), Number(returnPerPage)),
    admins: result 
  };
};
