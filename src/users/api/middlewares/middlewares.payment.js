import crypto from 'crypto';
import ApiResponse from '../../lib/http/lib.http.responses';
import config from '../../config';
import enums from '../../lib/enums';
import paymentQueries from '../queries/queries.payment';
import userQueries from '../queries/queries.user';
import { processAnyData, processOneOrNoneData} from '../services/services.db';
import { confirmPaystackPaymentStatusByReference, raiseARefundTickedForCardTokenizationTransaction } from '../services/service.paystack';
import PaymentPayload from '../../lib/payloads/lib.payload.payment';
import * as Hash from '../../lib/utils/lib.util.hash';
import dayjs from 'dayjs';
import MailService from '../services/services.email';
import { sendPushNotification } from '../services/services.firebase';
import * as PushNotifications from '../../lib/templates/pushNotification';
import { userActivityTracking } from '../../lib/monitor';

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
    if(config.SEEDFI_NODE_ENV === 'test') {
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
      if (result.data.status !== 'success') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, Info: transaction was not successful verifyPaystackPaymentStatus.middlewares.payment.js`);
        await processAnyData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'fail' ]);
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
    const { body } = req;
    if (body.event === 'charge.success' || body.event.includes('refund')) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the webhook event sent is ${body.event} verifyTransactionPaymentRecord.middlewares.payment.js`);
      const [ paymentRecord ] = await processAnyData(paymentQueries.fetchTransactionByReference, [ body.data.reference || body.data.transaction_reference ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: payment record fetched from DB using reference verifyTransactionPaymentRecord.middlewares.payment.js`);
      if (!paymentRecord) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, Info: payment record not existing in the DB verifyTransactionPaymentRecord.middlewares.payment.js`);
        return ApiResponse.error(res, enums.PAYMENT_RECORD_NOT_FOUND, enums.HTTP_OK, enums.VERIFY_TRANSACTION_PAYMENT_RECORD_MIDDLEWARE);
      }
      if (body.event.includes('refund')) {
        if (!paymentRecord.is_initiated_refund) {
          logger.info(`${enums.CURRENT_TIME_STAMP}, Info: refund not initiated for payment record in the DB verifyTransactionPaymentRecord.middlewares.payment.js`);
          return ApiResponse.error(res, enums.REFUND_NOT_INITIATED_FOR_PAYMENT_TRANSACTION, enums.HTTP_OK, enums.VERIFY_TRANSACTION_PAYMENT_RECORD_MIDDLEWARE);
        }
        req.paymentRecord = paymentRecord;
        return next();
      }
      if (paymentRecord.payment_status !== 'pending') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, Info: payment record previously updated in the DB verifyTransactionPaymentRecord.middlewares.payment.js`);
        return ApiResponse.error(res, enums.PAYMENT_EARLIER_RECORDED, enums.HTTP_OK, enums.VERIFY_TRANSACTION_PAYMENT_RECORD_MIDDLEWARE);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, Info: payment record exists and status still pending in the DB verifyTransactionPaymentRecord.middlewares.payment.js`);
      req.paymentRecord = paymentRecord;
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
  const { body, paymentRecord } = req;
  try {
    if (body.event === 'refund.failed' || body.event === 'refund.pending' || body.event === 'refund.processed' || body.event === 'refund.processing') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event} handleTransactionRefundResponse.middlewares.payment.js`);
      if (body.data.status === 'processed') {
        await processAnyData(paymentQueries.updateTransactionRefundStatus, [ body.data.transaction_reference, 'success', body.data.refund_reference, true ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment refund success status updated in the DB using reference handleTransactionRefundResponse.middlewares.payment.js`);
        userActivityTracking(paymentRecord.user_id, 33, 'success');
        return ApiResponse.success(res, enums.REFUND_STATUS_SAVED('processed'), enums.HTTP_OK);
      }
      if (body.data.status === 'failed') {
        await processAnyData(paymentQueries.updateTransactionRefundStatus, [ body.data.transaction_reference, 'fail', body.data.refund_reference, false ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment refund failed status updated in the DB using reference handleTransactionRefundResponse.middlewares.payment.js`);
        userActivityTracking(paymentRecord.user_id, 33, 'fail');
        return ApiResponse.success(res, enums.REFUND_STATUS_SAVED('failed'), enums.HTTP_OK);
      }
      await processAnyData(paymentQueries.updateTransactionRefundStatus, [ body.data.transaction_reference, 'pending', null, false ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment refund pending status updated in the DB using reference handleTransactionRefundResponse.middlewares.payment.js`);
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
      return next();
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
    const { body, paymentRecord} = req;
    if (body.event === 'charge.success') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event} saveCardAuth.middlewares.payment.js`);
      const checkIfCardPreviouslyUsedPayload = PaymentPayload.checkCardSavedPayload(paymentRecord, body);
      const [ cardPreviouslySaved ] = await processAnyData(paymentQueries.checkIfCardPreviouslySaved, checkIfCardPreviouslyUsedPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if card previously saved saveCardAuth.middlewares.payment.js`);
      if(paymentRecord.payment_type === 'card_tokenization' && dayjs().format(`${body.data.authorization.exp_year}-${body.data.authorization.exp_month}-01`) <= dayjs().add(3, 'Month').format('YYYY-MM-01')){
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully confirms card will expire in 3 months time saveCardAuth.middlewares.payment.js`);
        const user = await processOneOrNoneData(userQueries.getUserByUserId, paymentRecord.user_id);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully fetched user from the DB saveCardAuth.middlewares.payment.js`);
        const data = {
          firstName: user.first_name,
          email: user.email
        };
        MailService('Rejected Debit Card', 'rejectedDebitCard', { ...data });
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully sends mail to the user saveCardAuth.middlewares.payment.js`);
        await sendPushNotification(user.user_id, PushNotifications.rejectDebitCard, user.fcm_token);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully sends push notification to the user saveCardAuth.middlewares.payment.js`);
        return next();
      }
      if (cardPreviouslySaved) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: card previously saved about to update card auth token saveCardAuth.middlewares.payment.js`);
        await processAnyData(paymentQueries.updateUserCardAuthToken, [ ...checkIfCardPreviouslyUsedPayload, encodeURIComponent(await Hash.encrypt(body.data.authorization.authorization_code.trim())) ]);
        return ApiResponse.success(res, enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: card not previously saved saveCardAuth.middlewares.payment.js`);
      const [ userCardExists ] = await processAnyData(paymentQueries.fetchUserSavedCard, [ paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if user has previously tokenized any card saveCardAuth.middlewares.payment.js`);
      const isDefaultCardChoice =  !userCardExists ? true : false;
      const saveCardPayload = await PaymentPayload.saveDebitCardPayload(paymentRecord, body, isDefaultCardChoice);
      await processAnyData(paymentQueries.saveCardDetails, saveCardPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: tokenized card details saved successfully saveCardAuth.middlewares.payment.js`);
      if (paymentRecord.payment_type === 'card_tokenization') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment record is of card tokenization type and should ne refunded saveCardAuth.middlewares.payment.js`);
        return next();
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment record is not of card tokenization type saveCardAuth.middlewares.payment.js`);
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
    const { body, paymentRecord } = req;
    if (body.event === 'charge.success' && paymentRecord.payment_type === 'card_tokenization') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event} raiseRefundForCardTokenization.middlewares.payment.js`);
      const result = await raiseARefundTickedForCardTokenizationTransaction(body.data.id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: raiding refund request via paystack returned response raiseRefundForCardTokenization.middlewares.payment.js`);
      if (result.message.toLowerCase() === 'refund has been queued for processing') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: refund successfully initiated raiseRefundForCardTokenization.middlewares.payment.js`);
        await processAnyData(paymentQueries.updateTransactionIsInitiatedRefund, [ body.data.reference ]);
        return ApiResponse.success(res, enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: refund could not be initiated raiseRefundForCardTokenization.middlewares.payment.js`);
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
