import { processAnyData, processNoneData } from "../services/services.db";
// import shopQueries from '../../queries/queries.shop';
import adminShopQueries from '../../../admins/api/queries/queries.shop';
import shopQueries      from '../queries/queries.shop';
import ApiResponse from '../../lib/http/lib.http.responses';
import {
  calculateAmountPlusPaystackTransactionCharge,
  initializeBankTransferPayment,
  initializeCardPayment
} from "../services/service.paystack";
import enums from '../../lib/enums';
import { v4 as uuidv4 } from 'uuid';
import { userActivityTracking } from '../../lib/monitor';
import { processOneOrNoneData } from '../../../admins/api/services/services.db';
import QRCode from 'qrcode';
import MailService from '../services/services.email';
import {
  DELETE_TICKET_INFORMATION, EVENT_RECORD_UPDATED_AFTER_SUCCESSFUL_PAYMENT,
  FAILED_TO_BOOK_TICKETS,
  SEND_TICKET_NOTIFICATIONS
} from "../../lib/enums/lib.enum.messages";
import {
  CHECK_USER_TICKET_LOAN_ELIGIBILITY_CONTROLLER,
  EVENT_PAYMENT_SUCCESSFUL
} from "../../lib/enums/lib.enum.labels";
import notificationQueries from "../queries/queries.notification";
import loanQueries from "../queries/queries.loan";
import LoanPayload from "../../lib/payloads/lib.payload.loan";
import { loanApplicationEligibilityCheck } from "../services/service.seedfiUnderwriting";
import { sendNotificationToAdmin } from "../services/services.firebase";
import * as adminNotification from "../../lib/templates/adminNotification";
import { generateOfferLetterPDF } from "../../lib/utils/lib.util.helpers";
import AdminMailService from "../../../admins/api/services/services.email";

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
      minValue = currentValue;
      minIndex = i;
    }
  }

  return minValue;
}

function isObjectEmpty(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}
export const fetchTickets = async(req, res, next) => {
  try {
    const { user } = req;
    let tickets = await processAnyData(adminShopQueries.getAllEvents, [ req.body.status, req.query.ticket_id ]);
    for (const tick in tickets) {
      const least_ticket_priced_ticket = await processAnyData(adminShopQueries.getPriceOfLeastValueTicket, tickets[tick].ticket_id);
      if (typeof least_ticket_priced_ticket[0] !== 'undefined') {
        tickets[tick].lowest_ticket_price = least_ticket_priced_ticket[0].ticket_price;
      } else {
        tickets[tick].lowest_ticket_price = 0;
      }
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

// fetch users tickets
export const fetchUserTickets = async(req, res, next) => {
  try {
    const { user } = req;
    const user_tickets = await fetchUserTicketsData(user.user_id, req.query.status);

    // separation of concerns for optimized reading
    for (const user_ticket of user_tickets) {
      await enrichUserTicketData(user_ticket);
    }

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user tickets fetched successfully fetchUserTickets.controller.shop.js`);

    const data = { user_tickets };
    return ApiResponse.success(res, enums.FETCH_USER_TICKETS_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 111, 'fail');
    error.label = enums.FAILED_TO_FETCH_USER_TICKETS;
    logger.error(`failed to fetch shop single category::${enums.FETCH_SINGLE_CATEGORY}`, error.message);
    return next(error);
  }
};

async function fetchUserTicketsData(userId, status) {
  return await processAnyData(shopQueries.getUserTickets, [ userId, status ]);
}

async function enrichUserTicketData(user_ticket) {
  const least_ticket_priced_ticket = await processAnyData(
    adminShopQueries.getPriceOfLeastValueTicket, user_ticket.ticket_id);
  const ticket_category = await processOneOrNoneData(
    adminShopQueries.getTicketCategoryTypeById, [ user_ticket.ticket_id, user_ticket.ticket_category_id ]);
  const { ticket_name, event_location, event_time, ticket_image_url, event_date } = await processOneOrNoneData(
    adminShopQueries.getCustomerTicketInformation, [ user_ticket.ticket_id, user_ticket.user_id ]);

  if (typeof least_ticket_priced_ticket[0] !== 'undefined') {
    user_ticket.ticket_name = ticket_name;
    user_ticket.event_location = event_location;
    user_ticket.event_time = event_time;
    user_ticket.ticket_image_url = ticket_image_url;
    user_ticket.event_date = event_date;
    user_ticket.lowest_ticket_price = least_ticket_priced_ticket[0].ticket_price;
    user_ticket.ticket_category_type = ticket_category.ticket_category_type;
  } else {
    user_ticket.ticket_name = '';
    user_ticket.event_location = '';
    user_ticket.event_time = '';
    user_ticket.ticket_image_url = '';
    user_ticket.event_time = '';
    user_ticket.lowest_ticket_price = 0;
  }
}
export const _fetchUserTickets = async(req, res, next) => {
  try {
    const { user } = req;
    const user_tickets = await processAnyData(
      shopQueries.getUserTickets, [ user.user_id, req.query.status ]);
    for (const tick in user_tickets) {
      const least_ticket_priced_ticket = await processAnyData(adminShopQueries.getPriceOfLeastValueTicket, user_tickets[tick].ticket_id);
      const ticket_category = await processOneOrNoneData(
        adminShopQueries.getTicketCategoryTypeById, [
          user_tickets[tick].ticket_id,
          user_tickets[tick].ticket_category_id ]
      );
      const { ticket_name, event_location, event_time } = await processOneOrNoneData(
        adminShopQueries.getCustomerTicketInformation,
        [
          user_tickets[tick].ticket_id,
          user_tickets[tick].user_id
        ]);

      if (typeof least_ticket_priced_ticket[0] !== 'undefined') {
        user_tickets[tick].ticket_name = ticket_name;
        user_tickets[tick].event_location = event_location;
        user_tickets[tick].event_time = event_time;
        user_tickets[tick].lowest_ticket_price = least_ticket_priced_ticket[0].ticket_price;
        user_tickets[tick].ticket_category_type = ticket_category.ticket_category_type;
      } else {
        user_tickets[tick].ticket_name = '';
        user_tickets[tick].event_location = '';
        user_tickets[tick].event_time = '';
        user_tickets[tick].lowest_ticket_price = 0;
      }
    }
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
    const amountWithTransactionCharges = await calculateAmountPlusPaystackTransactionCharge(paystackAmountFormatting);
    const payment_operation = payment_channel === 'card' ? await initializeCardPayment(user, amountWithTransactionCharges, reference) :
      await initializeBankTransferPayment(user, amountWithTransactionCharges, reference);
    const data = {
      'tickets': ticketPurchaseLogs,
      'total_amount': totalAmountToBePaid,
      'payment': payment_operation
    };
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::User tickets created successfully.`);
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
const sendTicketEmail = async(recipient, ticket) => {
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
    const ticket = await processOneOrNoneData(adminShopQueries.getEventById, [ ticket_id ]);

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
  try {
    const ticket_id = req.params.ticket_id;
    const user_id = req.user.user_id;
    const data = {};
    await processAnyData(adminShopQueries.deleteTicketInformationRecord, [ ticket_id, user_id ]);
    await processAnyData(adminShopQueries.deleteTicketRecord, [ ticket_id, user_id ]);
    return ApiResponse.success(res, enums.DELETE_TICKET_INFORMATION, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 117, 'fail');
    error.label = enums.FAILED_TO_BOOK_TICKETS;
    return next(error);
  }
};

export const checkUserTicketLoanEligibility = async(req, res, next) => {
  try {
    const { user, body, userEmploymentDetails, userLoanDiscount, userDefaultAccountDetails, clusterType,
      userMinimumAllowableAMount, userMaximumAllowableAmount, previousLoanCount } = req;
    const ticket_bookings = req.body.tickets;
    const _user_fees = {
      'insurance_fee': 0,
      'advisory_fee': 0,
      'processing_fee': 100
    };
    // calculate fee
    // const user_fees = req.body.fee;
    let total_fee = 0;
    for (const fee in _user_fees) {
      total_fee += Number(_user_fees[fee]);
    }
    // calculate amount to be booked
    let booking_amount = 0;
    for (const ticket_record_id in ticket_bookings) {
      const ticket_information = await processOneOrNoneData(adminShopQueries.getEventAmountByEventIdAndEventCategoryId, [
        ticket_bookings[ticket_record_id].ticket_id,
        ticket_bookings[ticket_record_id].ticket_category_id
      ]);
      booking_amount = booking_amount + Number(ticket_information?.ticket_price);
    }

    const booking_amount_plus_charges = booking_amount;
    body.amount = booking_amount;
    body.loan_reason = 'event booking';
    body.bank_statement_service_choice = 'okra';
    const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'loan application' ]);
    const userMonoId = userDefaultAccountDetails.mono_account_id === null ? '' : userDefaultAccountDetails.mono_account_id;
    const userBvn = await processOneOrNoneData(loanQueries.fetchUserBvn, [ user.user_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: fetched user bvn from the db checkUserLoanEligibility.controllers.loan.js`);
    const [ userPreviouslyDefaulted ] = await processAnyData(loanQueries.checkIfUserHasPreviouslyDefaultedInLoanRepayment, [ user.user_id ]);
    const previouslyDefaultedCount = parseFloat(userPreviouslyDefaulted.count);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: checked if user previously defaulted in loan repayment checkUserLoanEligibility.controllers.loan.js`);

    const loanApplicationDetails = await processOneOrNoneData(loanQueries.initiatePersonalLoanApplication, [
      user.user_id,
      booking_amount_plus_charges,
      booking_amount_plus_charges,
      'Ticket Loan',
      body.duration_in_months,
      body.duration_in_months,
      0,
      0
    ]);

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: initiated loan application in the db checkUserLoanEligibility.controllers.loan.js`);
    const payload = await LoanPayload.checkUserEligibilityPayload(user, body, userDefaultAccountDetails, loanApplicationDetails, userEmploymentDetails, userBvn, userMonoId,
      userLoanDiscount, clusterType, userMinimumAllowableAMount, userMaximumAllowableAmount, previousLoanCount, previouslyDefaultedCount);
    console.log('JSON Input For Loan Eligibility: ', payload);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: ${payload}`);
    const result = await loanApplicationEligibilityCheck(payload);
    console.log('JSON Result For Loan Eligibility: ', result);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}::: ${result}`);

    if (result.status !== 200) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status check failed checkUserLoanEligibility.controllers.loan.js`);
      await processNoneData(loanQueries.deleteInitiatedLoanApplication, [ loanApplicationDetails.loan_id, user.user_id ]);
      if (result.status >= 500 || result.response.status >= 500) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: returned response from underwriting is of a 500 plus status
        checkUserLoanEligibility.controllers.loan.js`);
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Failed Loan Application', adminNotification.loanApplicationDownTime(),
            [ `${user.first_name} ${user.last_name}` ], 'failed-loan-application');
        });
        userActivityTracking(req.user.user_id, 37, 'fail');
        return ApiResponse.error(res, enums.UNDERWRITING_SERVICE_NOT_AVAILABLE, enums.HTTP_SERVICE_UNAVAILABLE, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
      }
      if (result.response.data?.message === 'Service unavailable loan application can\'t be completed. Please try again later.') {
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Failed Loan Application', adminNotification.loanApplicationDownTime(),
            [ `${user.first_name} ${user.last_name}` ], 'failed-loan-application');
        });
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user just initiated loan application deleted checkUserLoanEligibility.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, result.response.data.message, result.response.status, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }
    const { data } = result;
    if (data.final_decision === 'DECLINED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status shows user is not eligible for loan
      checkUserLoanEligibility.controllers.loan.js`);
      const declinedDecisionPayload = LoanPayload.processDeclinedLoanDecisionUpdatePayload(data);
      const updatedLoanDetails = await processOneOrNoneData(loanQueries.updateUserDeclinedDecisionLoanApplication);
      userActivityTracking(req.user.user_id, 37, 'fail');
      userActivityTracking(req.user.user_id, 40, 'success');
      const returnData = await LoanPayload.loanApplicationDeclinedDecisionResponse(user, data, updatedLoanDetails.status, 'DECLINED');
      return ApiResponse.success(res, enums.LOAN_APPLICATION_DECLINED_DECISION, enums.HTTP_OK, returnData);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status shows user is eligible for loan
    checkUserLoanEligibility.controllers.loan.js`);
    const totalFees = (parseFloat(data.fees.processing_fee) + parseFloat(data.fees.insurance_fee) + parseFloat(data.fees.advisory_fee));
    const totalMonthlyRepayment = (parseFloat(data.monthly_repayment) * Number(data.loan_duration_in_month));
    const totalInterestAmount = data.max_approval === null ? parseFloat(totalMonthlyRepayment) - parseFloat(data.loan_amount) :
      parseFloat(totalMonthlyRepayment) - parseFloat(data.max_approval);
    const totalAmountRepayable = parseFloat(totalMonthlyRepayment) + parseFloat(totalFees);
    if (data.final_decision === 'MANUAL') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status should be subjected to manual approval
      checkUserLoanEligibility.controllers.loan.js`);
      const manualDecisionPayload = LoanPayload.processLoanDecisionUpdatePayload(data, totalAmountRepayable, totalInterestAmount, 'in review');
      const updatedLoanDetails = await processOneOrNoneData(loanQueries.updateUserManualOrApprovedDecisionLoanApplication);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: latest loan details updated checkUserLoanEligibility.controllers.loan.js`);
      const offerLetterData = await generateOfferLetterPDF(user, updatedLoanDetails);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan offer letter generated checkUserLoanEligibility.controllers.loan.js`);
      await processNoneData(loanQueries.updateOfferLetter, [ loanApplicationDetails.loan_id, user.user_id, offerLetterData.Location.trim() ]);
      const returnData = await LoanPayload.loanApplicationApprovalDecisionResponse(data, totalAmountRepayable, totalInterestAmount, user,
        updatedLoanDetails.status, 'MANUAL', offerLetterData.Location.trim());

      admins.map(async(admin) => {
        const data = {
          email: admin.email,
          loanUser: `${user.first_name} ${user.last_name}`,
          type: 'an individual',
          first_name: admin.first_name
        };
        await AdminMailService('Manual Loan Approval Required', 'manualLoanApproval', { ...data });
        sendNotificationToAdmin(admin.admin_id, 'Manual Approval Required', adminNotification.loanApplicationApproval(),
          [ `${user.first_name} ${user.last_name}` ], 'manual-approval');
      });
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: Notification sent to admin successfully checkUserLoanEligibility.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'success');
      userActivityTracking(req.user.user_id, 38, 'success');
      return next();
      // return ApiResponse.success(res, enums.LOAN_APPLICATION_MANUAL_DECISION, enums.HTTP_OK, returnData);
    }
    if (data.final_decision === 'APPROVED') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status passes and user is eligible for automatic loan approval
      checkUserLoanEligibility.controllers.loan.js`);
      const approvedDecisionPayload = LoanPayload.processLoanDecisionUpdatePayload(data, totalAmountRepayable, totalInterestAmount, 'approved');
      const updatedLoanDetails = await processOneOrNoneData(loanQueries.updateUserManualOrApprovedDecisionLoanApplication, approvedDecisionPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: latest loan details updated checkUserLoanEligibility.controllers.loan.js`);
      // const offerLetterData = await generateOfferLetterPDF(user, updatedLoanDetails);
      // logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan offer letter generated checkUserLoanEligibility.controllers.loan.js`);
      // await processNoneData(loanQueries.updateOfferLetter, [ loanApplicationDetails.loan_id, user.user_id, offerLetterData.Location.trim() ]);
      // await processNoneData(loanQueries.updateOfferLetter, [ loanApplicationDetails.loan_id, user.user_id ]);
      // const returnData = await LoanPayload.loanApplicationApprovalDecisionResponse(
      //   data, totalAmountRepayable, totalInterestAmount, user, updatedLoanDetails.status, 'APPROVED', offerLetterData.Location.trim());
      userActivityTracking(req.user.user_id, 37, 'success');
      userActivityTracking(req.user.user_id, 39, 'success');
      // return ApiResponse.success(res, enums.LOAN_APPLICATION_APPROVED_DECISION, enums.HTTP_OK, returnData);
      return next();
    }
  } catch (error) {
    userActivityTracking(req.user.user_id, 18, 'fail');
    error.label = enums.CHECK_USER_TICKET_LOAN_ELIGIBILITY_CONTROLLER;
    logger.error(`checking user ticket loan application eligibility failed::${enums.CHECK_USER_TICKET_LOAN_ELIGIBILITY_CONTROLLER}`, error.message);
    return next(error);
  }
};

export const ticketPurchaseUpdate = async(req, res, next) => {
  try {
    const ticket_id = req.query.ticket_id;
    const user_id = req.query.user_id;
    await processOneOrNoneData(adminShopQueries.updateEventStatus,
      [ user_id, ticket_id ]);
    const data = {};
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user_id}:::Info: payment successful, ticket status updated for user shopCategories.ticketPurchaseUpdate.shop.js`);
    return ApiResponse.success(res, enums.EVENT_RECORD_UPDATED_AFTER_SUCCESSFUL_PAYMENT(user_id), enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.EVENT_PAYMENT_UNSUCCESSFUL;
    logger.error(`Failed to purchase event ticket successful:::${enums.FAILED_TO_PAY_FOR_TICKET}`, error.label);
    return next(error);
  }
};
// after payment successful
// change the status of the ticket
// send email notifications to recipients

// there will be a requery endpoint that'll be called on the web







