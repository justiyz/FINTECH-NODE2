import DB from '../services/services.db';
import enums from '../../users/lib/enums';


export const fetchAllAdmins = async(query, filter) => {
  const {
    page, per_page, search
  } = query;
  
  const { start_date, end_date, status } = filter;
  
  const fetch = per_page * page - per_page;
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
    result: { ...result },
    total: count,
    page
  };
};
