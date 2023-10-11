import { processOneOrNoneData, processAnyData } from '../services/services.db';
// import * as shopQueries from '../queries/queries.shop';
import shopQueries from '../queries/queries.shop';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import {
  CREATED_EVENT_SUCCESSFULLY,
  FAILED_TO_FETCH_USER_TICKETS,
  FETCH_LIST_OF_EVENT
} from "../../../users/lib/enums/lib.enum.messages";
import { create_event_record_failed, fetch_events_lists } from "../../lib/monitor/lib.monitor.description";
import { CREATE_EVENT_SUCCESSFUL } from "../../../users/lib/enums/lib.enum.labels";

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
    const createShopCategory = await processAnyData(shopQueries.createShopCategory, payload);

    logger.info(`Create shop category item:::${enums.CREATE_SHOP_CATEGORY_ITEM}`);
    return ApiResponse.success(res, enums.SHOP_CATEGORIES_LIST, enums.HTTP_OK, createShopCategory);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 57, 'fail', descriptions.create_shop_categories);
    error.label = enums.CREATE_SHOP_CATEGORY_ITEM;
    logger.error(`Failed to create shop category:::${enums.CREATE_SHOP_CATEGORY_ITEM}`, error.label);
    return next(error);
  }
};

export const getEventsList = async(req, res, next) => {
  try {
    console.log(req);
    let events = processOneOrNoneData(shopQueries.getAllEvents, req.params.status);
    console.log(JSON.stringify(events));
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
    let payload = [
      req.body.ticket_name,
      req.body.ticket_description,
      req.body.ticket_image_url,
      req.body.insurance_coverage,
      req.body.processing_fee,
      req.body.ticket_status
    ];
    const createEventRecord = await processAnyData(shopQueries.createEventRecord, payload);
    console.log(createEventRecord);
    logger.info(`Create Event Record:::${enums.CREATE_EVENT_SUCCESSFUL}`);
    return ApiResponse.success(res, enums.CREATED_EVENT_SUCCESSFULLY, enums.HTTP_OK, createEventRecord);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 59, 'fail', descriptions.create_event_record_failed);
    error.label = enums.CREATE_SHOP_CATEGORY_ITEM;
    logger.error(`Failed to create shop category:::${enums.CREATE_SHOP_CATEGORY_ITEM}`, error.label);
    return next(error);
  }
};
