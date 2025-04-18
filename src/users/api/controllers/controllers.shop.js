import {processAnyData, processNoneData} from '../services/services.db';
import adminShopQueries from '../../../admins/api/queries/queries.shop';
import shopQueries from '../queries/queries.shop';
import ApiResponse from '../../lib/http/lib.http.responses';
import { createShopRepaymentSchedule } from '../../../admins/api/controllers/controllers.loan';
import {
  calculateAmountPlusPaystackTransactionCharge, initializeBankAccountChargeForLoanRepayment,
  initializeBankTransferPayment,
  initializeCardPayment, initializeDebitCarAuthChargeForLoanRepayment, initiateTransfer
} from '../services/service.paystack';
import enums from '../../lib/enums';
import {v4 as uuidv4} from 'uuid';
import {userActivityTracking} from '../../lib/monitor';
import {processOneOrNoneData} from '../../../admins/api/services/services.db';
import QRCode from 'qrcode';
import MailService from '../services/services.email';
import notificationQueries from '../queries/queries.notification';
import loanQueries from '../queries/queries.loan';
import LoanPayload from '../../lib/payloads/lib.payload.loan';
import { loanApplicationEligibilityCheck, loanApplicationEligibilityCheckV2 } from '../services/service.seedfiUnderwriting';
import { sendNotificationToAdmin } from '../services/services.firebase';
import * as adminNotification from '../../lib/templates/adminNotification';
import config from '../../config';
import { ticketPDFTemplate } from '../../lib/templates/offerLetter';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { uniqueID } from 'mocha/lib/utils';
import { cloudinary } from '../services/service.cloudinary';
import * as puppeteer from 'puppeteer';
import { chromium } from 'playwright';
const { SEEDFI_BANK_ACCOUNT_STATEMENT_PROCESSOR, SEEDFI_NODE_ENV, SEEDFI_SHOP_PERCENTAGE } = config;


export const shopCategories = async(req, res, next) => {
  try {
    const {user} = req;
    let shop_categories = await processAnyData(shopQueries.shopCategories, [ req.query.status ]);
    const data = {
      shop_categories
    };
    logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: shop details fetched successfully shopCategories.controller.shop.js`);
    return ApiResponse.success(res, enums.SHOP_CATEGORIES_LIST, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 109, 'fail');
    error.label = enums.FETCH_CATEGORY_LIST;
    logger.error(`failed to fetch shop categories list::${ enums.FETCH_CATEGORY_LIST }`, error.message);
    return next(error);
  }
};

export const fetchShopDetails = async(req, res, next) => {
  try {
    const {params: {shop_category_id}, user} = req;
    let shopDetails = await processAnyData(shopQueries.getShopDetails, [ shop_category_id ]);
    logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: shop details fetched successfully fetchShopDetails.controller.shop.js`);
    return ApiResponse.success(res, enums.SHOP_CATEGORY_EXIST, enums.HTTP_OK, shopDetails);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 110, 'fail');
    error.label = enums.FETCH_SINGLE_CATEGORY;
    logger.error(`failed to fetch shop single category::${ enums.FETCH_SINGLE_CATEGORY }`, error.message);
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
    const {user} = req;
    let tickets = await processAnyData(adminShopQueries.getAllEvents, [ req.body.status, req.query.ticket_id ]);
    for (const tick in tickets) {
      const [ least_ticket_priced_ticket ] = await processAnyData(adminShopQueries.getPriceOfLeastValueTicket, tickets[tick].ticket_id);
      tickets[tick].lowest_ticket_price = parseFloat(least_ticket_priced_ticket.ticket_price).toFixed(2);

      // if (typeof least_ticket_priced_ticket !== 'undefined') {
      //   tickets[tick].lowest_ticket_price = parseFloat(least_ticket_priced_ticket.ticket_price).toFixed(2);
      // } else {
      //   tickets[tick].lowest_ticket_price = 0;
      // }
    }
    const data = {
      'tickets': tickets
    };
    logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: tickets fetched successfully fetchTickets.controller.shop.js`);
    return ApiResponse.success(res, enums.TICKET_LIST, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 110, 'fail');
    error.label = enums.FETCH_ALL_TICKETS;
    logger.error(`failed to fetch shop single category::${ enums.FETCH_SINGLE_CATEGORY }`, error.message);
    return next(error);
  }
};

// fetch users tickets
export const fetchUserTickets = async(req, res, next) => {
  try {
    const {user} = req;
    const user_tickets = await fetchUserTicketsData(user.user_id, req.query.status);
    // separation of concerns for optimized reading
    for (const user_ticket of user_tickets) {
      await enrichUserTicketData(user_ticket);
    }

    logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: user tickets fetched successfully fetchUserTickets.controller.shop.js`);

    const data = {user_tickets};
    return ApiResponse.success(res, enums.FETCH_USER_TICKETS_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 111, 'fail');
    error.label = enums.FAILED_TO_FETCH_USER_TICKETS;
    logger.error(`failed to fetch shop single category::${ enums.FETCH_SINGLE_CATEGORY }`, error.message);
    return next(error);
  }
};

async function fetchUserTicketsData(userId, status) {
  return await processAnyData(shopQueries.getUserTickets, [ userId, status ]);
}

async function enrichUserTicketData(user_ticket) {
  const [ least_ticket_priced_ticket ] = await processAnyData(
    adminShopQueries.getPriceOfLeastValueTicket, user_ticket.ticket_id);
  const ticket_category = await processOneOrNoneData(
    adminShopQueries.getTicketCategoryTypeById, [ user_ticket.ticket_id, user_ticket.ticket_category_id ]);
  const {ticket_name, event_location, event_time, ticket_image_url, event_date} = await processOneOrNoneData(
    adminShopQueries.getCustomerTicketInformation, [ user_ticket.ticket_id, user_ticket.user_id ]);
    // console.log('least_ticket_priced_ticket: ', least_ticket_priced_ticket);

  // if (typeof least_ticket_priced_ticket[0] !== 'undefined') {
  user_ticket.ticket_name = ticket_name;
  user_ticket.event_location = event_location;
  user_ticket.event_time = event_time;
  user_ticket.ticket_image_url = ticket_image_url;
  user_ticket.event_date = event_date;
  user_ticket.lowest_ticket_price = parseFloat(least_ticket_priced_ticket.ticket_price).toFixed(2);
  user_ticket.ticket_category_type = ticket_category.ticket_category_type;
  // }

}
export const _fetchUserTickets = async(req, res, next) => {
  try {
    const {user} = req;
    const user_tickets = await processAnyData(
      shopQueries.getUserTickets, [ user.user_id, req.query.status ]);
    for (const tick in user_tickets) {
      const least_ticket_priced_ticket = await processAnyData(adminShopQueries.getPriceOfLeastValueTicket, user_tickets[tick].ticket_id);
      const ticket_category = await processOneOrNoneData(
        adminShopQueries.getTicketCategoryTypeById, [
          user_tickets[tick].ticket_id,
          user_tickets[tick].ticket_category_id ]
      );
      const {ticket_name, event_location, event_time} = await processOneOrNoneData(
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
    logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: user tickets fetched successfully fetchUserTickets.controller.shop.js`);
    const data = {
      user_tickets
    };
    return ApiResponse.success(res, enums.FETCH_USER_TICKETS_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 111, 'fail');
    error.label = enums.FAILED_TO_FETCH_USER_TICKETS;
    logger.error(`failed to fetch shop single category::${ enums.FETCH_SINGLE_CATEGORY }`, error.message);
    return next(error);
  }
};

export const fetchTicketCategories = async(req, res, next) => {
  try {
    const ticket_categories = await processAnyData(shopQueries.getTicketCategories, req.params.ticket_id);
    const data = {
      'tickets': ticket_categories,
      'initial_payment_percentage': SEEDFI_SHOP_PERCENTAGE * 100,
      'ticket_with_least_price': await findTicketWithLowestPrice(ticket_categories) // ticket_with_least_price
    };
    logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ req.user.user_id }:::Info: user ticket categories fetched successfully fetchTicketCategories.controller.shop.js`);
    return ApiResponse.success(res, enums.FETCH_TICKET_CATEGORIES_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 112, 'fail');
    error.label = enums.FAILED_TO_FETCH_TICKET_CATEGORIES;
    logger.error(`failed to fetch ticket categories::${ enums.FAILED_TO_FETCH_USER_TICKETS }`);
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
      // const ticket_price = await processOneOrNoneData(shopQueries.)
    }

  } catch (error) {
    await userActivityTracking(req.user.user_id, 116, 'fail');
    error.label = enums.FAILED_TO_FETCH_TICKET_SUMMARY_STRING;
    logger.error(`failed to fetch ticket categories::${ enums.FAILED_TO_FETCH_TICKET_SUMMARY }`);
    return next(error);
  }
};

export const imageFromHtml = async(htmlContent) => {
  try {
    const tempDir = os.tmpdir();
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }
    // // Create a new page
    const browser = await puppeteer.launch(
      {
        headless: true,
        args: [
          '--disable-gpu',
          '--disable-dev-shm-usage',
          '--disable-setuid-sandbox',
          '--no-sandbox'
        ]
      }
    );
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    let uId = uniqueID();
    let outputpath = uId+'.jpg';
    const imagePath = path.join(tempDir, outputpath);

    await page.screenshot({ path: imagePath, type: 'jpeg' });

    await browser.close();
    return imagePath;

  } catch (error) {
    console.error('Error during Puppeteer operation:', error);
  }
};

export const imageFromHtml2 = async(htmlContent) => {
  try {
    let browser = await chromium.launch();
    let page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.setViewportSize({ width: 600, height: 800 });

    let uId = uniqueID();
    let outputPath = uId +'.jpg';
    const tempDir = os.tmpdir();
    const imagePath = path.join(tempDir, outputPath);
    await page.screenshot({ path: imagePath, type: 'jpeg' });
    await browser.close();

    return imagePath;
  } catch (error) {
    console.error('Error ImageFromHtml2 function during image QR Image generation operation:', error);
  }
};

export const generateTicketImage = async(ticket_id, ticket_category_id, user, ticket_qr_code) => {
  try {
    const [ ticketCategory, ticketRecord ] = await Promise.all([
      processOneOrNoneData(shopQueries.getBookedTicketCategory, [ ticket_category_id ]),
      processOneOrNoneData(shopQueries.getTicketInformation, [ ticket_id ])
    ]);
    const dateObject = new Date();
    const formattedDate = `${dateObject.toDateString()} ${dateObject.toTimeString().split(' ')[0]}`;

    const ticketHtmlPDF = await ticketPDFTemplate(ticket_qr_code, formattedDate, ticketCategory, user, ticketRecord);
    // use puppeteer to generate image from the html file
    const newlyGeneratedFile = await imageFromHtml2(ticketHtmlPDF);
    // generate ticket pdf
    const cloudinary_payload = await cloudinary.uploader.upload(newlyGeneratedFile);
    return cloudinary_payload.secure_url;
  } catch (error) {
    throw error; // Re-throw the error to propagate it up the call stack
    return ApiResponse.error(res, enums.LOAN_APPLICATION_DECLINED_DECISION, enums.HTTP_BAD_REQUEST, error);
  }

};

async function getAvailableTicketUnits(ticketCategoryId) {
  return await processOneOrNoneData(adminShopQueries.getTicketUnitsAvailable, ticketCategoryId);
}
export const createTicketSubscription = async(req, res, next) => {
  const tickets = req.body.tickets;
  const payment_channel = req.body.payment_channel;
  const reference = uuidv4();
  const activityType = payment_channel === 'card' ? 71: 73;
  // const ticketPurchaseLogs = [];
  let loan_id = req.body.initial_payment.loan_id;
  const { user, userDebitCard, accountDetails, userTransferRecipient, existingLoanApplication } = req;
  let totalAmountToBePaid = 0;
  try {
    // loop ticket id and check if number available is greater than the number being requested by the user
    for (const ticket of tickets) {
      const {ticket_id, ticket_category_id, units} = ticket;
      for (let ticketCounter = 1; ticketCounter <= units; ticketCounter++) {
        const barcodeString = `${ticket_id}|${req.user.user_id}|${req.user.first_name}|${req.user.last_name}|${ticketCounter}|${ticket_category_id}`;

        // logger.info(`User ticket QR Code successfully created. current total amount: ${totalAmountToBePaid}`);
        const theQRCode = await generateQRCode(barcodeString);
        // get available tickets from the database
        const availableTickets = await getAvailableTicketUnits(ticket_category_id);
        // generate ticket document
        let new_ticket_file_url = await generateTicketImage(ticket_id, ticket_category_id, user, theQRCode);
        // save booked ticket information in the database
        if (availableTickets && availableTickets.units >= units) {
          await createUserTicket(
            req.user.user_id, ticket_id, ticket_category_id, req.body.insurance_coverage,
            req.body.duration_in_months, theQRCode, reference, loan_id, new_ticket_file_url
          );
          totalAmountToBePaid = totalAmountToBePaid + (parseFloat(availableTickets.ticket_price * SEEDFI_SHOP_PERCENTAGE));
          // ticketPurchaseLogs.push(new_ticket_file_url);
          await updateAvailableTicketUnits(ticket_category_id, availableTickets.units - 1);
        }
        // TODO
        // add an "else" statement for handling cases where no available tickets.
      }
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${req.user.user_id}:::Total amount to be paid by user is N${totalAmountToBePaid}`);
    // changes started from here

    const paystackAmountFormatting = totalAmountToBePaid * 100;
    // const amountWithTransactionCharges = await calculateAmountPlusPaystackTransactionCharge(paystackAmountFormatting);

    // Muting Operation to initialize payment
    // const payment_operation = payment_channel === 'card' ?
    //   await initializeCardPayment(user, paystackAmountFormatting, reference) :
    //   await initializeBankTransferPayment(user, paystackAmountFormatting, reference);
    // const data = { 'total_amount': totalAmountToBePaid, 'payment': payment_operation };
    // logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ req.user.user_id }:::User tickets created successfully.`);
    // return ApiResponse.success(res, enums.CREATE_USER_TICKET_SUCCESSFULLY, enums.HTTP_OK, data);
    // operation to initiate charge

    const result = await initializeDebitCarAuthChargeForLoanRepayment(user, paystackAmountFormatting, reference, userDebitCard);

    // const result = payment_channel === 'card' ? await initializeDebitCarAuthChargeForLoanRepayment(user, paystackAmountFormatting, reference, userDebitCard) :
    //     await initializeBankAccountChargeForLoanRepayment(user, paystackAmountFormatting, reference, accountDetails);


    // console.log('paystack result: ', result);

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment initialize via paystack returns response
    createTicketSubscription.controllers.shop.js`);
    if (result.status === true && result.message.trim().toLowerCase() === 'charge attempted' && (result.data.status === 'success' || result.data.status === 'send_otp')) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack initialized initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
      await userActivityTracking(req.user.user_id, activityType, 'success');

      // disburse loan amount to ticket merchant//account
      await disburseTicketLoan(user, loan_id, userTransferRecipient, existingLoanApplication, next);

      return ApiResponse.success(
        res,
        result.message, enums.HTTP_OK,
        {
          user_id: user.user_id,
          amount: parseFloat(totalAmountToBePaid).toFixed(2),
          payment_type: 'part',
          payment_channel, reference: result.data.reference, status: result.data.status, display_text: result.data.display_text || ''
        });
    }
    if (result.response && result.response.status === 400) {
      await userActivityTracking(user.user_id, activityType, 'fail');
      return ApiResponse.error(res, result.response.data.message, enums.HTTP_BAD_REQUEST, enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack failed to be initialized
      initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
    await userActivityTracking(user.user_id, activityType, 'fail');
    return ApiResponse.error(res, result.message, enums.HTTP_SERVICE_UNAVAILABLE, enums.INITIATE_MANUAL_CARD_OR_BANK_LOAN_REPAYMENT_CONTROLLER);

  } catch (error) {
    await userActivityTracking(req.user.user_id, 113, 'fail');
    // error.label = enums.FAILED_TO_CREATE_TICKET_SUBSCRIPTION;
    await processAnyData(loanQueries.deleteInitiatedLoanApplicationPaymentSchedule, [ loan_id, user.user_id ]);
    await processNoneData(loanQueries.deleteInitiatedLoanApplication, [ loan_id, user.user_id ]);
    logger.error(`Failed to create ticket subscription: ${ error.message }`);
    return next(error);
  }
};

const disburseTicketLoan = async(user, loan_id, userTransferRecipient, existingLoanApplication, next) => {
  try {
    // const { user, params: { loan_id }, userTransferRecipient, existingLoanApplication } = req;
    const reference = uuidv4();
    await processAnyData(loanQueries.initializeBankTransferPayment, [ user.user_id, existingLoanApplication.amount_requested, 'paystack', reference,
      'personal_loan_disbursement', 'requested personal loan facility disbursement', loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan payment initialized in the DB initiateLoanDisbursement.controllers.loan.js`);
    const result = await initiateTransfer(userTransferRecipient, existingLoanApplication, reference);

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: transfer initiate via paystack returns response disburseTicketLoan.controllers.shop.js`);
    if (result.status === true && result.message === 'Transfer has been queued') {
      const updatedLoanDetails = await processOneOrNoneData(loanQueries.updateProcessingLoanDetails, [ loan_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan details status set to processing in the DB disburseTicketLoan.controllers.shop.js`);
      userActivityTracking(user.user_id, 44, 'success');
      return  { ...updatedLoanDetails , reference };
    }
    if (result.response.status === 400 && result.response.data.message === 'Your balance is not enough to fulfil this request') {
      const data = {
        email: config.SEEDFI_ADMIN_EMAIL_ADDRESS,
        currentBalance: 'Kindly login to confirm'
      };
      await AdminMailService('Insufficient Paystack Balance', 'insufficientBalance', { ...data });
    }
    if (result.response.data.message !== 'Your balance is not enough to fulfil this request') {
      userActivityTracking(user.user_id, 44, 'fail');
      throw new Error(result.response.data.message);
    }
    userActivityTracking(user.user_id, 44, 'fail');
    throw new Error(result.response.data.message);
  } catch (error) {
    userActivityTracking(user.user_id, 44, 'fail');
    error.label = enums.INITIATE_LOAN_DISBURSEMENT_CONTROLLER;
    logger.error(`updating activated loan application details failed::${enums.INITIATE_LOAN_DISBURSEMENT_CONTROLLER}`, error.message);
    throw new Error(error.message);
  }
};

async function generateQRCode(barcodeString) {
  // create and upload ticket
  return QRCode.toDataURL(barcodeString);
}

async function createUserTicket(userId, ticketId, ticketCategoryId, insuranceCoverage, paymentTenure, qrCode, reference, loan_id, ticket_url) {
  return await processOneOrNoneData(adminShopQueries.createUserTicketRecord, [
    userId,
    ticketId,
    ticketCategoryId,
    1,
    insuranceCoverage,
    paymentTenure,
    'inactive',
    qrCode,
    reference,
    loan_id,
    ticket_url
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
        logger.info(`generating ticket count ${ tickets[ticket].ticket_id }`);
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
        logger.info(`${ enums.CURRENT_TIME_STAMP },
        ${ req.user.user_id }
                :::Info: user ticket QR Code successfully created. createTicketSubscription.controller.shop.js`);
        // update available ticket units
        const reduceTicket = available_tickets.units - 1;  // tickets[ticket].units;
        const slate_array = [ tickets[ticket].ticket_category_id, reduceTicket ];
        await processOneOrNoneData(adminShopQueries.updateTicketUnitsAvailable, slate_array);
      }

    }
    logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ req.user.user_id }:::Info: user ticket created successfully createTicketSubscription.controller.shop.js`);
    return ApiResponse.success(res, enums.CREATE_USER_TICKET_SUCCESSFULLY, enums.HTTP_OK, ticket_purchase_logs);
  } catch (error) {
    await userActivityTracking(req.user.user_id, 113, 'fail');
    error.label = enums.FAILED_TO_CREATE_TICKET_SUBSCRIPTION;
    logger.error(`failed to fetch ticket categories::${ enums.FAILED_TO_CREATE_TICKET_SUBSCRIPTION }`);
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
    const content = `Your ticket for ${ ticket.ticket_name } has been booked on SeedFi!`;
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
  const content = `Your ticket for ${ ticket.ticket_name } has been booked on SeedFi!`;

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
    const { recipients, ticket_id, transaction_reference, reference } = req.body;
    // fetch the transaction record by transaction_reference
    // update the tickets connected to active
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

const getBookingTotalPrice = async(ticket_bookings) => {
  let booking_amount = 0;

  for (const ticket_record_id in ticket_bookings) {
    let unit_size = ticket_bookings[ticket_record_id].units;
    for (let counter = 0; counter < unit_size; counter += 1) {
      const ticket_information = await processOneOrNoneData(adminShopQueries.getEventAmountByEventIdAndEventCategoryId, [
        ticket_bookings[ticket_record_id].ticket_id,
        ticket_bookings[ticket_record_id].ticket_category_id
      ]);
      booking_amount = booking_amount + Number(ticket_information?.ticket_price);
    }
  }
  return booking_amount;
};
export const checkUserTicketLoanEligibility = async(req, res, next) => {
  try {
    const { user, body, userEmploymentDetails, userLoanDiscount, clusterType,
      userMinimumAllowableAMount, userMaximumAllowableAmount, previousLoanCount, maximumAmountForNoCreditHistoryDetails, params: {ticket_id} } = req;
    const userDefaultAccountDetails = await processOneOrNoneData(loanQueries.fetchBankAccountDetailsByUserId, user.user_id);
    const userMonoId = userDefaultAccountDetails.mono_account_id === null ? '' : userDefaultAccountDetails.mono_account_id;
    // calculate amount to be booked
    const booking_amount = await getBookingTotalPrice(req.body.tickets);
    const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'loan application' ]);

    logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: fetched user bvn from the db checkUserLoanEligibility.controllers.loan.js`);
    const userBvn = await processOneOrNoneData(loanQueries.fetchUserBvn, [ user.user_id ]);
    const [ userPreviouslyDefaulted ] = await processAnyData(loanQueries.checkIfUserHasPreviouslyDefaultedInLoanRepayment, [ user.user_id ]);
    const previouslyDefaultedCount = parseFloat(userPreviouslyDefaulted.count);
    logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: checked if user previously defaulted in loan repayment checkUserLoanEligibility.controllers.loan.js`);

    body.amount = booking_amount;
    body.loan_reason = 'event booking';
    body.bank_statement_service_choice = SEEDFI_BANK_ACCOUNT_STATEMENT_PROCESSOR;

    const loanApplicationDetails = await processOneOrNoneData(loanQueries.initiatePersonalLoanApplicationWithReturn,
      [ user.user_id, booking_amount, booking_amount, 'Ticket Loan', body.duration_in_months, body.duration_in_months, 0, 0 ]
    );

    req.params.loan_id = loanApplicationDetails.loan_id;

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: initiated loan application in the db checkUserLoanEligibility.controllers.loan.js`);
    let payload = await LoanPayload.checkUserEligibilityPayload(user, body, userDefaultAccountDetails, loanApplicationDetails, userEmploymentDetails, userBvn, userMonoId,
      userLoanDiscount, clusterType, userMinimumAllowableAMount, userMaximumAllowableAmount, previousLoanCount, previouslyDefaultedCount, maximumAmountForNoCreditHistoryDetails);
    const result = await loanApplicationEligibilityCheck(payload);

    if (result.status === 200 && result.statusText === 'OK') {
      const { data } = result;

      if (data.final_decision === 'APPROVED') {
        // if(data.max_approval < booking_amount) {
        //   logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: Applied for ${parseFloat(booking_amount).toFixed(2)}, elligible for ${parseFloat(data.max_approval).toFixed(2)}  checkUserLoanEligibility.controllers.loan.js`);
        //   return ApiResponse.error(res, `You're not eligible for the requested amount. Kindly try a lower amount`, 403, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
        // }
        const ticket = await processOneOrNoneData(shopQueries.getTicketInformation, [ ticket_id ]);

        logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: user loan eligibility status shows user is eligible for loan checkUserLoanEligibility.controllers.loan.js`);
        const initial_deposit = SEEDFI_SHOP_PERCENTAGE;
        const other_deposits = 1 - initial_deposit;
        const monthly_repayment = (booking_amount * other_deposits)/body.duration_in_months;
        const first_installment  = ((booking_amount * initial_deposit) + parseFloat(ticket.processing_fee)).toFixed(2);
        logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: user loan eligibility status passes and user is eligible for automatic loan approval checkUserLoanEligibility.controllers.loan.js`);
        data.monthly_repayment = monthly_repayment;
        const approvedDecisionPayload = LoanPayload.processShopLoanDecisionUpdatePayload(data, booking_amount, 0, 'approved');
        const updatedLoanDetails = await processOneOrNoneData(loanQueries.updateUserManualOrApprovedDecisionLoanApplication, approvedDecisionPayload);

        const loan_repayment_schedule = await createShopRepaymentSchedule(updatedLoanDetails, user, first_installment, monthly_repayment);
        body.initial_payment = loan_repayment_schedule[0];
        req.first_repayment = first_installment;

        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: latest loan details updated checkUserLoanEligibility.controllers.loan.js`);
        userActivityTracking(req.user.user_id, 37, 'success');
        userActivityTracking(req.user.user_id, 39, 'success');
        return next();
      }

      else if (data.final_decision === 'DECLINED') {
        await processAnyData(loanQueries.deleteInitiatedLoanApplicationPaymentSchedule, [ loanApplicationDetails.loan_id, user.user_id ]);
        await processNoneData(loanQueries.deleteInitiatedLoanApplication, [ loanApplicationDetails.loan_id, user.user_id ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan eligibility status shows user is not eligible for loan checkUserLoanEligibility.controllers.loan.js`);
        const declinedDecisionPayload = LoanPayload.processDeclinedLoanDecisionUpdatePayload(data);
        const updatedLoanDetails = await processOneOrNoneData(loanQueries.updateUserDeclinedDecisionLoanApplication, declinedDecisionPayload);
        userActivityTracking(req.user.user_id, 37, 'fail');
        userActivityTracking(req.user.user_id, 40, 'success');
        // Declined Loan Information update
        const returnData = await LoanPayload.loanApplicationDeclinedDecisionResponse(user, data, updatedLoanDetails, 'DECLINED');
        return ApiResponse.success(res, enums.LOAN_APPLICATION_DECLINED_DECISION, enums.HTTP_OK, returnData);
      }
    }

    else if (result.status >= 400 && result.status < 500) {
      logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }::: Info: returned response from underwriting is a 400 plus status checkUserLoanEligibility.controllers.loan.js`);
      await processNoneData(loanQueries.deleteInitiatedLoanApplication, [ loanApplicationDetails.loan_id, user.user_id ]);
      admins.map((admin) => {
        sendNotificationToAdmin(admin.admin_id, 'Failed Loan Application', adminNotification.loanApplicationDownTime(),
          [ `${ user.first_name } ${ user.last_name }` ], 'failed-loan-application');
      });
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.UNDERWRITING_SERVICE_FAILURE, enums.HTTP_BAD_REQUEST, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }

    else if (result.status >= 500) {
      logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: returned response from underwriting is of a 500 plus status
        checkUserLoanEligibility.controllers.loan.js`);
      await processNoneData(loanQueries.deleteInitiatedLoanApplication, [ loanApplicationDetails.loan_id, user.user_id ]);
      admins.map((admin) => {
        sendNotificationToAdmin(admin.admin_id, 'Failed Loan Application', adminNotification.loanApplicationDownTime(),
          [ `${ user.first_name } ${ user.last_name }` ], 'failed-loan-application');
      });
      userActivityTracking(req.user.user_id, 37, 'fail');
      return ApiResponse.error(res, enums.UNDERWRITING_SERVICE_NOT_AVAILABLE, enums.HTTP_SERVICE_UNAVAILABLE, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }


    else  {
      logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: user loan eligibility status check failed checkUserLoanEligibility.controllers.loan.js`);
      if (result.code === 'ECONNRESET')
      // if (result.data?.message === 'Service unavailable loan application can\'t be completed. Please try again later.'
      //     || result.response.data?.message === 'Service unavailable loan application can\'t be completed. Please try again later.')
      {
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Failed Loan Application', adminNotification.loanApplicationDownTime(),
            [ `${ user.first_name } ${ user.last_name }` ], 'failed-loan-application');
        });
      }
      logger.info(`${ enums.CURRENT_TIME_STAMP }, ${ user.user_id }:::Info: User initiated loan application deleted checkUserLoanEligibility.controllers.loan.js`);
      userActivityTracking(req.user.user_id, 37, 'fail');

      return ApiResponse.error(res, result.status, result.request.status, enums.CHECK_USER_LOAN_ELIGIBILITY_CONTROLLER);
    }


  } catch (error) {
    userActivityTracking(req.user.user_id, 18, 'fail');
    error.label = enums.CHECK_USER_TICKET_LOAN_ELIGIBILITY_CONTROLLER;
    logger.error(`checking user ticket loan application eligibility failed::${ enums.CHECK_USER_TICKET_LOAN_ELIGIBILITY_CONTROLLER }`, error.message);
    return next(error);
  }
};

export const ticketPurchaseUpdate = async(req, res, next) => {
  if (req.ticket_already_active) {
    return ApiResponse.error(res, enums.TICKET_ALREADY_ACTIVE, enums.HTTP_OK);
  }
  try {
    const { user_id } = req.body;
    let ticket_update = req.ticket_update;
    const data = { ticket_update };
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user_id}:::Info: payment successful, ticket status updated for user shopCategories.ticketPurchaseUpdate.shop.js`);
    return ApiResponse.success(res, enums.EVENT_RECORD_UPDATED_AFTER_SUCCESSFUL_PAYMENT(user_id), enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.EVENT_PAYMENT_UNSUCCESSFUL;
    logger.error(`Failed to purchase event ticket successful:::${ enums.FAILED_TO_PAY_FOR_TICKET }`, error.label);
    return next(error);
  }
};




