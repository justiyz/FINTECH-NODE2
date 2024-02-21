import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import ApiResponse from '../../lib/http/lib.http.responses';
import config from '../../config';
import enums from '../../lib/enums';
import paymentQueries from '../queries/queries.payment';
import authQueries from '../queries/queries.auth';
import userQueries from '../queries/queries.user';
import loanQueries from '../queries/queries.loan';
import notificationQueries from '../queries/queries.notification';
import clusterQueries from '../queries/queries.cluster';
import { processAnyData, processOneOrNoneData} from '../services/services.db';
import { confirmPaystackPaymentStatusByReference, initiateTransfer, raiseARefundTickedForCardTokenizationTransaction } from '../services/service.paystack';
import PaymentPayload from '../../lib/payloads/lib.payload.payment';
import * as Hash from '../../lib/utils/lib.util.hash';
import MailService from '../services/services.email';
import { sendPushNotification, sendUserPersonalNotification, sendNotificationToAdmin, sendClusterNotification } from '../services/services.firebase';
import * as PushNotifications from '../../lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates/personalNotification';
import { userActivityTracking } from '../../lib/monitor';
import { generateLoanRepaymentSchedule, generateClusterLoanRepaymentSchedule } from '../../lib/utils/lib.util.helpers';
import * as adminNotification from '../../lib/templates/adminNotification';
import adminShopQueries from "../../../admins/api/queries/queries.shop";
import * as recovaService from '../services/services.recova';

import {RETRIEVE_TICKET_URL_FROM_DATABASE} from "../../lib/enums/lib.enum.labels";

/**
 * verify the legibility of the webhook response if from Paystack
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const paystackWebhookVerification = async(req, res, next) => {
  try {
    const secret = config.SEEDFI_PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully saved the hash generated using the secret into a variable "hash"
    and the secret key from the config into the variable "secret" paystackWebhookVerification.middlewares.payment.js`);
    if (!hash) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decodes that no hash is returned in
      the headers of the response paystackWebhookVerification.middlewares.payment.js`);
      return ApiResponse.error(res, enums.NO_AUTHORIZATION, enums.HTTP_FORBIDDEN, enums.PAYSTACK_WEBHOOK_VERIFICATION_MIDDLEWARE);
    }
    if (config.SEEDFI_NODE_ENV === 'test') {
      return next();
    }
    if (hash !== req.headers['x-paystack-signature']) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decodes that the paystack authorization token is
      invalid paystackWebhookVerification.middlewares.payment.js`);
      return ApiResponse.error(res, enums.INVALID_AUTHORIZATION, enums.HTTP_FORBIDDEN, enums.PAYSTACK_WEBHOOK_VERIFICATION_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully decodes that paystack authorization token is a valid one from
      paystack paystackWebhookVerification.middlewares.payment.js`);
    return next();
  } catch (error) {
    error.label = enums.PAYSTACK_WEBHOOK_VERIFICATION_MIDDLEWARE;
    logger.error(`verification of paystack webhook hash failed:::${enums.PAYSTACK_WEBHOOK_VERIFICATION_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * verify the transaction was successful
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const verifyPaystackPaymentStatus = async(req, res, next) => {
  try {
    const { body } = req;
    if (body.event === 'charge.success') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} verifyPaystackPaymentStatus.middlewares.payment.js`);
      const result = await confirmPaystackPaymentStatusByReference(body.data.reference);
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: verify transaction status response returned verifyPaystackPaymentStatus.middlewares.payment.js`);
      const user = await processOneOrNoneData(userQueries.getUserByEmail, [ body.data.customer.email.trim() ]);
      if (result.data.status !== 'success') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, Info: transaction was not successful verifyPaystackPaymentStatus.middlewares.payment.js`);
        await processAnyData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'fail' ]);
        await MailService('Failed Payment', 'failedChargePayment', {
          ...user,
          last4Digits: body.data.channel === 'card' ? body.data.authorization.last4 : 'N/A',
          cardType: body.data.channel === 'card' ? body.data.authorization.card_type : 'N/A',
          bank: body.data.authorization.bank
        });
        return ApiResponse.error(res, enums.NOT_SUCCESSFUL_TRANSACTION, enums.HTTP_OK, enums.VERIFY_PAYSTACK_PAYMENT_STATUS_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: transaction was successful verifyPaystackPaymentStatus.middlewares.payment.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} verifyPaystackPaymentStatus.middlewares.payment.js`);
    return next();
  } catch (error) {
    error.label = enums.VERIFY_PAYSTACK_PAYMENT_STATUS_MIDDLEWARE;
    logger.error(`verification of paystack transaction success status failed:::${enums.VERIFY_PAYSTACK_PAYMENT_STATUS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

export const getTicketUrls = async(req, res, next) => {
  try {
    let ticket_urls = 1;
  } catch (error) {
    error.label = enums.RETRIEVE_TICKET_URL_FROM_DATABASE;
    logger.error(`failed to get ticket urls from the database:::${enums.RETRIEVE_TICKET_URL_FROM_DATABASE}`, error.message);
    return next(error);
  }
};

export const ticketPurchaseUpdate = async(req, res, next) => {
  try {
    const { body : {ticket_id, user_id, reference }, user }  = req;
    const ticket_record = await processAnyData(adminShopQueries.getTicketByReference, [ reference, user_id, ticket_id ]);
    const ticketLoanRecord = await processOneOrNoneData(adminShopQueries.getTicketLoanOutstandingAmount, [ ticket_record[0].loan_id ]);
    // check if ticket is already active
    if(ticketLoanRecord.status === 'ongoing') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: Ticket purchase is already activated  ticketPurchaseUpdate.middlewares.payment.js`);
      req.ticket_already_active = true;
      return next();
    }
    const totalOutstandingAmount = parseFloat(ticketLoanRecord.total_outstanding_amount);
    let outstanding_amount = totalOutstandingAmount - (0.3 * totalOutstandingAmount);

    // update ticket loan status
    await processOneOrNoneData(loanQueries.updateTicketLoanStatus, [ ticket_record[0].loan_id, user_id, outstanding_amount ]);

    // update first repayment record
    const repaymentRecord = await processOneOrNoneData(loanQueries.updateFirstRepaymentRecordStatus, [ ticket_record[0].loan_id ]);
    // create first repayment record
    await processOneOrNoneData(loanQueries.updatePersonalLoanPaymentTable,
        [ user_id, repaymentRecord.loan_id, repaymentRecord.principal_payment, 'debit', 'ticket loan', 'part loan repayment', 'paystack' ]);
    // update event status
    await processAnyData(adminShopQueries.updateEventStatus, [ user_id, ticket_id, reference ]);

    // send notification email
    const ticketUrls = ticket_record.map(ticket => `<a href="${ticket.ticket_url}" style="text-decoration: underline; color: blue; cursor: pointer;">Click here for your ticket [].</a><br/>`).join('');
    const data = { first_name: user.first_name, email: user.email, ticket_urls: ticketUrls };
    await MailService('Ticket Information', 'eventBooking', { ...data });
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user_id}:::Info: loan record ${ticket_record[0].loan_id} now ongoing`);
    req.ticket_update = { ticket_record };
    // logger.info(`${enums.CURRENT_TIME_STAMP}, ${user_id}:::Info: payment successful loan status updated, ticket status updated for user shopCategories.ticketPurchaseUpdate.shop.js`);
    return next();
  } catch (error) {
    error.label = enums.EVENT_PAYMENT_UNSUCCESSFUL;
    logger.error(`Failed to purchase event ticket successful:::${enums.FAILED_TO_PAY_FOR_TICKET}`, error.label);
    return next(error);
  }
};

/**
 * verify the transaction record exists
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const verifyTransactionPaymentRecord = async(req, res, next) => {
  try {
    const { body, params } = req;
    if ((body.event && (body.event === 'charge.success' || body.event.includes('transfer') || body.event.includes('refund'))) || body.otp) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} verifyTransactionPaymentRecord.middlewares.payment.js`);
      const parameterTypes = body.otp ? params.reference_id : (body.data.reference || body.data.transaction_reference);
      const [ paymentRecord ] = await processAnyData(paymentQueries.fetchTransactionByReference, [ parameterTypes ]);

      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: payment record fetched from DB using reference verifyTransactionPaymentRecord.middlewares.payment.js`);
      if (!paymentRecord) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, Info: payment record not existing in the DB verifyTransactionPaymentRecord.middlewares.payment.js`);
        return ApiResponse.error(res, enums.PAYMENT_RECORD_NOT_FOUND, body.otp ? enums.HTTP_BAD_REQUEST : enums.HTTP_OK, enums.VERIFY_TRANSACTION_PAYMENT_RECORD_MIDDLEWARE);
      }
      const user = await processOneOrNoneData(userQueries.getUserByUserId, [ paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully fetched user from the DB verifyTransactionPaymentRecord.middlewares.payment.js`);
      if (body.event && body.event.includes('refund')) {
        if (!paymentRecord.is_initiated_refund) {
          logger.info(`${enums.CURRENT_TIME_STAMP}, Info: refund not initiated for payment record in the DB verifyTransactionPaymentRecord.middlewares.payment.js`);
          return ApiResponse.error(res, enums.REFUND_NOT_INITIATED_FOR_PAYMENT_TRANSACTION, enums.HTTP_OK, enums.VERIFY_TRANSACTION_PAYMENT_RECORD_MIDDLEWARE);
        }
        req.paymentRecord = paymentRecord;
        req.user = user;
        return next();
      }
      if (paymentRecord.payment_status !== 'pending') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, Info: payment record previously updated in the DB verifyTransactionPaymentRecord.middlewares.payment.js`);
        return ApiResponse.error(res, enums.PAYMENT_EARLIER_RECORDED, enums.HTTP_OK, enums.VERIFY_TRANSACTION_PAYMENT_RECORD_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: payment record exists and status still pending in the DB verifyTransactionPaymentRecord.middlewares.payment.js`);
      req.paymentRecord = paymentRecord;
      req.user = user;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} verifyTransactionPaymentRecord.middlewares.payment.js`);
    return next();
  } catch (error) {
    error.label = enums.VERIFY_TRANSACTION_PAYMENT_RECORD_MIDDLEWARE;
    logger.error(`verification paystack transaction existing in the DB failed:::${enums.VERIFY_TRANSACTION_PAYMENT_RECORD_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * handle refund webhook response
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const handleTransactionRefundResponse = async(req, res, next) => {
  const { body, paymentRecord, user } = req;
  try {
    if (body.event === 'refund.failed' || body.event === 'refund.pending' || body.event === 'refund.processed' || body.event === 'refund.processing') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event}
      handleTransactionRefundResponse.middlewares.payment.js`);
      if (body.data.status === 'processed') {
        await processAnyData(paymentQueries.updateTransactionRefundStatus, [ body.data.transaction_reference, 'success', body.data.refund_reference, true ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment refund success status updated in the DB using reference
        handleTransactionRefundResponse.middlewares.payment.js`);
        sendUserPersonalNotification(user, 'Card Tokenization amount refund completed',
          PersonalNotifications.cardTokenizationAmountRefundCompletelyProcessed(), 'card-tokenization-refund-processed', { });
        sendPushNotification(user.user_id, PushNotifications.cardTokenizationAmountRefundSuccessful(), user.fcm_token);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully sends push and personal notification to the user
        handleTransactionRefundResponse.middlewares.payment.js`);
        userActivityTracking(paymentRecord.user_id, 33, 'success');
        return ApiResponse.success(res, enums.REFUND_STATUS_SAVED('processed'), enums.HTTP_OK);
      }
      if (body.data.status === 'failed') {
        await processAnyData(paymentQueries.updateTransactionRefundStatus, [ body.data.transaction_reference, 'fail', body.data.refund_reference, false ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment refund failed status updated in the DB using reference
        handleTransactionRefundResponse.middlewares.payment.js`);
        sendUserPersonalNotification(user, 'Card Tokenization amount refund failed',
          PersonalNotifications.cardTokenizationAmountRefundProcessingFailed(), 'card-tokenization-refund-failed', { });
        sendPushNotification(user.user_id, PushNotifications.cardTokenizationAmountRefundFailed(), user.fcm_token);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully sends push and personal notification to the user
        handleTransactionRefundResponse.middlewares.payment.js`);
        userActivityTracking(paymentRecord.user_id, 33, 'fail');
        return ApiResponse.success(res, enums.REFUND_STATUS_SAVED('failed'), enums.HTTP_OK);
      }
      await processAnyData(paymentQueries.updateTransactionRefundStatus, [ body.data.transaction_reference, 'pending', null, false ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment refund pending status updated in the DB using reference
      handleTransactionRefundResponse.middlewares.payment.js`);
      return ApiResponse.success(res, enums.REFUND_STATUS_SAVED('pending'), enums.HTTP_OK);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} handleTransactionRefundResponse.middlewares.payment.js`);
    return next();
  } catch (error) {
    userActivityTracking(paymentRecord.user_id, 33, 'fail');
    error.label = enums.VERIFY_TRANSACTION_PAYMENT_RECORD_MIDDLEWARE;
    logger.error(`verification paystack transaction existing in the DB failed:::${enums.VERIFY_TRANSACTION_PAYMENT_RECORD_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * update payment success status
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const updatePaymentHistoryStatus = async(req, res, next) => {
  try {
    const { body, paymentRecord } = req;
    if (body.event === 'charge.success') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event} updatePaymentHistoryStatus.middlewares.payment.js`);
      await processAnyData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'success' ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment status updated successfully updatePaymentHistoryStatus.middlewares.payment.js`);
      if (body.data.channel === 'card') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment was made through debit card, so wants to proceed to save card auth details
        updatePaymentHistoryStatus.middlewares.payment.js`);
        return next();
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment was made through ${body.data.channel}
      updatePaymentHistoryStatus.middlewares.payment.js`);
      return ApiResponse.success(res, enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} updatePaymentHistoryStatus.middlewares.payment.js`);
    return next();
  } catch (error) {
    error.label = enums.UPDATE_PAYMENT_STATUS_HISTORY_MIDDLEWARE;
    logger.error(`updating transaction payment status in the DB failed:::${enums.UPDATE_PAYMENT_STATUS_HISTORY_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * save transaction card details
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const saveCardAuth = async(req, res, next) => {
  try {
    const { body, paymentRecord, user } = req;
    if (body.event === 'charge.success' && body.data.channel === 'card') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event} saveCardAuth.middlewares.payment.js`);
      const data = {
        first_name: user.first_name,
        email: user.email,
        last4Digits: body.data.authorization.last4,
        cardType: body.data.authorization.card_type
      };
      const checkIfCardPreviouslyUsedPayload = PaymentPayload.checkCardSavedPayload(paymentRecord, body);
      const [ cardPreviouslySaved ] = await processAnyData(paymentQueries.checkIfCardPreviouslySaved, checkIfCardPreviouslyUsedPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if card previously saved saveCardAuth.middlewares.payment.js`);
      if (paymentRecord.payment_type === 'card_tokenization' &&
          dayjs().format(`${body.data.authorization.exp_year}-${body.data.authorization.exp_month}-01`) <= dayjs().add(3, 'Month').format('YYYY-MM-01')
      ) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully confirms card will expire in 3 months time
        saveCardAuth.middlewares.payment.js`);
        await MailService('Rejected Debit Card', 'rejectedDebitCard', { ...data });
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully sends mail to the user saveCardAuth.middlewares.payment.js`);
        sendUserPersonalNotification(user, 'Card Tokenization fails',
          PersonalNotifications.cardTokenizationFailedDueToCardExpiration(), 'failed-card-tokenization', { });
        sendPushNotification(user.user_id, PushNotifications.rejectDebitCard(), user.fcm_token);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully sends push and personal notification to the user
        saveCardAuth.middlewares.payment.js`);
        return next();
      }
      if ((paymentRecord.payment_type === 'card_tokenization') && (body.data.authorization.account_name?.trim().length > 0) &&
        ((!body.data.authorization.account_name.trim().toLowerCase().includes(user.first_name.toLowerCase())) &&
        (!body.data.authorization.account_name.trim().toLowerCase().includes(user.last_name.toLowerCase())))) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully confirms that tokenized card does not bear user name
          saveCardAuth.middlewares.payment.js`);
        await MailService('Rejected Debit Card', 'rejectedDebitCardNotUsersCard', { ...data });
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully sends mail to the user saveCardAuth.middlewares.payment.js`);
        sendUserPersonalNotification(user, 'Card Tokenization fails',
          PersonalNotifications.cardTokenizationFailedDueToNotCardHolderName(), 'failed-card-tokenization', { });
        sendPushNotification(user.user_id, PushNotifications.rejectDebitCardNotUserCard(), user.fcm_token);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully sends push and personal notification to the user
        saveCardAuth.middlewares.payment.js`);
        return next();
      }
      if (cardPreviouslySaved) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: card previously saved about to update card auth token saveCardAuth.middlewares.payment.js`);
        await processAnyData(paymentQueries.updateUserCardAuthToken, [ ...checkIfCardPreviouslyUsedPayload,
          encodeURIComponent(await Hash.encrypt(body.data.authorization.authorization_code.trim())) ]);
        if (paymentRecord.payment_type === 'card_tokenization') {
          return next();
        }
        return ApiResponse.success(res, enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: card not previously saved saveCardAuth.middlewares.payment.js`);
      const [ userCardExists ] = await processAnyData(paymentQueries.fetchUserSavedCard, [ paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if user has previously tokenized any card saveCardAuth.middlewares.payment.js`);
      const isDefaultCardChoice =  !userCardExists ? true : false;
      const saveCardPayload = await PaymentPayload.saveDebitCardPayload(paymentRecord, body, isDefaultCardChoice);
      await processAnyData(paymentQueries.saveCardDetails, saveCardPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: tokenized card details saved successfully saveCardAuth.middlewares.payment.js`);
      sendUserPersonalNotification(user, 'Card Tokenization successful',
        PersonalNotifications.cardTokenizedSuccessfully(), 'successful-card-tokenization', { });
      sendPushNotification(user.user_id, PushNotifications.cardTokenizationSuccessful(), user.fcm_token);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully sends push and personal notification to the user
        saveCardAuth.middlewares.payment.js`);
      if (paymentRecord.payment_type === 'card_tokenization') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment record is of card tokenization type and should ne refunded
        saveCardAuth.middlewares.payment.js`);
        return next();
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment record is not of card tokenization type saveCardAuth.middlewares.payment.js`);
      return ApiResponse.success(res, enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
    }
    if (body.event === 'charge.success' && body.data.channel === 'bank') {
      return ApiResponse.success(res, enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} saveCardAuth.middlewares.payment.js`);
    return next();
  } catch (error) {
    error.label = enums.SAVE_CARD_AUTH_MIDDLEWARE;
    logger.error(`saving transaction card in the DB failed:::${enums.SAVE_CARD_AUTH_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * raise a refund request for card tokenization type
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const raiseRefundForCardTokenization = async(req, res, next) => {
  try {
    const { body, paymentRecord, user } = req;
    if (body.event === 'charge.success' && paymentRecord.payment_type === 'card_tokenization') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event}
      raiseRefundForCardTokenization.middlewares.payment.js`);
      const result = await raiseARefundTickedForCardTokenizationTransaction(body.data.id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: raiding refund request via paystack returned response
      raiseRefundForCardTokenization.middlewares.payment.js`);
      if (result.message.toLowerCase() === 'refund has been queued for processing') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: refund successfully initiated raiseRefundForCardTokenization.middlewares.payment.js`);
        await processAnyData(paymentQueries.updateTransactionIsInitiatedRefund, [ body.data.reference ]);
        sendUserPersonalNotification(user, 'Card Tokenization amount refund initiated',
          PersonalNotifications.cardTokenizationAmountRefundInitiated(), 'successful-card-tokenization-refund-initiation', { });
        sendPushNotification(user.user_id, PushNotifications.cardTokenizationRefundInitiated(), user.fcm_token);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: push and personal notifications sent to user
        raiseRefundForCardTokenization.middlewares.payment.js`);
        return ApiResponse.success(res, enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: refund could not be initiated raiseRefundForCardTokenization.middlewares.payment.js`);
      sendUserPersonalNotification(user, 'Card Tokenization amount refund failed to be initiated',
        PersonalNotifications.cardTokenizationAmountRefundCouldNotBeInitiated(), 'failed-card-tokenization-refund-initiation', { });
      sendPushNotification(user.user_id, PushNotifications.cardTokenizationAmountRefundInitiationFailed(), user.fcm_token);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: push and personal notifications sent to user
        raiseRefundForCardTokenization.middlewares.payment.js`);
      return ApiResponse.error(res, enums.TRANSACTION_REFUND_INITIATED_FAILED, enums.HTTP_OK, enums.RAISE_REFUND_FOR_CARD_TOKENIZATION_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} raiseRefundForCardTokenization.middlewares.payment.js`);
    return next();
  } catch (error) {
    error.label = enums.RAISE_REFUND_FOR_CARD_TOKENIZATION_MIDDLEWARE;
    logger.error(`raising refund for card tokenization transaction failed:::${enums.RAISE_REFUND_FOR_CARD_TOKENIZATION_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * processing of repayment and disbursement types of referrals
 * @param {Object} user - The details of the user processing loan disbursement/repayment.
 * @param {String} rewardDescription - The decryption of the referral reward point.
 * @param {Number} rewardPoint - The actual rewarding point.
 * @param {String} type - the type which could be disbursement or repayment.
 * @returns {object} - Returns to the loan repayment/disbursement processing flow
 * @memberof PaymentMiddleware
 */
const processUserRewardPointBonus = async(user, rewardDescription, rewardPoint, type) => {
  const [ userWasReferred ] = await processAnyData(authQueries.checkIfUserWasReferred, [ user.user_id ]);
  logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: check if user was referred to the platform returns
  processUserRewardPointBonus.middlewares.payment.js`);
  if (userWasReferred) {
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user was referred to the platform processUserRewardPointBonus.middlewares.payment.js`);
    const referenceUserDetails = await processOneOrNoneData(userQueries.getUserByUserId);
    // await processOneOrNoneData(authQueries.updateRewardPoints);
    // await processOneOrNoneData(authQueries.updateUserPoints);
    // sendUserPersonalNotification(referenceUserDetails, `${type} point`,
    //   PersonalNotifications.userEarnedRewardPointMessage(rewardPoint, type), 'point-rewards', {});
    // sendPushNotification(referenceUserDetails.user_id, PushNotifications.rewardPointPushNotification(rewardPoint, type), referenceUserDetails.fcm_token);
    const activityType = type === 'repayment' ? 104 : 103;
    userActivityTracking(referenceUserDetails.user_id, activityType, 'success');
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: referred user awarded referral reward point and notified
    processUserRewardPointBonus.middlewares.payment.js`);
  }
  logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user was not referred to the platform processUserRewardPointBonus.middlewares.payment.js`);
};

/**
 * process everything personal loan transfer related
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const processPersonalLoanTransferPayments = async(req, res, next) => {
  try {
    const { body, paymentRecord, user } = req;
    if (body.event.includes('transfer') && paymentRecord.payment_type === 'personal_loan_disbursement') {
      const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'loan application' ]);
      const [ loanDetails ] = await processAnyData(loanQueries.fetchUserLoanDetailsByLoanId, [ paymentRecord.loan_id, paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan details fetched using loan identity
      processPersonalLoanTransferPayments.middlewares.payment.js`);
      if (body.event === 'transfer.success') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event}
        processPersonalLoanTransferPayments.middlewares.payment.js`);
        const loanDisbursementTrackingPayload = await PaymentPayload.trackLoanDisbursement(body, paymentRecord, loanDetails, 'success');
        const loanPaymentTrackingPayload = await PaymentPayload.trackLoanPayment(paymentRecord, loanDetails);
        const repaymentSchedule = await generateLoanRepaymentSchedule(loanDetails, paymentRecord.user_id);
        repaymentSchedule.forEach(async(schedule) => {
          await processOneOrNoneData(loanQueries.updateDisbursedLoanRepaymentSchedule, [
              schedule.loan_id, schedule.user_id, schedule.repayment_order, schedule.principal_payment, schedule.interest_payment,
            schedule.fees, schedule.total_payment_amount, schedule.pre_payment_outstanding_amount,
            schedule.post_payment_outstanding_amount, schedule.proposed_payment_date, schedule.proposed_payment_date
          ]);
          return schedule;
        });
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan repayment schedule update successfully in the DB
        processPersonalLoanTransferPayments.middlewares.payment.js`);
        await Promise.all([
          processOneOrNoneData(loanQueries.updateLoanDisbursementTable, loanDisbursementTrackingPayload),
          processOneOrNoneData(loanQueries.updatePersonalLoanPaymentTable, loanPaymentTrackingPayload),
          processOneOrNoneData(loanQueries.updateActivatedLoanDetails, [ paymentRecord.loan_id ]),
          processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, 'active' ]),
          processOneOrNoneData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'success' ])
        ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan and payment statuses updated and recorded in the DB
        processPersonalLoanTransferPayments.middlewares.payment.js`);
        const rewardDetails = await processOneOrNoneData(authQueries.fetchGeneralRewardPointDetails, [ 'successful_loan_request_point' ]);
        const [ rewardRangeDetails ] = await processAnyData(authQueries.fetchLoanRequestPointDetailsBasedOnAmount,
          [ rewardDetails.reward_id, parseFloat(paymentRecord.amount) ]);
        const actualPoint = rewardRangeDetails.point;
        if (parseFloat(actualPoint) > 0) {
          processUserRewardPointBonus(user, 'Disbursement point', actualPoint, 'disbursement'); // process reward awarding, function is written above
        }
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if user has referral and settled referral rewards
        processPersonalLoanTransferPayments.middlewares.payment.js`);
        const [ userDetails ] = await processAnyData(userQueries.getUserByUserId, [ paymentRecord.user_id ]);
        const data = await PaymentPayload.loanDisbursementPayload(userDetails, loanDetails);
        await MailService('Loan Application Successful', 'loanDisbursement', { ...data });
        sendUserPersonalNotification(userDetails, 'Loan disbursement successful',
          PersonalNotifications.loanDisbursementSuccessful({ amount: parseFloat(paymentRecord.amount) }), 'successful-disbursement', { });
        sendPushNotification(userDetails.user_id, PushNotifications.successfulLoanDisbursement(), userDetails.fcm_token);
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Loan Disbursement', adminNotification.loanDisbursement(),
            [ `${user.first_name} ${user.last_name}` ], 'loan-disbursement');
        });
        userActivityTracking(paymentRecord.user_id, 42, 'success');
        return ApiResponse.success(res, enums.BANK_TRANSFER_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
      }
      if (body.event === 'transfer.failed') {
        const loanDisbursementTrackingPayload = await PaymentPayload.trackLoanDisbursement(body, paymentRecord, loanDetails, 'fail');
        await Promise.all([
          processOneOrNoneData(loanQueries.updateLoanDisbursementTable, loanDisbursementTrackingPayload),
          processOneOrNoneData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'fail' ])
        ]);
        const reference = uuidv4();
        await processAnyData(loanQueries.initializeBankTransferPayment, [ paymentRecord.user_id, loanDetails.amount_requested, 'paystack', reference,
          'personal_loan_disbursement', 'requested personal loan facility disbursement', paymentRecord.loan_id ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan payment re-initialized in the DB
        processPersonalLoanTransferPayments.middlewares.payment.js`);
        const result = await initiateTransfer(body.data.recipient.recipient_code, loanDetails, reference);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: transfer initiate via paystack returns response
        processPersonalLoanTransferPayments.middlewares.payment.js`);
        if (result.status === true && result.message === 'Transfer has been queued') {
          await processOneOrNoneData(loanQueries.updateProcessingLoanDetails, [ paymentRecord.loan_id ]);
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan details status set to processing in the DB
          processPersonalLoanTransferPayments.middlewares.payment.js`);
          userActivityTracking(paymentRecord.user_id, 45, 'success');
          userActivityTracking(paymentRecord.user_id, 44, 'success');
          return ApiResponse.success(res, enums.LOAN_APPLICATION_DISBURSEMENT_INITIATION_SUCCESSFUL, enums.HTTP_OK, { reference });
        }
      }
      if (body.event === 'transfer.reversed') {
        const loanDisbursementTrackingPayload = await PaymentPayload.trackLoanDisbursement(body, paymentRecord, loanDetails, 'reversed');
        await Promise.all([
          processOneOrNoneData(loanQueries.updateLoanDisbursementTable, loanDisbursementTrackingPayload),
          processOneOrNoneData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'fail' ])
        ]);
        userActivityTracking(paymentRecord.user_id, 46, 'success');
        return ApiResponse.success(res, enums.BANK_TRANSFER_REVERSED_PAYMENT_RECORDED, enums.HTTP_OK);
      }
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} processPersonalLoanTransferPayments.middlewares.payment.js`);
    return next();
  } catch (error) {
    error.label = enums.PROCESS_PERSONAL_LOAN_TRANSFER_PAYMENTS_MIDDLEWARE;
    logger.error(`processing transfer webhook responses failed:::${enums.PROCESS_PERSONAL_LOAN_TRANSFER_PAYMENTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * process everything personal loan repayment webhook response
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const processPersonalLoanRepayments = async(req, res, next) => {
  try {
    const { body, paymentRecord } = req;
    if (body.event === 'charge.success' &&
    (paymentRecord.payment_type === 'part_loan_repayment' ||
    paymentRecord.payment_type === 'full_loan_repayment') ||
    paymentRecord.payment_type === 'automatic_loan_repayment'
    ) {
      const [ user ] = await processAnyData(userQueries.getUserByUserId, [ paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event}
      processPersonalLoanRepayments.middlewares.payment.js`);
      const [ loanDetails ] = await processAnyData(loanQueries.fetchUserLoanDetailsByLoanId, [ paymentRecord.loan_id, paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the loan details fetched successfully processPersonalLoanRepayments.middlewares.payment.js`);
      const [ checkIfUserOnClusterLoan ] = await processAnyData(loanQueries.checkUserOnClusterLoan, [ paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if user is on an active cluster loan
      processPersonalLoanRepayments.middlewares.payment.js`);
      const [ loanMandateDetails ] = await processAnyData(loanQueries.fetchLoanMandateDetails, [ paymentRecord.loan_id]);

      if (paymentRecord.payment_type === 'part_loan_repayment' || paymentRecord.payment_type === 'automatic_loan_repayment') {
        const [ nextRepayment ] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [ paymentRecord.loan_id, paymentRecord.user_id ]);
        const outstandingRepaymentCount = await processOneOrNoneData(loanQueries.existingUnpaidRepayments, [ paymentRecord.loan_id, paymentRecord.user_id ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: fetched next repayment details and the count for all outstanding repayments
        processPersonalLoanRepayments.middlewares.payment.js`);


        let customRepaymentCompleted = paymentRecord.payment_type == 'part_loan_repayment' && parseFloat(paymentRecord.amount) >= parseFloat(nextRepayment.post_payment_outstanding_amount) ;


        customRepaymentCompleted =  parseFloat(paymentRecord.amount) == parseFloat(nextRepayment.total_payment_amount) ? true : customRepaymentCompleted;

        const statusType = Number(outstandingRepaymentCount.count) > 1 ? 'ongoing' : 'completed';

        console.log('customRepaymentCompleted', customRepaymentCompleted);
        console.log('paymentRecord.amount', parseFloat(paymentRecord.amount));
        console.log('nextRepayment.post_payment_outstanding_amount', parseFloat(nextRepayment.post_payment_outstanding_amount));
        console.log('nextRepayment.total_payment_amount', parseFloat(nextRepayment.total_payment_amount));

        logger.info(`${customRepaymentCompleted}:::Info: customRepaymentCompleted}`)
        logger.info(`${parseFloat(paymentRecord.amount)}:::Info: paymentRecord.amount}`)
        logger.info(`${parseFloat(nextRepayment.post_payment_outstanding_amount)}:::Info: nextRepayment.post_payment_outstanding_amount}`)
        logger.info(`${parseFloat(nextRepayment.total_payment_amount)}:::Info: nextRepayment.total_payment_amount}`)

        const activityType = Number(outstandingRepaymentCount.count) > 1 ? 70 : 72;
        const paymentDescriptionType = Number(outstandingRepaymentCount.count) > 1 ? 'part loan repayment' : 'full loan repayment';
        const completedAtType = statusType === 'completed' ? dayjs().format('YYYY-MM-DD HH:mm:ss') : null;
        await Promise.all([
          processAnyData(loanQueries.updatePersonalLoanPaymentTable, [ paymentRecord.user_id, paymentRecord.loan_id, parseFloat(paymentRecord.amount), 'debit',
            loanDetails.loan_reason, paymentDescriptionType, `paystack ${body.data.channel}` ]),
            customRepaymentCompleted ? processAnyData(loanQueries.updateNextLoanRepayment, [ nextRepayment.loan_repayment_id, parseFloat(paymentRecord.amount) ]) : processAnyData(loanQueries.updateNextLoanCustomRepayment, [ nextRepayment.loan_repayment_id, parseFloat(paymentRecord.amount) ]),
          processAnyData(loanQueries.updateLoanWithRepayment, [ paymentRecord.loan_id, paymentRecord.user_id, statusType, parseFloat(paymentRecord.amount), completedAtType ])
        ]);
        if(statusType == 'completed' && loanMandateDetails){
          await recovaService.cancelMandate(paymentRecord.loan_id)
        }
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan, loan repayment and payment details updated successfully
        processPersonalLoanRepayments.middlewares.payment.js`);
        if (checkIfUserOnClusterLoan) {
          const statusChoice = checkIfUserOnClusterLoan.loan_status === 'active' ? 'active' : 'over due';
          await processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, statusChoice ]);
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan status set to active processPersonalLoanRepayments.middlewares.payment.js`);
        }
        if (!checkIfUserOnClusterLoan) {
          const statusOption = statusType === 'ongoing' ? 'active' : 'inactive';
          await processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, statusOption]);
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan status set to active processPersonalLoanRepayments.middlewares.payment.js`);
        }
        await MailService('Successful loan repayment', 'successfulRepayment',
          { ...user, amount_paid: parseFloat(paymentRecord.amount).toFixed(2), total_loan_amount: parseFloat(loanDetails.total_repayment_amount).toFixed(2) });
        sendUserPersonalNotification(user, 'Part loan repayment successful',
          PersonalNotifications.partLoanRepaymentSuccessful({ amount: parseFloat(paymentRecord.amount) }), 'successful-repayment', { });
        sendPushNotification(user.user_id, PushNotifications.successfulLoanRepayment(), user.fcm_token);
        if (statusType === 'completed') {
          const rewardDetails = await processOneOrNoneData(authQueries.fetchGeneralRewardPointDetails, [ 'complete_loan_repayment_point' ]);
          const rewardPoint = parseFloat(rewardDetails.point);
          processUserRewardPointBonus(user, 'Repayment point', rewardPoint, 'repayment'); // process reward awarding, function is written above
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if user has referral and settled referral rewards
          processPersonalLoanRepayments.middlewares.payment.js`);
          sendUserPersonalNotification(user, 'Full loan repayment successful',
            PersonalNotifications.fullLoanRepaymentSuccessful({ amount: parseFloat(paymentRecord.amount) }), 'successful-repayment', { });
          await MailService('Loan successfully repaid', 'completedRepayment',
            { ...user, loan_reason: loanDetails.loan_reason, total_loan_amount: parseFloat(loanDetails.amount_requested).toFixed(2),
              loan_duration: (loanDetails.reschedule_loan_tenor_in_months || `${loanDetails.loan_tenor_in_months} months`), interest_rate: loanDetails.percentage_pricing_band,
              total_repayment: loanDetails.total_repayment_amount, monthly_repayment: loanDetails.monthly_repayment });
        }
        userActivityTracking(paymentRecord.user_id, activityType, 'success');
        return next();
      }


      await Promise.all([
        processAnyData(loanQueries.updatePersonalLoanPaymentTable, [ paymentRecord.user_id, paymentRecord.loan_id, parseFloat(paymentRecord.amount), 'debit',
          loanDetails.loan_reason, 'full loan repayment', `paystack ${body.data.channel}` ]),
        processAnyData(loanQueries.updateAllLoanRepaymentOnFullPayment, [ paymentRecord.loan_id, paymentRecord.user_id ]),
        processAnyData(loanQueries.updateLoanWithRepayment, [ paymentRecord.loan_id, paymentRecord.user_id, 'completed',
          parseFloat(paymentRecord.amount), dayjs().format('YYYY-MM-DD HH:mm:ss') ])
      ]);

      if(loanMandateDetails) await recovaService.cancelMandate(paymentRecord.loan_id);

      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan, loan repayment and payment details updated successfully
      processPersonalLoanRepayments.middlewares.payment.js`);
      if (!checkIfUserOnClusterLoan) {
        processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, 'inactive' ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan status set to inactive processPersonalLoanRepayments.middlewares.payment.js`);
      }
      if (checkIfUserOnClusterLoan) {
        const statusChoice = checkIfUserOnClusterLoan.loan_status === 'active' ? 'active' : 'over due';
        processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, statusChoice ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan status set to active processPersonalLoanRepayments.middlewares.payment.js`);
      }
      const rewardDetails = await processOneOrNoneData(authQueries.fetchGeneralRewardPointDetails, [ 'complete_loan_repayment_point' ]);
      const rewardPoint = parseFloat(rewardDetails.point);
      processUserRewardPointBonus(user, 'Repayment point', rewardPoint, 'repayment'); // process reward awarding, function is written above
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if user has referral and settled referral rewards
      processPersonalLoanRepayments.middlewares.payment.js`);
      await MailService('Successful loan repayment', 'successfulRepayment',
        { ...user, amount_paid: parseFloat(paymentRecord.amount).toFixed(2), total_loan_amount: parseFloat(loanDetails.total_repayment_amount).toFixed(2) });
      sendUserPersonalNotification(user, 'Full loan repayment successful',
        PersonalNotifications.fullLoanRepaymentSuccessful({ amount: parseFloat(paymentRecord.amount) }), 'successful-repayment', { });
      sendPushNotification(user.user_id, PushNotifications.successfulLoanRepayment(), user.fcm_token);
      await MailService('Loan successfully repaid', 'completedRepayment',
        { ...user, loan_reason: loanDetails.loan_reason, total_loan_amount: parseFloat(loanDetails.amount_requested).toFixed(2),
          loan_duration: (loanDetails.reschedule_loan_tenor_in_months || `${loanDetails.loan_tenor_in_months} months`), interest_rate: loanDetails.percentage_pricing_band,
          total_repayment: loanDetails.total_repayment_amount, monthly_repayment: loanDetails.monthly_repayment });
      userActivityTracking(paymentRecord.user_id, 72, 'success');
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} processPersonalLoanRepayments.middlewares.payment.js`);
    return next();
  } catch (error) {
    error.label = enums.PROCESS_PERSONAL_LOAN_REPAYMENTS_MIDDLEWARE;
    logger.error(`processing loan repayment webhook response failed:::${enums.PROCESS_PERSONAL_LOAN_REPAYMENTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * process everything cluster loan transfer related
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const processClusterLoanTransferPayments = async(req, res, next) => {
  try {
    const { body, paymentRecord } = req;
    if (body.event.includes('transfer') && paymentRecord.payment_type === 'cluster_loan_disbursement') {
      const [ generalClusterLoanDetails ] = await processAnyData(clusterQueries.fetchClusterLoanDetailsByLoanInitiator, [ paymentRecord.loan_id, paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: general cluster loan details fetched using loan identity
      processClusterLoanTransferPayments.middlewares.payment.js`);
      const qualifiedClusterMembers = await processAnyData(clusterQueries.fetchQualifiedClusterMemberLoanDetails, [ paymentRecord.loan_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: details of all cluster member loans fetched from the db
      processClusterLoanTransferPayments.middlewares.payment.js`);
      const [ cluster ] = await processAnyData(clusterQueries.checkIfClusterExists, [ generalClusterLoanDetails.cluster_id ]);
      if (body.event === 'transfer.success') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event}
        processClusterLoanTransferPayments.middlewares.payment.js`);
        const clusterTotalLoanObligation = await processOneOrNoneData(clusterQueries.totalClusterOutstandingLoanAmount, [ paymentRecord.loan_id ]);
        const clusterSchedules = [];
        await qualifiedClusterMembers.map(async(member) => {
          const clusterLoanDisbursementTrackingPayload = await PaymentPayload.trackClusterLoanDisbursement(body, member, paymentRecord, 'success');
          const clusterLoanPaymentTrackingPayload = await PaymentPayload.trackClusterLoanPayment(member);
          const repaymentSchedule = await generateClusterLoanRepaymentSchedule(member);
          clusterSchedules.push(...repaymentSchedule);
          await Promise.all([
            processOneOrNoneData(clusterQueries.updateClusterLoanDisbursementTable, clusterLoanDisbursementTrackingPayload),
            processOneOrNoneData(clusterQueries.updateClusterLoanPaymentTable, clusterLoanPaymentTrackingPayload),
            processOneOrNoneData(clusterQueries.updateClusterLoanStatus, [ member.user_id, member.cluster_id, 'active', member.total_outstanding_amount ]),
            processOneOrNoneData(loanQueries.updateUserLoanStatus, [ member.user_id, 'active' ])
          ]);
          return member;
        });
        await processAnyData(clusterQueries.updateActivatedClusterLoanDetails, [ paymentRecord.loan_id ]);
        await processAnyData(clusterQueries.updateActivatedGeneralLoanDetails, [ paymentRecord.loan_id ]);
        await processAnyData(clusterQueries.updateGeneralClusterLoanDetails, [ generalClusterLoanDetails.cluster_id,
          parseFloat(clusterTotalLoanObligation.cluster_total_outstanding_amount), parseFloat(generalClusterLoanDetails.total_amount_requested) ]);
        await processOneOrNoneData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'success' ]);
        await Promise.all([
          clusterSchedules.map(async(schedule) => {
            await processOneOrNoneData(clusterQueries.updateDisbursedClusterLoanRepaymentSchedule, Object.values(schedule));
            return schedule;
          })
        ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan and payment statuses updated and recorded in the DB
        processClusterLoanTransferPayments.middlewares.payment.js`);
        const rewardDetails = await processOneOrNoneData(authQueries.fetchGeneralRewardPointDetails, [ 'successful_loan_request_point' ]);
        await qualifiedClusterMembers.map(async(member) => {
          const [ rewardRangeDetails ] = await processAnyData(authQueries.fetchLoanRequestPointDetailsBasedOnAmount,
            [ rewardDetails.reward_id, parseFloat(member.amount_requested) ]);
          const actualPoint = rewardRangeDetails.point;
          if (parseFloat(actualPoint) > 0) {
            processUserRewardPointBonus(member, 'Disbursement point', actualPoint, 'disbursement'); // process reward awarding, function is written above
          }
          const [ userDetails ] = await processAnyData(userQueries.getUserByUserId, [ member.user_id ]);
          const data = await PaymentPayload.loanDisbursementPayload(userDetails, member);
          await MailService('Loan Application Successful', 'loanDisbursement', { ...data });
          sendUserPersonalNotification(userDetails, 'Loan disbursement successful',
            PersonalNotifications.loanDisbursementSuccessful({ amount: parseFloat(member.amount_requested) }), 'successful-disbursement', { });
          sendPushNotification(userDetails.user_id, PushNotifications.successfulLoanDisbursement(), userDetails.fcm_token);
        });
        sendClusterNotification(paymentRecord, cluster, { is_admin: true }, 'Cluster loan successfully disbursed',
          'loan-application-disbursed', { ...generalClusterLoanDetails });
        userActivityTracking(paymentRecord.user_id, 42, 'success');
        return ApiResponse.success(res, enums.BANK_TRANSFER_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
      }
      if (body.event === 'transfer.failed') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event}
        processClusterLoanTransferPayments.middlewares.payment.js`);
        await qualifiedClusterMembers.map(async(member) => {
          const clusterLoanDisbursementTrackingPayload = await PaymentPayload.trackClusterLoanDisbursement(body, member, paymentRecord, 'fail');
          await processOneOrNoneData(clusterQueries.updateClusterLoanDisbursementTable, clusterLoanDisbursementTrackingPayload);
        });
        await processOneOrNoneData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'fail' ]);
        const reference = uuidv4();
        await processAnyData(loanQueries.initializeBankTransferPayment, [ paymentRecord.user_id, generalClusterLoanDetails.total_amount_requested, 'paystack', reference,
          'cluster_loan_disbursement', 'requested cluster loan facility disbursement', paymentRecord.loan_id ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan payment re-initialized in the DB
        processClusterLoanTransferPayments.middlewares.payment.js`);
        const result = await initiateTransfer(body.data.recipient.recipient_code, { amount_requested: generalClusterLoanDetails.total_amount_requested }, reference);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: transfer initiate via paystack returns response
        processClusterLoanTransferPayments.middlewares.payment.js`);
        if (result.status === true && result.message === 'Transfer has been queued') {
          await processOneOrNoneData(loanQueries.updateProcessingLoanDetails, [ paymentRecord.loan_id ]);
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan details status set to processing in the DB
          processClusterLoanTransferPayments.middlewares.payment.js`);
          userActivityTracking(paymentRecord.user_id, 45, 'success');
          userActivityTracking(paymentRecord.user_id, 44, 'success');
          return ApiResponse.success(res, enums.LOAN_APPLICATION_DISBURSEMENT_INITIATION_SUCCESSFUL, enums.HTTP_OK, { reference });
        }
      }
      if (body.event === 'transfer.reversed') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event}
        processClusterLoanTransferPayments.middlewares.payment.js`);
        await qualifiedClusterMembers.map(async(member) => {
          const clusterLoanDisbursementTrackingPayload = await PaymentPayload.trackClusterLoanDisbursement(body, member, paymentRecord, 'reversed');
          await processOneOrNoneData(clusterQueries.updateClusterLoanDisbursementTable, clusterLoanDisbursementTrackingPayload);
        });
        await processOneOrNoneData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'fail' ]);
        userActivityTracking(paymentRecord.user_id, 46, 'success');
        return ApiResponse.success(res, enums.BANK_TRANSFER_REVERSED_PAYMENT_RECORDED, enums.HTTP_OK);
      }
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} processClusterLoanTransferPayments.middlewares.payment.js`);
    return next();
  } catch (error) {
    error.label = enums.PROCESS_CLUSTER_LOAN_TRANSFER_PAYMENTS_MIDDLEWARE;
    logger.error(`processing transfer webhook responses failed:::${enums.PROCESS_CLUSTER_LOAN_TRANSFER_PAYMENTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * process everything cluster loan repayment webhook response
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const processClusterLoanRepayments = async(req, res, next) => {
  try {
    const { body, paymentRecord } = req;
    if (body.event === 'charge.success' &&
    (paymentRecord.payment_type === 'part_cluster_loan_repayment' ||
    paymentRecord.payment_type === 'full_cluster_loan_repayment') ||
    paymentRecord.payment_type === 'automatic_cluster_loan_repayment'
    ) {
      const [ user ] = await processAnyData(userQueries.getUserByUserId, [ paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event}
      processClusterLoanRepayments.middlewares.payment.js`);
      const [ clusterLoanDetails ] = await processAnyData(clusterQueries.fetchClusterMemberLoanDetailsByLoanId, [ paymentRecord.loan_id, paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the cluster loan details fetched successfully
      processClusterLoanRepayments.middlewares.payment.js`);
      const [ checkIfUserOnPersonalLoan ] = await processAnyData(loanQueries.checkUserOnPersonalLoan, [ paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if user is on an active personal loan
      processClusterLoanRepayments.middlewares.payment.js`);
      const [ cluster ] = await processAnyData(clusterQueries.checkIfClusterExists, [ clusterLoanDetails.cluster_id ]);
      const isClusterAdmin = clusterLoanDetails.is_loan_initiator ? true : false;
      if (paymentRecord.payment_type === 'part_cluster_loan_repayment' || paymentRecord.payment_type === 'automatic_cluster_loan_repayment') {
        const [ nextClusterLoanRepayment ] = await processAnyData(clusterQueries.fetchClusterLoanNextRepaymentDetails, [ paymentRecord.loan_id, paymentRecord.user_id ]);
        const outstandingClusterLoanRepaymentCount = await processOneOrNoneData(clusterQueries.existingUnpaidClusterLoanRepayments,
            [ paymentRecord.loan_id, paymentRecord.user_id ]);
        const otherExistingOverDueRepayments = await processAnyData(clusterQueries.fetchOtherLoanOverDueRepayments ,
          [ clusterLoanDetails.loan_id, nextClusterLoanRepayment.loan_repayment_id ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: fetched next repayment details and the count for all outstanding cluster loan repayments
        processClusterLoanRepayments.middlewares.payment.js`);
        const statusType = Number(outstandingClusterLoanRepaymentCount.count) > 1 ? 'ongoing' : 'completed';
        const activityType = Number(outstandingClusterLoanRepaymentCount.count) > 1 ? 70 : 72;
        const paymentDescriptionType = Number(outstandingClusterLoanRepaymentCount.count) > 1 ? 'part cluster loan repayment' : 'full cluster loan repayment';
        const completedAtType = statusType === 'completed' ? dayjs().format('YYYY-MM-DD HH:mm:ss') : null;
        const clusterMemberLoanStatus = statusType === 'ongoing' ? 'active' : 'inactive';
        const clusterLoanStatus = otherExistingOverDueRepayments.length > 0 ? 'over due' : 'active';
        await Promise.all([
          processAnyData(clusterQueries.updateClusterLoanPaymentTable, [ paymentRecord.user_id, clusterLoanDetails.cluster_id, clusterLoanDetails.member_loan_id,
            clusterLoanDetails.loan_id, parseFloat(paymentRecord.amount), 'debit', `${clusterLoanDetails.cluster_name} cluster loan`, paymentDescriptionType,
            `paystack ${body.data.channel}` ]),
          processAnyData(clusterQueries.updateNextClusterLoanRepayment, [ nextClusterLoanRepayment.loan_repayment_id ]),
          processAnyData(clusterQueries.updateClusterLoanWithRepayment, [ clusterLoanDetails.member_loan_id, paymentRecord.user_id, statusType,
            parseFloat(paymentRecord.amount), completedAtType ]),
          processAnyData(clusterQueries.updateClusterMemberWithRepayment, [ clusterLoanDetails.cluster_id, paymentRecord.user_id, clusterMemberLoanStatus,
            parseFloat(paymentRecord.amount) ]),
          processAnyData(clusterQueries.updateGeneralClusterWithRepayment, [ clusterLoanDetails.cluster_id, parseFloat(paymentRecord.amount), clusterLoanStatus ])
        ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: cluster loan repayment and payment details updated successfully
        processClusterLoanRepayments.middlewares.payment.js`);
        if (checkIfUserOnPersonalLoan) {
          const statusChoice = checkIfUserOnPersonalLoan.status === 'ongoing' ? 'active' : 'over due';
          processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, statusChoice ]);
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan status set to active processClusterLoanRepayments.middlewares.payment.js`);
        }
        if (!checkIfUserOnPersonalLoan) {
          const statusOption = statusType === 'ongoing' ? 'active' : 'inactive';
          processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, statusOption ]);
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan status set to active processClusterLoanRepayments.middlewares.payment.js`);
        }
        const [ clusterRunningLoanMembersCount, clusterLoanMembersCompletedLoan ] = await Promise.all([
          processOneOrNoneData(clusterQueries.getCountOfRunningLoanClusterMembers, [ clusterLoanDetails.loan_id ]),
          processAnyData(clusterQueries.fetchClusterMembersCompletedLoanByClusterIs, [ clusterLoanDetails.loan_id ])
        ]);
        if (statusType === 'completed' && ((parseFloat(clusterLoanMembersCompletedLoan.length)) >= (parseFloat(clusterRunningLoanMembersCount.count)))) {
          await processOneOrNoneData(clusterQueries.updateGeneralLoanCompletedAt, [ clusterLoanDetails.loan_id ]);
          await processOneOrNoneData(clusterQueries.updateGeneralClustersStatus, [ clusterLoanDetails.cluster_id ]);
        }
        await MailService('Successful loan repayment', 'successfulRepayment',
          { ...user, amount_paid: parseFloat(paymentRecord.amount).toFixed(2), total_loan_amount: parseFloat(clusterLoanDetails.amount_requested).toFixed(2) });
        sendUserPersonalNotification(user, 'Part cluster loan repayment successful',
          PersonalNotifications.partLoanRepaymentSuccessful({ amount: parseFloat(paymentRecord.amount) }), 'successful-repayment', { });
        sendPushNotification(user.user_id, PushNotifications.successfulLoanRepayment(), user.fcm_token);
        sendClusterNotification(paymentRecord, cluster, { is_admin: isClusterAdmin }, `${user.first_name} ${user.last_name} repays part loan payment`,
          'cluster-loan-part-payment', { });
        if (statusType === 'completed') {
          const rewardDetails = await processOneOrNoneData(authQueries.fetchGeneralRewardPointDetails, [ 'complete_loan_repayment_point' ]);
          const rewardPoint = parseFloat(rewardDetails.point);
          processUserRewardPointBonus(user, 'Repayment point', rewardPoint, 'repayment'); // process reward awarding, function is written above
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if user has referral and settled referral rewards
          processClusterLoanRepayments.middlewares.payment.js`);
          sendUserPersonalNotification(user, 'Full cluster loan repayment successful',
            PersonalNotifications.fullLoanRepaymentSuccessful({ amount: parseFloat(paymentRecord.amount) }), 'successful-repayment', { });
          await MailService('Loan successfully repaid', 'completedRepayment',
            { ...user, loan_reason: `${clusterLoanDetails.cluster_name} cluster loan`, total_loan_amount: parseFloat(clusterLoanDetails.amount_requested).toFixed(2),
              loan_duration: (clusterLoanDetails.reschedule_loan_tenor_in_months || `${clusterLoanDetails.loan_tenor_in_months} months`),
              interest_rate: clusterLoanDetails.percentage_pricing_band, total_repayment: clusterLoanDetails.total_repayment_amount,
              monthly_repayment: clusterLoanDetails.monthly_repayment });
          sendClusterNotification(paymentRecord, cluster, { is_admin: isClusterAdmin }, `${user.first_name} ${user.last_name} repays full loan payment`,
            'cluster-loan-full-payment', { });
        }
        userActivityTracking(paymentRecord.user_id, activityType, 'success');
        return next();
      }
      const otherExistingOverDueRepayments = await processAnyData(clusterQueries.fetchOtherLoanOverDueRepayments ,
        [ clusterLoanDetails.loan_id, clusterLoanDetails.member_loan_id ]);
      const clusterLoanStatus = otherExistingOverDueRepayments.length > 0 ? 'over due' : 'active';
      await Promise.all([
        processAnyData(clusterQueries.updateClusterLoanPaymentTable, [ paymentRecord.user_id, clusterLoanDetails.cluster_id, clusterLoanDetails.member_loan_id,
          clusterLoanDetails.loan_id, parseFloat(paymentRecord.amount), 'debit', `${clusterLoanDetails.cluster_name} cluster loan`, 'full cluster loan repayment',
          `paystack ${body.data.channel}` ]),
        processAnyData(clusterQueries.updateAllClusterLoanRepaymentOnFullPayment, [ clusterLoanDetails.member_loan_id, paymentRecord.user_id ]),
        processAnyData(clusterQueries.updateClusterLoanWithRepayment, [ clusterLoanDetails.member_loan_id, paymentRecord.user_id, 'completed',
          parseFloat(paymentRecord.amount), dayjs().format('YYYY-MM-DD HH:mm:ss') ]),
        processAnyData(clusterQueries.updateClusterMemberWithRepayment, [ clusterLoanDetails.cluster_id, paymentRecord.user_id, 'inactive',
          parseFloat(paymentRecord.amount) ]),
        processAnyData(clusterQueries.updateGeneralClusterWithRepayment, [ clusterLoanDetails.cluster_id, parseFloat(paymentRecord.amount), clusterLoanStatus ])
      ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: cluster loan repayment and payment details updated successfully
      processClusterLoanRepayments.middlewares.payment.js`);
      if (!checkIfUserOnPersonalLoan) {
        processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, 'inactive' ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan status set to inactive processClusterLoanRepayments.middlewares.payment.js`);
      }
      if (checkIfUserOnPersonalLoan) {
        const statusChoice = checkIfUserOnPersonalLoan.status === 'ongoing' ? 'active' : checkIfUserOnPersonalLoan.status === 'over due'?  'over due' : 'inactive';
        processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, statusChoice ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan status set to active processClusterLoanRepayments.middlewares.payment.js`);
      }
      const [ clusterRunningLoanMembersCount ,clusterLoanMembersCompletedLoan ] = await Promise.all([
        processOneOrNoneData(clusterQueries.getCountOfRunningLoanClusterMembers, [ clusterLoanDetails.loan_id ]),
        processAnyData(clusterQueries.fetchClusterMembersCompletedLoanByClusterIs, [ clusterLoanDetails.loan_id ])
      ]);
      if ((parseFloat(clusterLoanMembersCompletedLoan.length)) >= parseFloat(clusterRunningLoanMembersCount.count)) {
        await processOneOrNoneData(clusterQueries.updateGeneralLoanCompletedAt, [ clusterLoanDetails.loan_id ]);
        await processOneOrNoneData(clusterQueries.updateGeneralClustersStatus, [ clusterLoanDetails.cluster_id ]);
      }
      const rewardDetails = await processOneOrNoneData(authQueries.fetchGeneralRewardPointDetails, [ 'complete_loan_repayment_point' ]);
      const rewardPoint = parseFloat(rewardDetails.point);
      processUserRewardPointBonus(user, 'Repayment point', rewardPoint, 'repayment'); // process reward awarding, function is written above
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if user has referral and settled referral rewards
      processClusterLoanRepayments.middlewares.payment.js`);
      await MailService('Successful loan repayment', 'successfulRepayment',
        { ...user, amount_paid: parseFloat(paymentRecord.amount).toFixed(2), total_loan_amount: parseFloat(clusterLoanDetails.amount_requested).toFixed(2) });
      sendUserPersonalNotification(user, 'Full loan repayment successful',
        PersonalNotifications.fullLoanRepaymentSuccessful({ amount: parseFloat(paymentRecord.amount) }), 'successful-repayment', { });
      sendPushNotification(user.user_id, PushNotifications.successfulLoanRepayment(), user.fcm_token);
      await MailService('Loan successfully repaid', 'completedRepayment',
        { ...user, loan_reason: `${clusterLoanDetails.cluster_name} cluster loan`, total_loan_amount: parseFloat(clusterLoanDetails.amount_requested).toFixed(2),
          loan_duration: (clusterLoanDetails.reschedule_loan_tenor_in_months || `${clusterLoanDetails.loan_tenor_in_months} months`),
          interest_rate: clusterLoanDetails.percentage_pricing_band, total_repayment: clusterLoanDetails.total_repayment_amount,
          monthly_repayment: clusterLoanDetails.monthly_repayment });
      sendClusterNotification(paymentRecord, cluster, { is_admin: isClusterAdmin }, `${user.first_name} ${user.last_name} repays full loan payment`,
        'cluster-loan-full-payment', { });
      userActivityTracking(paymentRecord.user_id, 72, 'success');
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} processClusterLoanRepayments.middlewares.payment.js`);
    return next();
  } catch (error) {
    error.label = enums.PROCESS_CLUSTER_LOAN_REPAYMENTS_MIDDLEWARE;
    logger.error(`processing cluster loan repayment webhook response failed:::${enums.PROCESS_CLUSTER_LOAN_REPAYMENTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};


export const processMerchantUserLoanTransferPayments = async(req, res, next) => {
  try {
    const { body, paymentRecord, user } = req;
    if (body.event.includes('transfer') && paymentRecord.payment_type === 'merchant_user_loan_disbursement') {
      logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: start processing merchant user loan transfer
      processMerchantUserLoanTransferPayments.middlewares.payment.js`);
      const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'loan application' ]);
      const [ loanDetails ] = await processAnyData(loanQueries.fetchUserLoanDetailsByLoanId, [ paymentRecord.loan_id, paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan details fetched using loan identity
      processMerchantUserLoanTransferPayments.middlewares.payment.js`);
      if (body.event === 'transfer.success') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event}
        processMerchantUserLoanTransferPayments.middlewares.payment.js`);
        const loanDisbursementTrackingPayload = await PaymentPayload.trackLoanDisbursement(body, paymentRecord, loanDetails, 'success');
        const loanPaymentTrackingPayload = await PaymentPayload.trackLoanPayment(paymentRecord, loanDetails);
        const repaymentSchedule = await generateLoanRepaymentSchedule(loanDetails, paymentRecord.user_id);
        repaymentSchedule.forEach(async(schedule) => {
          await processOneOrNoneData(loanQueries.updateDisbursedLoanRepaymentSchedule, [
              schedule.loan_id, schedule.user_id, schedule.repayment_order, schedule.principal_payment, schedule.interest_payment,
            schedule.fees, schedule.total_payment_amount, schedule.pre_payment_outstanding_amount,
            schedule.post_payment_outstanding_amount, schedule.proposed_payment_date, schedule.proposed_payment_date
          ]);
          return schedule;
        });
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan repayment schedule update successfully in the DB
        processMerchantUserLoanTransferPayments.middlewares.payment.js`);
        await Promise.all([
          processOneOrNoneData(loanQueries.updateLoanDisbursementTable, loanDisbursementTrackingPayload),
          processOneOrNoneData(loanQueries.updatePersonalLoanPaymentTable, loanPaymentTrackingPayload),
          processOneOrNoneData(loanQueries.updateActivatedLoanDetails, [ paymentRecord.loan_id ]),
          processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, 'active' ]),
          processOneOrNoneData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'success' ])
        ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan and payment statuses updated and recorded in the DB
        processMerchantUserLoanTransferPayments.middlewares.payment.js`);
        // const rewardDetails = await processOneOrNoneData(authQueries.fetchGeneralRewardPointDetails, [ 'successful_loan_request_point' ]);
        // const [ rewardRangeDetails ] = await processAnyData(authQueries.fetchLoanRequestPointDetailsBasedOnAmount,
        //   [ rewardDetails.reward_id, parseFloat(paymentRecord.amount) ]);
        // const actualPoint = rewardRangeDetails.point;
        // if (parseFloat(actualPoint) > 0) {
        //   processUserRewardPointBonus(user, 'Disbursement point', actualPoint, 'disbursement'); // process reward awarding, function is written above
        // }
        // logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if user has referral and settled referral rewards
        // processMerchantUserLoanTransferPayments.middlewares.payment.js`);
        const [ userDetails ] = await processAnyData(userQueries.getUserByUserId, [ paymentRecord.user_id ]);
        const data = await PaymentPayload.loanDisbursementPayload(userDetails, loanDetails);
        // await MailService('Loan Application Successful', 'loanDisbursement', { ...data });
        admins.map((admin) => {
          sendNotificationToAdmin(admin.admin_id, 'Loan Disbursement', adminNotification.loanDisbursement(),
            [ `${user.first_name} ${user.last_name}` ], 'loan-disbursement');
        });
        userActivityTracking(paymentRecord.user_id, 42, 'success');
        return ApiResponse.success(res, enums.BANK_TRANSFER_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
      }
      if (body.event === 'transfer.failed') {
        const loanDisbursementTrackingPayload = await PaymentPayload.trackLoanDisbursement(body, paymentRecord, loanDetails, 'fail');
        await Promise.all([
          processOneOrNoneData(loanQueries.updateLoanDisbursementTable, loanDisbursementTrackingPayload),
          processOneOrNoneData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'fail' ])
        ]);
        const reference = uuidv4();
        await processAnyData(loanQueries.initializeBankTransferPayment, [ paymentRecord.user_id, loanDetails.amount_requested, 'paystack', reference,
          'personal_loan_disbursement', 'requested personal loan facility disbursement', paymentRecord.loan_id ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan payment re-initialized in the DB
        processMerchantUserLoanTransferPayments.middlewares.payment.js`);
        const result = await initiateTransfer(body.data.recipient.recipient_code, loanDetails, reference);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: transfer initiate via paystack returns response
        processMerchantUserLoanTransferPayments.middlewares.payment.js`);
        if (result.status === true && result.message === 'Transfer has been queued') {
          await processOneOrNoneData(loanQueries.updateProcessingLoanDetails, [ paymentRecord.loan_id ]);
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan details status set to processing in the DB
          processMerchantUserLoanTransferPayments.middlewares.payment.js`);
          userActivityTracking(paymentRecord.user_id, 45, 'success');
          userActivityTracking(paymentRecord.user_id, 44, 'success');
          return ApiResponse.success(res, enums.LOAN_APPLICATION_DISBURSEMENT_INITIATION_SUCCESSFUL, enums.HTTP_OK, { reference });
        }
      }
      if (body.event === 'transfer.reversed') {
        const loanDisbursementTrackingPayload = await PaymentPayload.trackLoanDisbursement(body, paymentRecord, loanDetails, 'reversed');
        await Promise.all([
          processOneOrNoneData(loanQueries.updateLoanDisbursementTable, loanDisbursementTrackingPayload),
          processOneOrNoneData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'fail' ])
        ]);
        userActivityTracking(paymentRecord.user_id, 46, 'success');
        return ApiResponse.success(res, enums.BANK_TRANSFER_REVERSED_PAYMENT_RECORDED, enums.HTTP_OK);
      }
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} processMerchantUserLoanTransferPayments.middlewares.payment.js`);
    return next();
  } catch (error) {
    error.label = enums.PROCESS_PERSONAL_LOAN_TRANSFER_PAYMENTS_MIDDLEWARE;
    logger.error(`processing transfer webhook responses failed:::${enums.PROCESS_PERSONAL_LOAN_TRANSFER_PAYMENTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
