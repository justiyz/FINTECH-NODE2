import { processAnyData } from '../services/services.db';
// import shopQueries from '../../queries/queries.shop';
import adminShopQueries from '../../../admins/api/queries/queries.shop';
import shopQueries      from '../queries/queries.shop';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import { userActivityTracking } from '../../lib/monitor';
import { processOneOrNoneData } from '../../../admins/api/services/services.db';
import QRCode from 'qrcode';
import { FAILED_TO_FETCH_TICKET_SUMMARY_STRING } from "../../lib/enums/lib.enum.labels";

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
    let tickets = await processAnyData(adminShopQueries.getAllEvents, [ req.body.status ]);
    const ticket_units = [];
    for (const tick in tickets) {
      // while (tick > 0) {
      //   console.log(tickets)
      // }
      // for (const counter in tick) {
      //
      // }
      ticket_units.push(tickets[tick]);
      // await processOneOrNoneData(adminShopQueries.getLeastValueTicket, tick.id);
    }
    const data = {
      tickets
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

export const getTicketSubscriptionSummary = async(req, res, next) => {
  try {
    const ticket_information = await processAnyData(shopQueries.getTicketSummary, req.params.ticket_id);
    for (const tick_information in ticket_information) {
      console.log(tick_information);
      // const ticket_price = await processOneOrNoneData(shopQueries.)
    }

  } catch (error) {
    await userActivityTracking(req.user.user_id, 116, 'fail');
    error.label = enums.FAILED_TO_FETCH_TICKET_SUMMARY_STRING;
    logger.error(`failed to fetch ticket categories::${enums.FAILED_TO_FETCH_TICKET_SUMMARY}`);
    return next(error);
  }
};

export const createTicketSubscription = async(req, res, next) => {
  try {
    const tickets = req.body.tickets;
    const ticket_purchase_logs = [];
    for (const ticket in tickets) {
      // get the number of tickets available
      const available_tickets = await processOneOrNoneData(
        adminShopQueries.getTicketUnitsAvailable, tickets[ticket].ticket_category_id
      );
      const ticket_application = [
        req.user.user_id,
        tickets[ticket].ticket_id,
        tickets[ticket].ticket_category_id,
        tickets[ticket].units,
        req.body.insurance_coverage,
        req.body.payment_tenure,
        'inactive'
      ];
      const booked_ticket = await processAnyData(adminShopQueries.createUserTicketRecord, ticket_application);
      const barcode_string = tickets[ticket].ticket_id.concat('|', req.user.user_id);
      // Generate QR Code for each ticket
      QRCode.toDataURL(barcode_string)
        .then(
          qr_code => {
            processOneOrNoneData(adminShopQueries.storeTicketQR, [ booked_ticket[0].user_ticket_id, qr_code ]);
            logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Info: user ticket QR Code successfully created. createTicketSubscription.controller.shop.js`);
          })
        .catch(err => {
          logger.error(`failed to update user ticket with QR Code::${enums.FAILED_TO_CREATE_TICKET_SUBSCRIPTION}, error: ${err}`);
        });
      // update available ticket units
      const reduceTicket = available_tickets.units - tickets[ticket].units;
      const slate_array = [ tickets[ticket].ticket_category_id, reduceTicket ];
      await processOneOrNoneData(adminShopQueries.updateTicketUnitsAvailable, slate_array);
      ticket_purchase_logs.push(booked_ticket);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Info: user ticket created successfully createTicketSubscription.controller.shop.js`);
    return ApiResponse.success(res, enums.CREATE_USER_TICKET_SUCCESSFULLY, enums.HTTP_OK, ticket_purchase_logs);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 113, 'fail');
    error.label = enums.FAILED_TO_CREATE_TICKET_SUBSCRIPTION;
    logger.error(`failed to fetch ticket categories::${enums.FAILED_TO_CREATE_TICKET_SUBSCRIPTION}`);
    return next(error);
  }
};

export const fetchUserSubscribedTickets = async(req, res, next) => {
  try {
    const user_id = req.user.user_id;
    const user_tickets = await processAnyData(adminShopQueries.fetchUserTickets, [ user_id ]);
    if (user_tickets)
      return ApiResponse.success(res, enums.FETCHED_USER_TICKETS_SUCCESSFULLY, enums.HTTP_OK, user_tickets);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 114, 'fail');
    error.label = enums.FAILED_TO_FETCH_USER_TICKETS;
    return next(error);
  }
};


export const sendEventTicketToEmails = async(req, res, next) => {
  try {
    const tickets = req.body.tickets;
    const ticket_id = req.params.ticket_id;
    console.log('ticket_id', ticket_id);
    for (const ticket in tickets) {
      // create QR code
      QRCode.toDataURL(ticket_id)
        .then(qr_code => {
          console.log(qr_code);
          const ticket_info = {
            'qr_code': qr_code,
            'email_address': tickets[ticket].email
          };
        })
        .catch(err => {
          console.log(err);
        });
      console.log(tickets[ticket].email);
    }
  } catch (error) {
    await userActivityTracking(req.user.user_id, 115, 'fail');
    error.label = enums.FAILED_TO_SEND_EVENT_TICKETS_TO_EMAILS;
    return next(error);
  }
};









