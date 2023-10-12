import { processOneOrNoneData, processAnyData } from '../services/services.db';
// import * as shopQueries from '../queries/queries.shop';
import shopQueries from '../queries/queries.shop';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import {
  CREATE_CATEGORIES_ITEM,
  CREATED_EVENT_SUCCESSFULLY,
  FAILED_TO_FETCH_USER_TICKETS,
  FETCH_LIST_OF_EVENT, FETCH_TICKET_CATEGORIES_SUCCESSFULLY
} from "../../../users/lib/enums/lib.enum.messages";
import {
  create_event_category_record_failed,
  create_event_record_failed,
  fetch_events_lists
} from "../../lib/monitor/lib.monitor.description";
import {
  CREATE_EVENT_CATEGORY_SUCCESSFUL,
  CREATE_EVENT_SUCCESSFUL,
  FETCH_CATEGORY_LIST
} from "../../../users/lib/enums/lib.enum.labels";

export const listShopCategories = async(req, res, next) => {
  try {
    let shop_categories = await processAnyData(shopQueries.fetchShopCategories);
    return ApiResponse.success(res, enums.SHOP_CATEGORIES_LIST, enums.HTTP_OK, shop_categories);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 56, 'fail', descriptions.fetch_shop_categories);
    error.label = enums.FETCH_CATEGORY_LIST;
    logger.error(`Failed to fetch list of shop categories:::${enums.FETCH_CATEGORY_LIST}`, error.message);
    return next(error);
  }
};

export const createShopCategory = async(req, res, next) => {
  try {
    // collect parameters from the post
    let payload = [
      req.body.category_name,
      req.body.category_description,
      req.body.status
    ];
    let shop_categories = [];
    const createShopCategory = await processAnyData(shopQueries.createShopCategory, payload);
    if (createShopCategory[0].status) {
      shop_categories = await processAnyData(shopQueries.fetchShopCategories);
    }
    logger.info(`Create shop category item:::${enums.FETCH_CATEGORY_LIST}`);
    return ApiResponse.success(res, enums.CREATE_CATEGORIES_ITEM, enums.HTTP_OK, shop_categories);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 57, 'fail', descriptions.create_shop_categories);
    error.label = enums.CREATE_SHOP_CATEGORY_ITEM;
    logger.error(`Failed to create shop category:::${enums.CREATE_SHOP_CATEGORY_ITEM}`, error.label);
    return next(error);
  }
};

export const getEventsList = async(req, res, next) => {
  try {
    let events = await processAnyData(shopQueries.getAllEvents);
    if (events)
      return ApiResponse.success(res, enums.FETCH_LIST_OF_EVENT, enums.HTTP_OK, events);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 58, 'fail', descriptions.fetch_events_lists);
    error.label = enums.FAILED_TO_FETCH_USER_TICKETS;
    logger.error(`Failed to fetch list of shop categories:::${enums.FAILED_TO_FETCH_USER_TICKETS}`, error.message);
    return next(error);
  }
};

export const createEventRecord = async(req, res, next) => {
  try {
    const {
      ticket_name,
      ticket_description,
      ticket_image_url,
      insurance_coverage,
      processing_fee,
      ticket_status,
      event_date,
      ticket_categories
    } = req.body;

    // Create the event record
    const createEventRecord = await processAnyData(shopQueries.createEventRecord, [
      ticket_name,
      ticket_description,
      ticket_image_url,
      insurance_coverage,
      processing_fee,
      ticket_status,
      event_date
    ]);

    if (!createEventRecord) {
      // logger.error(`Failed to create event record:::${enums.CREATE_SHOP_CATEGORY_ITEM}`, error.label);
      throw new Error('Failed to create event record.');
    }

    const ticket_id = createEventRecord[0].ticket_id;

    for (const key in ticket_categories) {
      // Create ticket category
      await processOneOrNoneData(shopQueries.createTicketCategory, [ ticket_id, key, ticket_categories[key], 'active' ]);

      logger.info(`Created Ticket category ${key} with value ${ticket_categories[key]}:::${enums.CREATE_EVENT_CATEGORY_SUCCESSFUL}`);
    }

    logger.info(`Create Event Record:::${enums.CREATE_EVENT_SUCCESSFUL}`);
    return ApiResponse.success(res, enums.CREATED_EVENT_SUCCESSFULLY, enums.HTTP_OK, createEventRecord);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 59, 'fail', descriptions.create_event_record_failed);
    error.label = enums.CREATE_SHOP_CATEGORY_ITEM;
    logger.error(`Failed to create event record:::${enums.CREATE_SHOP_CATEGORY_ITEM}`, error.label);
    return next(error);
  }
};

export const fetchEventTicketCategories = async(req, res, next) => {
  try {
    const ticket_categories = await processAnyData(shopQueries.getTicketCategories, req.params.ticket);
    return ApiResponse.success(res, enums.FETCH_TICKET_CATEGORIES_SUCCESSFULLY, enums.HTTP_OK, ticket_categories);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 61, 'fail', descriptions.failed_to_fetch_ticket_categories);
    error.label = enums.FETCH_TICKET_CATEGORIES;;
    logger.error(`Failed to fetch event ticket categories record::${enums.FETCH_TICKET_CATEGORIES}`);
    return next(error)
  }
};

export const createEventRecord_ = async(req, res, next) => {
  try {
    let payload = [
      req.body.ticket_name,
      req.body.ticket_description,
      req.body.ticket_image_url,
      req.body.insurance_coverage,
      req.body.processing_fee,
      req.body.ticket_status,
      req.body.event_date
    ];
    const createEventRecord = await processAnyData(shopQueries.createEventRecord, payload);
    if (createEventRecord) {
      const ticket_id = createEventRecord[0].ticket_id;
      const ticket_categories = req.body.ticket_categories;
      for (const key in ticket_categories) {
        try {
          logger.info(`Created Ticket category ${key} with value ${ticket_categories[key]}:::${enums.CREATE_EVENT_CATEGORY_SUCCESSFUL}`);
          await processOneOrNoneData(shopQueries.createTicketCategory, [ ticket_id, key, ticket_categories[key], 'active' ]);
        } catch (error) {
          await adminActivityTracking(req.admin.admin_id, 60, 'fail', descriptions.create_event_category_record_failed);
          error.label = enums.CREATE_EVENT_CATEGORY_SUCCESSFUL;
          logger.error(`Failed to create shop category:::${enums.CREATE_EVENT_CATEGORY_SUCCESSFUL}`, error.label);
          return next(error);
        }
      }
    }
    logger.info(`Create Event Record:::${enums.CREATE_EVENT_SUCCESSFUL}`);
    return ApiResponse.success(res, enums.CREATED_EVENT_SUCCESSFULLY, enums.HTTP_OK, createEventRecord);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 59, 'fail', descriptions.create_event_record_failed);
    error.label = enums.CREATE_SHOP_CATEGORY_ITEM;
    logger.error(`Failed to create shop category:::${enums.CREATE_SHOP_CATEGORY_ITEM}`, error.label);
    return next(error);
  }
};
