import adminQueries from '../queries/queries.admin';
import { processAnyData } from './services.db';
import * as Helpers from '../../lib/utils/lib.util.helpers';

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
    result = await processAnyData(adminQueries.fetchAllAdmin, getAndFilterPayload);
  } else {
    result = await processAnyData(adminQueries.fetchAndSearchAllAdmin, getAndSearchPayload);
  }
  const count = result.length !== 0 ? result[0].total : 0;
  if (Array.isArray(result)) {
    result.forEach((item) => delete item.total);
  }
  return {
    page: parseFloat(pageType),
    total_count: Number(count),
    total_pages: Helpers.calculatePages(Number(count), Number(returnPerPage)),
    admins: result 
  };
};

export const fetchAdmins = async(query, filter) => {
  const {
    search
  } = query;
  
  const { start_date, end_date, status } = filter;
  const condition = search ? `${search.toLowerCase()}%` : null;
  let result;
  const getAndSearchPayload = [ condition ];
  const getAndFilterPayload = [ status, start_date, end_date ];

  if ((start_date && end_date) || status)  {
    result = await processAnyData(adminQueries.fetchAdmins, getAndFilterPayload);
  } else {
    result = await processAnyData(adminQueries.fetchAndSearchAdmins, getAndSearchPayload);
  }
  if (Array.isArray(result)) {
    result.forEach((item) => delete item.total);
  }
  return {
    admins: result 
  };
};
