import DB from '../../services/services.db';
import enums from '../../../users/lib/enums';

export const getAdminByEmail = (payload) => DB.transact('getAdminByEmail', payload, enums.ADMIN_ADMIN_QUERY);
export const getAdminByAdminId = (payload) => DB.transact('getAdminByAdminId', payload, enums.ADMIN_ADMIN_QUERY);
export const inviteAdmin = (payload) => DB.transact('addAdmin', payload, enums.ADMIN_ADMIN_QUERY);

export const getAllTemplates = async(query, filter, user) => {
  const {
    page, per_page, search
  } = query;
  
  const { start_date, end_date } = filter;
  
  const fetch = per_page * page - per_page;
  
  const condition = search ? `${search.toLowerCase()}%` : null;
  
  let result;
  
  const getAndSearchPayload = [ user.id, condition, fetch, per_page ];
  const getAndFilterPayload = [ user.id, start_date, end_date, fetch, per_page ];
  if (start_date && end_date) {
    result = await DB.transact('getTemplateFilter', getAndFilterPayload, enums.TEMPLATE_QUERY);
  } else {
    result = await DB.transact('getAllTemplatesAndSearch', getAndSearchPayload, enums.TEMPLATE_QUERY);
  }
  const count = result.length !== 0 ? result[0].total : 0;
  if (Array.isArray(result)) {
    result.forEach((item) => delete item.total);
  }
  return {
    templates: result,
    total: count,
    page
  };
};
