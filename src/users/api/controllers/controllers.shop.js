import { processAnyData } from '../services/services.db';
// import shopQueries from '../../queries/queries.shop';
import adminShopQueries from '../../../admins/api/queries/queries.shop';
import shopQueries      from '../queries/queries.shop';
import ApiResponse from '../../lib/http/lib.http.responses';
import { initializeBankTransferPayment, initializeCardPayment } from '../services/service.paystack';
import enums from '../../lib/enums';
import { v4 as uuidv4 } from 'uuid';
import { userActivityTracking } from '../../lib/monitor';
import { processOneOrNoneData } from '../../../admins/api/services/services.db';
import QRCode from 'qrcode';
import MailService from '../services/services.email';
import { SEND_TICKET_NOTIFICATIONS } from "../../lib/enums/lib.enum.messages";

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


function findIndexOfLeastValue(arr) {
  if (arr.length === 0) {
    return -1; // Return -1 if the array is empty
  }

  let minIndex = 0;
  let minValue = parseFloat(arr[0][1]); // Parse the string as a floating-point number

  for (let i = 1; i < arr.length; i++) {
    const currentValue = parseFloat(arr[i][1]);
    if (currentValue < minValue) {
      console.log('current value: ', currentValue);
      minValue = currentValue;
      minIndex = i;
    }
  }

  return minValue;
}

export const fetchTickets = async(req, res, next) => {
  try {
    const { user } = req;
    let tickets = await processAnyData(adminShopQueries.getAllEvents, [ req.body.status, req.query.ticket_id ]);
    const ticket_units = [];
    for (const tick in tickets) {
      ticket_units.push([ tickets[tick].ticket_category_id, tickets[tick].ticket_price ]);
    }
    const data = {
      'tickets': tickets
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
    const user_tickets = await processAnyData(
      shopQueries.getUserTickets, [ user.user_id, req.body.status ]);
    // logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user tickets fetched successfully fetchUserTickets.controller.shop.js`);
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
    const data = {
      'tickets': ticket_categories,
      'ticket_with_least_price': await findTicketWithLowestPrice(ticket_categories) // ticket_with_least_price
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Info: user ticket categories fetched successfully fetchTicketCategories.controller.shop.js`);
    return ApiResponse.success(res, enums.FETCH_TICKET_CATEGORIES_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 112, 'fail');
    error.label = enums.FAILED_TO_FETCH_TICKET_CATEGORIES;
    logger.error(`failed to fetch ticket categories::${enums.FAILED_TO_FETCH_USER_TICKETS}`);
    return next(error);
  }
};

function findTicketWithLowestPrice(tickets) {
  if (tickets.length === 0) {
    return null; // Return null if the array is empty
  }

  let lowestPriceTicket = tickets[0]; // Initialize with the first ticket

  for (let i = 1; i < tickets.length; i++) {
    if (parseInt(tickets[i].ticket_price) < parseInt(lowestPriceTicket.ticket_price)) {
      lowestPriceTicket = tickets[i];
    }
  }

  return lowestPriceTicket.ticket_price;
}



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
    const payment_channel = req.body.payment_channel;
    const ticketPurchaseLogs = [];
    let totalAmountToBePaid = 0;
    const { user } = req;

    for (const ticket of tickets) {
      const { ticket_id, ticket_category_id, units } = ticket;

      for (let ticketCounter = 1; ticketCounter <= units; ticketCounter++) {
        const barcodeString = `${ticket_id}|${req.user.user_id}`;
        const theQRCode = await generateQRCode(barcodeString);
        const availableTickets = await getAvailableTicketUnits(ticket_category_id);
        if (availableTickets && availableTickets.units >= 1) {
          const bookedTicket = await createUserTicket(
            req.user.user_id,
            ticket_id,
            ticket_category_id,
            req.body.insurance_coverage,
            req.body.payment_tenure,
            theQRCode
          );
          totalAmountToBePaid = totalAmountToBePaid + parseFloat(availableTickets.ticket_price);
          ticketPurchaseLogs.push(bookedTicket[0]);
          // logger.info(`User ticket QR Code successfully created. current total amount: ${totalAmountToBePaid}`);
          await updateAvailableTicketUnits(ticket_category_id, availableTickets.units - 1);
        }
        // TODO
        // add an "else" statement for handling cases where no available tickets.
      }
    }
    const reference = uuidv4();
    const paystackAmountFormatting = parseFloat(totalAmountToBePaid) * 100;
    const payment_operation = payment_channel === 'card' ? await initializeCardPayment(user, paystackAmountFormatting, reference) :
      await initializeBankTransferPayment(user, paystackAmountFormatting, reference);
    const data = {
      'tickets': ticketPurchaseLogs,
      'total_amount': totalAmountToBePaid,
      'payment': payment_operation
    };
    logger.info('User tickets created successfully.');
    return ApiResponse.success(res, enums.CREATE_USER_TICKET_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 113, 'fail');
    error.label = enums.FAILED_TO_CREATE_TICKET_SUBSCRIPTION;
    logger.error(`Failed to create ticket subscription: ${error.message}`);
    return next(error);
  }
};

async function generateQRCode(barcodeString) {
  return QRCode.toDataURL(barcodeString);
}

async function getAvailableTicketUnits(ticketCategoryId) {
  return await processOneOrNoneData(adminShopQueries.getTicketUnitsAvailable, ticketCategoryId);
}

async function createUserTicket(userId, ticketId, ticketCategoryId, insuranceCoverage, paymentTenure, qrCode) {
  return await processAnyData(adminShopQueries.createUserTicketRecord, [
    userId,
    ticketId,
    ticketCategoryId,
    1,
    insuranceCoverage,
    paymentTenure,
    'inactive',
    qrCode
  ]);
}

async function updateAvailableTicketUnits(ticketCategoryId, newUnits) {
  const slateArray = [ ticketCategoryId, newUnits ];
  return await processOneOrNoneData(adminShopQueries.updateTicketUnitsAvailable, slateArray);
}

export const _createTicketSubscription = async(req, res, next) => {
  try {
    const tickets = req.body.tickets;
    const ticket_purchase_logs = [];
    for (const ticket in tickets) {
      for (let ticket_counter = 1; ticket_counter <= tickets[ticket].units; ticket_counter++) {
        logger.info(`generating ticket count ${tickets[ticket].ticket_id}`);
        const barcode_string = tickets[ticket].ticket_id.concat('|', req.user.user_id);
        const the_qr = await QRCode.toDataURL(barcode_string);
        const available_tickets = await processOneOrNoneData(
          adminShopQueries.getTicketUnitsAvailable, tickets[ticket].ticket_category_id
        );

        // URGENT::Check if units to be purchased is greater than or equal to available units
        console.log('tickets available: ', available_tickets.units);

        const booked_ticket = await processAnyData(adminShopQueries.createUserTicketRecord, [
          req.user.user_id,
          tickets[ticket].ticket_id,
          tickets[ticket].ticket_category_id,
          1,
          req.body.insurance_coverage,
          req.body.payment_tenure,
          'inactive',
          the_qr
        ]);
        ticket_purchase_logs.push(booked_ticket[0]);
        logger.info(`${enums.CURRENT_TIME_STAMP},
        ${req.user.user_id}
                :::Info: user ticket QR Code successfully created. createTicketSubscription.controller.shop.js`);
        // update available ticket units
        const reduceTicket = available_tickets.units - 1;  // tickets[ticket].units;
        const slate_array = [ tickets[ticket].ticket_category_id, reduceTicket ];
        await processOneOrNoneData(adminShopQueries.updateTicketUnitsAvailable, slate_array);
      }

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

export const _sendEventTicketToEmails = async(req, res, next) => {
  try {
    const recipients = req.body.recipients;
    let data = {};
    const ticket_recipients = [];
    const ticket_id = req.body.ticket_id;
    const ticket = await processOneOrNoneData(adminShopQueries.getEventById, [ ticket_id ]);
    const title = 'Hurray! Ticket Booked';
    const content = `Your ticket for ${ticket.ticket_name} has been booked on SeedFi!`;
    // Send Tickets to recipients
    for (const recipient in recipients) {
      const savedRecipient = await processOneOrNoneData(adminShopQueries.savedRecipientInformation, [
        recipients[recipient].first_name,
        recipients[recipient].last_name,
        recipients[recipient].phone_number,
        recipients[recipient].email,
        ticket_id
      ]);
      ticket_recipients.push(savedRecipient);
      await MailService(ticket.ticket_name, 'ticketBookedForYou', {
        email: recipients[recipient].email,
        first_name: recipients[recipient].first_name,
        title: title,
        content: content,
        ticket: ticket
      });
    }
    data = {
      ticket_recipients: ticket_recipients
    };
    return ApiResponse.success(res, enums.SEND_TICKET_NOTIFICATIONS, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 115, 'fail');
    error.label = enums.FAILED_TO_SEND_EVENT_TICKETS_TO_EMAILS;
    return next(error);
  }
};

// Helper function to send a ticket email
const sendTicketEmail = async (recipient, ticket) => {
  const title = 'Hurray! Ticket Booked';
  const content = `Your ticket for ${ticket.ticket_name} has been booked on SeedFi!`;

  const savedRecipient = await processOneOrNoneData(adminShopQueries.savedRecipientInformation, [
    recipient.first_name,
    recipient.last_name,
    recipient.phone_number,
    recipient.email,
    ticket.ticket_id
  ]);

  await MailService(ticket.ticket_name, 'ticketBookedForYou', {
    email: recipient.email,
    first_name: recipient.first_name,
    title: title,
    content: content,
    ticket: ticket
  });

  return savedRecipient;
};

export const sendEventTicketToEmails = async(req, res, next) => {
  try {
    const recipients = req.body.recipients;
    const ticket_id = req.body.ticket_id;
    const ticket = await processOneOrNoneData(adminShopQueries.getEventById, [ticket_id]);

    const ticket_recipients = [];

    // Send Tickets to recipients
    for (const recipient of recipients) {
      const savedRecipient = await sendTicketEmail(recipient, ticket);
      ticket_recipients.push(savedRecipient);
    }

    const data = {
      ticket_recipients: ticket_recipients
    };

    return ApiResponse.success(res, enums.SEND_TICKET_NOTIFICATIONS, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 115, 'fail');
    error.label = enums.FAILED_TO_SEND_EVENT_TICKETS_TO_EMAILS;
    return next(error);
  }
};

export const cancel_ticket_booking = async(req, res, next) => {
  // reverse createUserTicketRecord
  // reverse updateTicketUnitsAvailable
};







