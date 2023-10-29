import { processOneOrNoneData, processAnyData } from '../services/services.db';
// import * as shopQueries from '../queries/queries.shop';
import shopQueries from '../queries/queries.shop';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import * as S3 from '../services/services.s3'
import {
  CREATE_CATEGORIES_ITEM,
  CREATED_EVENT_SUCCESSFULLY, EVENT_EXISTS, EVENT_TICKET_CATEGORY_NOT_FOUND,
  FAILED_TO_FETCH_USER_TICKETS,
  FETCH_LIST_OF_EVENT, FETCH_TICKET_CATEGORIES_SUCCESSFULLY, UPDATE_EVENT_SUCCESSFUL_MESSAGE
} from "../../../users/lib/enums/lib.enum.messages";
import {
  create_event_category_record_failed,
  create_event_record_failed,
  fetch_events_lists
} from '../../lib/monitor/lib.monitor.description';
import {
  CREATE_EVENT_CATEGORY_SUCCESSFUL,
  CREATE_EVENT_SUCCESSFUL, EVENT_RECORD_ALREADY_CREATED,
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

// Function to check if an event exists
const checkIfEventExists = async (eventName) => {
  return await processAnyData(shopQueries.checkIfEventExist, eventName);
};

// Function to create an event record
const createEventDBRecord = async(eventData) => {
  return await processAnyData(shopQueries.createEventRecord, eventData);
};

// Function to create a ticket category
const createTicketCategory = async(ticketId, categoryData) => {
  const ticketCategoryObject = [
    ticketId,
    categoryData.type,
    categoryData.amount,
    categoryData.units,
    'active'
  ];
  return await processOneOrNoneData(shopQueries.createTicketCategory, ticketCategoryObject);
};

// Function to create an event
export const createEventRecord = async(req, res, next) => {
  const eventData = {
    ticket_name: req.body.ticket_name,
    ticket_description: req.body.ticket_description,
    ticket_image_url: req.body.ticket_image_url,
    insurance_coverage: req.body.insurance_coverage,
    processing_fee: req.body.processing_fee,
    ticket_status: req.body.ticket_status,
    event_date: req.body.event_date,
    ticket_start_date: req.body.ticket_start_date,
    ticket_end_date: req.body.ticket_end_date,
    event_location: req.body.event_location,
    event_time: req.body.event_time
  };
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

  try {
    const eventExists = await checkIfEventExists(eventData.ticket_name);
    if (Object.keys(eventExists).length > 0) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: Event record exists createEventRecord.controller.shop.js`);
      return ApiResponse.error(res, enums.EVENT_EXISTS, enums.HTTP_FORBIDDEN, enums.EVENT_RECORD_ALREADY_CREATED);
    }
    const createdEventRecord = await createEventDBRecord([
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
    const ticketId = createdEventRecord[0].ticket_id;
    const ticketCategories = JSON.parse(ticket_categories);

    for (const categoryItem in ticketCategories) {
      await createTicketCategory(ticketId, ticketCategories[categoryItem]);
      logger.info(`Created Ticket category ${ticketCategories[categoryItem].type} with `
        +`value ${ticketCategories[categoryItem].amount} and ${ticketCategories[categoryItem].units}`
        +` units:::${enums.CREATE_EVENT_CATEGORY_SUCCESSFUL}`);
    }

    logger.info(`Create Event Record:::${enums.CREATE_EVENT_SUCCESSFUL}`);
    return ApiResponse.success(res, enums.CREATED_EVENT_SUCCESSFULLY, enums.HTTP_OK, createdEventRecord);
  } catch (error) {
    await adminActivityTracking(req.admin.admin_id, 59, 'fail', descriptions.create_event_record_failed);
    error.label = enums.CREATE_SHOP_CATEGORY_ITEM;
    logger.error(`Failed to create event record:::${enums.CREATE_SHOP_CATEGORY_ITEM}`, error.label);
    return next(error);
  }
};

export const createEventRecord_old = async(req, res, next) => {
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
    const event_exists = await processAnyData(shopQueries.checkIfEventExist, ticket_name);
    if (Object.keys(event_exists).length > 0) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: Event record exists createEventRecord.controller.shop.js`);
      return ApiResponse.error(res, enums.EVENT_EXISTS, enums.HTTP_FORBIDDEN, enums.EVENT_RECORD_ALREADY_CREATED);
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
    const ticketsObject = JSON.parse(ticket_categories);
    for (const category_item in ticketsObject) {
      const ticket_category_object = [
        ticket_id,
        ticketsObject[category_item].type,
        ticketsObject[category_item].amount,
        ticketsObject[category_item].units,
        'active'
      ];
      await processOneOrNoneData(shopQueries.createTicketCategory, ticket_category_object);
      logger.info(`Created Ticket category ${ticketsObject[category_item].type} with `
        +`value ${ticketsObject[category_item].amount} and ${ticketsObject[category_item].units}`
        +` units:::${enums.CREATE_EVENT_CATEGORY_SUCCESSFUL}`);
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

export const updateEventRecord = async(req, res, next) => {
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

async function updateEventRecord_(eventId, updatedEventDetails) {
  // Execute an UPDATE query on the events table
  const updateQuery = `
    UPDATE events
    SET
      ticket_name = $1,
      ticket_description = $2,n
    WHERE
      event_id = $n;
  `;

  // Provide updated event details as parameters to the query
  const queryParams = [
    updatedEventDetails.ticket_name,
    updatedEventDetails.ticket_description,
    // Include parameters for other columns
    eventId // The event's unique identifier
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
    event_time
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
    event_time
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
      status: 'active'
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

// Function to retrieve the event record by ticket_id
const getEventRecordByTicketId = async(ticketId) => {
  return await processOneOrNoneData(shopQueries.getEventRecordByTicketId, ticketId);
};

const getTicketCategoryRecord = async(ticketCategoryID) => {
  return await processOneOrNoneData(shopQueries.getTicketCategory, ticketCategoryID);
};

// Function to update the event record
const updateCurrentEventRecord = async(ticketId, eventData) => {
  eventData.push(ticketId);
  return await processOneOrNoneData(shopQueries.updateEventRecord, eventData);
};

// Function to edit an event category record
export const unoptimized_updateEventTicketCategory = async(req, res, next) => {
  const ticket_category_id = req.params.ticket_category_id;
  try {
    const getTicketCategoryRecord = await getEventRecordByTicketId(ticket_category_id);
    if (!getTicketCategoryRecord) {
      return ApiResponse.error(res, enums.EVENT_TICKET_CATEGORY_NOT_FOUND, enums.HTTP_NOT_FOUND, enums.EVENT_RECORD_NOT_FOUND);
    }
    const {
      ticket_price,
      units,
      ticket_category_status
    } = req.body;
    const updatedEventRecord = await processOneOrNoneData(shopQueries.updateEventTicketCategory,
      [ ticket_price, units, ticket_category_status, ticket_category_id ]);

    return ApiResponse.success(res, enums.UPDATE_EVENT_TICKET_SUCCESSFUL, enums.HTTP_OK, updatedEventRecord);
  } catch (error) {
    error.label = enums.EDIT_EVENT_RECORD;
    logger.error(`Failed to edit event record:::${enums.EDIT_EVENT_RECORD}`, error.label);
    return next(error);
  }
};

// Function to get an event ticket category record by ID
const getEventTicketCategoryRecord = async(ticketCategoryId) => {
  return await processAnyData(shopQueries.getTicketCategoryByID, ticketCategoryId);
};

// Function to update an event ticket category
const updateEventTicketCategory = async(ticketCategoryId, ticketData) => {
  const { ticket_price, units, ticket_category_status } = ticketData;
  return await processOneOrNoneData(shopQueries.updateEventTicketCategory, [
    ticket_price,
    units,
    ticket_category_status,
    ticketCategoryId
  ]);
};

// edit a category of event ticket using the ticket_category_id
export const editEventTicketCategory = async(req, res, next) => {
  const ticketCategoryId = req.params.ticket_category_id;

  try {
    const existingTicketCategory = await getEventTicketCategoryRecord(ticketCategoryId);

    if (!existingTicketCategory) {
      return ApiResponse.error(res, enums.EVENT_TICKET_CATEGORY_NOT_FOUND, enums.HTTP_NOT_FOUND, enums.EVENT_TICKET_CATEGORY_NOT_FOUND);
    }

    const ticketData = req.body;
    const updatedTicketCategory = await updateEventTicketCategory(ticketCategoryId, ticketData);
    return ApiResponse.success(res, enums.UPDATE_EVENT_TICKET_SUCCESSFUL, enums.HTTP_OK, updatedTicketCategory);
  } catch (error) {
    error.label = enums.EDIT_EVENT_TICKET_CATEGORY;
    logger.error(`Failed to edit event ticket category:::${enums.EDIT_EVENT_TICKET_CATEGORY}`, error.label);
    return next(error);
  }
};

// Function to edit an event record
export const editEventRecord = async(req, res, next) => {
  const ticketId = req.params.event_id; // Assuming the ticket_id is passed as a URL parameter
  try {
    const existingEventRecord = await getTicketCategoryRecord(ticketId);
    if (!existingEventRecord) {
      return ApiResponse.error(res, enums.EVENT_NOT_FOUND, enums.HTTP_NOT_FOUND, enums.EVENT_RECORD_NOT_FOUND);
    }

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

    const updatedEventRecord = await updateCurrentEventRecord(ticketId, [
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
    ]);

    return ApiResponse.success(res, enums.UPDATE_EVENT_SUCCESSFUL_MESSAGE, enums.HTTP_OK, updatedEventRecord);
  } catch (error) {
    error.label = enums.EDIT_EVENT_RECORD;
    logger.error(`Failed to edit event record:::${enums.EDIT_EVENT_RECORD}`, error.label);
    return next(error);
  }
};
