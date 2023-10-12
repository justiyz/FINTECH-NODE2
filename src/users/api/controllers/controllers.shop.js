import { processAnyData } from '../services/services.db';
import shopQueries from '../queries/queries.shop';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import { userActivityTracking } from '../../lib/monitor';

export const shopCategories = async(req, res, next) => {
  try {
    const { user} = req;
    let shop_categories = await processAnyData(shopQueries.shopCategories, [ req.query.status ]);
    const data = {
      shop_categories
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: shop details fetched successfully shopCategories.controller.shop.js`);
    return ApiResponse.success(res, enums.SHOP_CATEGORIES_LIST, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 109, 'fail');
    error.label = enums.FETCH_CATEGORY_LIST;
    logger.error(`failed to fetch shop categories list::${enums.FETCH_CATEGORY_LIST}`, error.message);
    return next(error);
  }
};

export const fetchShopDetails = async(req, res, next) => {
  try {
    const { params: { shop_category_id }, user} = req;
    let shopDetails = await processAnyData(shopQueries.getShopDetails, [ shop_category_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: shop details fetched successfully fetchShopDetails.controller.shop.js`);
    return ApiResponse.success(res, enums.SHOP_CATEGORY_EXIST, enums.HTTP_OK, shopDetails);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 110, 'fail');
    error.label = enums.FETCH_SINGLE_CATEGORY;
    logger.error(`failed to fetch shop single category::${enums.FETCH_SINGLE_CATEGORY}`, error.message);
    return next(error);
  }
};

export const fetchTickets = async(req, res, next) => {
  try {
    const { user } = req;
    const user_ticket = await processAnyData(shopQueries.getTicketCategories, [ req.params.ticket_status ]);
    const data = {
      user_ticket
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: tickets fetched successfully fetchTickets.controller.shop.js`);
    return ApiResponse.success(res, enums.TICKET_LIST, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 110, 'fail');
    error.label = enums.FETCH_ALL_TICKETS;
    logger.error(`failed to fetch shop single category::${enums.FETCH_SINGLE_CATEGORY}`, error.message);
    return next(error);
  }
};

export const fetchUserTickets = async(req, res, next) => {
  try {
    const { user } = req;
    const user_tickets = await processAnyData(shopQueries.getUserTickets, [ user.user_id, req.body.status ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user tickets fetched successfully fetchUserTickets.controller.shop.js`);
    const data = {
      user_tickets
    };
    return ApiResponse.success(res, enums.FETCH_USER_TICKETS_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 111, 'fail');
    error.label = enums.FAILED_TO_FETCH_USER_TICKETS;
    logger.error(`failed to fetch shop single category::${enums.FETCH_SINGLE_CATEGORY}`, error.message);
    return next(error);
  }
};

export const fetchTicketCategories = async(req, res, next) => {
  try {
    const ticket_categories = await processAnyData(shopQueries.getTicketCategories, req.params.ticket_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Info: user ticket categories fetched successfully fetchTicketCategories.controller.shop.js`);
    return ApiResponse.success(res, enums.FETCH_TICKET_CATEGORIES_SUCCESSFULLY, enums.HTTP_OK, ticket_categories);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 112, 'fail');
    error.label = enums.FAILED_TO_FETCH_TICKET_CATEGORIES;
    logger.error(`failed to fetch ticket categories::${enums.FAILED_TO_FETCH_USER_TICKETS}`);
    return next(error);
  }
};








