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
} from '../../../users/lib/enums/lib.enum.messages';
import {
  create_event_category_record_failed,
  create_event_record_failed,
  fetch_events_lists
} from '../../lib/monitor/lib.monitor.description';
import {
  CREATE_EVENT_CATEGORY_SUCCESSFUL,
  CREATE_EVENT_SUCCESSFUL,
  FETCH_CATEGORY_LIST
} from '../../../users/lib/enums/lib.enum.labels';

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
      ticket_categories,
      ticket_start_date,
      ticket_end_date,
      event_location,
      event_time
    } = req.body;
    // event_start_date, event_end_date, event_location, event_time
    // try {
    const event_exists = await processAnyData(shopQueries.checkIfEventExist, ticket_name);
    // } catch (error) {
    if (event_exists.length > 0) {
      console.log(event_exists);
      // logger.error(`Failed to create event record:::${enums.CREATE_SHOP_CATEGORY_ITEM}`, error.label);
      // return next(error);
    }


    // Create the event record
    const createEventRecord = await processAnyData(shopQueries.createEventRecord, [
      ticket_name,
      ticket_description,
      ticket_image_url,
      insurance_coverage,
      processing_fee,
      ticket_status,
      event_date,
      ticket_start_date,
      ticket_end_date,
      event_location,
      event_time
    ]);
    // Create ticket category
    const ticket_id = createEventRecord[0].ticket_id;
    for (const category in ticket_categories) {
      const c_ticket = ticket_categories[category];
      await processOneOrNoneData(shopQueries.createTicketCategory, [
        ticket_id,
        c_ticket.type,
        c_ticket.amount,
        c_ticket.units,
        c_ticket.ticket_start_date,
        c_ticket.ticket_end_date,
        c_ticket.event_location,
        c_ticket.event_time,
        'active' ]
      );
      logger.info(`Created Ticket category ${c_ticket.type} with value ${c_ticket.amount} and ${c_ticket.units} units:::${enums.CREATE_EVENT_CATEGORY_SUCCESSFUL}`);
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
/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<void>}
 */
export const updateEventRecord = async (req, res, next) => {
  try {
    const eventId = req.params.eventId; // Extract the event ID from the URL
    const updatedEventDetails = req.body; // Get the updated event details from the request body

    // Call the update function to update the event record
    await updateEventRecord_(eventId, updatedEventDetails);

    // Respond with a success message or updated event details
    res.status(200).json({ message: 'Event record updated successfully' });
  } catch (error) {
    // Handle and log any errors
    next(error);
  }
};

/**
 *
 * @param eventId
 * @param updatedEventDetails
 * @returns {Promise<void>}
 */
async function updateEventRecord_(eventId, updatedEventDetails) {
  // Execute an UPDATE query on the events table
  const updateQuery = `
    UPDATE events
    SET
      ticket_name = $1,
      ticket_description = $2,
      -- Include other columns to update
    WHERE
      event_id = $n; -- Use the event's unique identifier
  `;

  // Provide updated event details as parameters to the query
  const queryParams = [
    updatedEventDetails.ticket_name,
    updatedEventDetails.ticket_description,
    // Include parameters for other columns
    eventId, // The event's unique identifier
  ];

  // Execute the update query and handle any errors
  try {
    await processAnyData(updateQuery, queryParams);
  } catch (error) {
    throw error;
  }
}

export const createEventRecord2 = async(req, res, next) => {
  try {
    const eventDetails = extractEventDetails(req.body);

    const createEventResult = await createEvent(eventDetails);

    const ticketCategories = req.body.ticket_categories;
    await createTicketCategories(createEventResult[0].ticket_id, ticketCategories);

    return handleSuccess(res, createEventResult);
  } catch (error) {
    handleEventError(error, req.admin.admin_id, next);
  }
};

// Handle error and log
async function handleEventError(error, adminId, next) {
  await adminActivityTracking(adminId, 59, 'fail', descriptions.create_event_record_failed);
  error.label = enums.CREATE_SHOP_CATEGORY_ITEM;
  logger.error(`Failed to create event record:::${enums.CREATE_SHOP_CATEGORY_ITEM}`, error.label);
  return next(error);
}


// Extract event details from the request body
function extractEventDetails(body) {
  const {
    ticket_name,
    ticket_description,
    ticket_image_url,
    insurance_coverage,
    processing_fee,
    ticket_status,
    event_date,
    ticket_start_date,
    ticket_end_date,
    event_location,
    event_time,
  } = body;

  return {
    ticket_name,
    ticket_description,
    ticket_image_url,
    insurance_coverage,
    processing_fee,
    ticket_status,
    event_date,
    ticket_start_date,
    ticket_end_date,
    event_location,
    event_time,
  };
}

// Create an event record
async function createEvent(eventDetails) {
  return processAnyData(shopQueries.createEventRecord, Object.values(eventDetails));
}

// Create ticket categories for the event
async function createTicketCategories(ticketId, ticketCategories) {
  for (const category in ticketCategories) {
    const c_ticket = ticketCategories[category];
    const ticketCategoryDetails = {
      ticket_id: ticketId,
      ...c_ticket,
      status: 'active',
    };
    await processOneOrNoneData(shopQueries.createTicketCategory, Object.values(ticketCategoryDetails));
    logger.info(`Created Ticket category ${c_ticket.type} with value ${c_ticket.amount} and ${c_ticket.units} units:::${enums.CREATE_EVENT_CATEGORY_SUCCESSFUL}`);
  }
}

// Handle success and send response
function handleSuccess(res, createEventResult) {
  logger.info(`Create Event Record:::${enums.CREATE_EVENT_SUCCESSFUL}`);
  return ApiResponse.success(res, enums.CREATED_EVENT_SUCCESSFULLY, enums.HTTP_OK, createEventResult);
}

export const fetchEventTicketCategories = async(req, res, next) => {
  try {
    const ticket_categories = await processAnyData(shopQueries.getTicketCategories, req.params.ticket);
    return ApiResponse.success(res, enums.FETCH_TICKET_CATEGORIES_SUCCESSFULLY, enums.HTTP_OK, ticket_categories);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 61, 'fail', descriptions.failed_to_fetch_ticket_categories);
    error.label = enums.FETCH_TICKET_CATEGORIES;
    logger.error(`Failed to fetch event ticket categories record::${enums.FETCH_TICKET_CATEGORIES}`);
    return next(error);
  }
};

