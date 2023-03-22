import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import ApiResponse from '../../lib/http/lib.http.responses';
import config from '../../config';
import enums from '../../lib/enums';
import paymentQueries from '../queries/queries.payment';
import userQueries from '../queries/queries.user';
import loanQueries from '../queries/queries.loan';
import { processAnyData, processOneOrNoneData} from '../services/services.db';
import { confirmPaystackPaymentStatusByReference, initiateTransfer, raiseARefundTickedForCardTokenizationTransaction } from '../services/service.paystack';
import PaymentPayload from '../../lib/payloads/lib.payload.payment';
import * as Hash from '../../lib/utils/lib.util.hash';
import MailService from '../services/services.email';
import { sendPushNotification, sendUserPersonalNotification } from '../services/services.firebase';
import * as PushNotifications from '../../lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates/personalNotification';
import { userActivityTracking } from '../../lib/monitor';
import { generateLoanRepaymentSchedule } from '../../lib/utils/lib.util.helpers';

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
      const user = await processOneOrNoneData(userQueries.getUserByUserId, paymentRecord.user_id);
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event} handleTransactionRefundResponse.middlewares.payment.js`);
      if (body.data.status === 'processed') {
        await processAnyData(paymentQueries.updateTransactionRefundStatus, [ body.data.transaction_reference, 'success', body.data.refund_reference, true ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment refund success status updated in the DB using reference 
        handleTransactionRefundResponse.middlewares.payment.js`);
        sendUserPersonalNotification(user, 'Card Tokenization amount refund completed', 
          PersonalNotifications.cardTokenizationAmountRefundCompletelyProcessed(), 'card-tokenization-refund-processed', { });
        sendPushNotification(user.user_id, PushNotifications.cardTokenizationAmountRefundSuccessful, user.fcm_token);
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
        sendPushNotification(user.user_id, PushNotifications.cardTokenizationAmountRefundFailed, user.fcm_token);
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: payment was made through ${body.data.channel} updatePaymentHistoryStatus.middlewares.payment.js`);
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
      const checkIfCardPreviouslyUsedPayload = PaymentPayload.checkCardSavedPayload(paymentRecord, body);
      const [ cardPreviouslySaved ] = await processAnyData(paymentQueries.checkIfCardPreviouslySaved, checkIfCardPreviouslyUsedPayload);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if card previously saved saveCardAuth.middlewares.payment.js`);
      if (paymentRecord.payment_type === 'card_tokenization' && 
          dayjs().format(`${body.data.authorization.exp_year}-${body.data.authorization.exp_month}-01`) <= dayjs().add(3, 'Month').format('YYYY-MM-01')
      ) {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully confirms card will expire in 3 months time saveCardAuth.middlewares.payment.js`);
        const data = {
          firstName: user.first_name,
          email: user.email,
          last4Digits: body.data.authorization.last4,
          cardType: body.data.authorization.card_type
        };
        await MailService('Rejected Debit Card', 'rejectedDebitCard', { ...data });
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: successfully sends mail to the user saveCardAuth.middlewares.payment.js`);
        sendUserPersonalNotification(user, 'Card Tokenization fails', 
          PersonalNotifications.cardTokenizationFailedDueToCardExpiration(), 'failed-card-tokenization', { });
        sendPushNotification(user.user_id, PushNotifications.rejectDebitCard, user.fcm_token);
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
      sendUserPersonalNotification(user, 'Card Tokenization fails', 
        PersonalNotifications.cardTokenizedSuccessfully(), 'successful-card-tokenization', { });
      sendPushNotification(user.user_id, PushNotifications.cardTokenizationSuccessful, user.fcm_token);
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event} raiseRefundForCardTokenization.middlewares.payment.js`);
      const result = await raiseARefundTickedForCardTokenizationTransaction(body.data.id);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: raiding refund request via paystack returned response 
      raiseRefundForCardTokenization.middlewares.payment.js`);
      if (result.message.toLowerCase() === 'refund has been queued for processing') {
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: refund successfully initiated raiseRefundForCardTokenization.middlewares.payment.js`);
        await processAnyData(paymentQueries.updateTransactionIsInitiatedRefund, [ body.data.reference ]);
        sendUserPersonalNotification(user, 'Card Tokenization amount refund initiated', 
          PersonalNotifications.cardTokenizationAmountRefundInitiated(), 'successful-card-tokenization-refund-initiation', { });
        sendPushNotification(user.user_id, PushNotifications.cardTokenizationRefundInitiated, user.fcm_token);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: push and personal notifications sent to user 
        raiseRefundForCardTokenization.middlewares.payment.js`);
        return ApiResponse.success(res, enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
      }
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: refund could not be initiated raiseRefundForCardTokenization.middlewares.payment.js`);
      sendUserPersonalNotification(user, 'Card Tokenization amount refund failed to be initiated', 
        PersonalNotifications.cardTokenizationAmountRefundCouldNotBeInitiated(), 'failed-card-tokenization-refund-initiation', { });
      sendPushNotification(user.user_id, PushNotifications.cardTokenizationAmountRefundInitiationFailed, user.fcm_token);
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
 * process everything personal loan transfer related
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof PaymentMiddleware
 */
export const processPersonalLoanTransferPayments = async(req, res, next) => {
  try {
    const { body, paymentRecord } = req;
    if (body.event.includes('transfer') && paymentRecord.payment_type === 'personal_loan_disbursement') {
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
            schedule.post_payment_outstanding_amount, schedule.proposed_payment_date
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
        const [ userDetails ] = await processAnyData(userQueries.getUserByUserId, [ paymentRecord.user_id ]);
        const data = await PaymentPayload.loanDisbursementPayload(userDetails, loanDetails);
        await MailService('Loan Application Successful', 'loanDisbursement', { ...data });
        sendUserPersonalNotification(userDetails, 'Loan disbursement successful', 
          PersonalNotifications.loanDisbursementSuccessful({ amount: parseFloat(paymentRecord.amount) }), 'successful-disbursement', { });
        sendPushNotification(userDetails.user_id, PushNotifications.successfulLoanDisbursement, userDetails.fcm_token);
        userActivityTracking(paymentRecord.user_id, 42, 'success');
        return ApiResponse.success(res, enums.BANK_TRANSFER_SUCCESS_STATUS_RECORDED, enums.HTTP_OK);
      }
      if (body.event === 'transfer.failed') {
        const loanDisbursementTrackingPayload = await PaymentPayload.trackLoanDisbursement(body, paymentRecord, loanDetails, 'fail');
        await Promise.all([
          processOneOrNoneData(loanQueries.updateLoanDisbursementTable, loanDisbursementTrackingPayload),
          processOneOrNoneData(paymentQueries.updateTransactionPaymentStatus, [ body.data.reference, body.data.id, 'pending' ])
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
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the webhook event sent is ${body.event} processPersonalLoanRepayments.middlewares.payment.js`);
      const [ loanDetails ] = await processAnyData(loanQueries.fetchUserLoanDetailsByLoanId, [ paymentRecord.loan_id, paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: the loan details fetched successfully processPersonalLoanRepayments.middlewares.payment.js`);
      const [ checkIfUserOnClusterLoan ] = await processAnyData(loanQueries.checkUserOnClusterLoan, [ paymentRecord.user_id ]);
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: checked if user is on an active cluster loan 
      processPersonalLoanRepayments.middlewares.payment.js`);
      if (paymentRecord.payment_type === 'part_loan_repayment' || paymentRecord.payment_type === 'automatic_loan_repayment') {
        const [ nextRepayment ] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [ paymentRecord.loan_id, paymentRecord.user_id ]);
        const outstandingRepaymentCount = await processOneOrNoneData(loanQueries.existingUnpaidRepayments, [ paymentRecord.loan_id, paymentRecord.user_id ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: fetched next repayment details and the count for all outstanding repayments 
        processPersonalLoanRepayments.middlewares.payment.js`);
        const statusType = Number(outstandingRepaymentCount.count) > 1 ? 'ongoing' : 'completed';
        const activityType = Number(outstandingRepaymentCount.count) > 1 ? 70 : 72;
        const paymentDescriptionType = Number(outstandingRepaymentCount.count) > 1 ? 'part loan repayment' : 'full loan repayment';
        await Promise.all([
          processAnyData(loanQueries.updatePersonalLoanPaymentTable, [ paymentRecord.user_id, paymentRecord.loan_id, parseFloat(paymentRecord.amount), 'debit', 
            loanDetails.loan_reason, paymentDescriptionType, `paystack ${body.data.channel}` ]),
          processAnyData(loanQueries.updateNextLoanRepayment, [ nextRepayment.loan_repayment_id ]),
          processAnyData(loanQueries.updateLoanWithRepayment, [ paymentRecord.loan_id, paymentRecord.user_id, statusType, parseFloat(paymentRecord.amount) ])
        ]);
        logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: loan, loan repayment and payment details updated successfully 
        processPersonalLoanRepayments.middlewares.payment.js`);
        if (checkIfUserOnClusterLoan) {
          const statusChoice = checkIfUserOnClusterLoan.loan_status === 'active' ? 'active' : 'over due';
          processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, statusChoice ]);
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan status set to active processPersonalLoanRepayments.middlewares.payment.js`);
        }
        if (!checkIfUserOnClusterLoan) {
          const statusOption = statusType === 'ongoing' ? 'active' : 'inactive';
          processOneOrNoneData(loanQueries.updateUserLoanStatus, [ paymentRecord.user_id, statusOption ]);
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${paymentRecord.user_id}:::Info: user loan status set to active processPersonalLoanRepayments.middlewares.payment.js`);
        }
        await MailService('Successful loan repayment', 'successfulRepayment', 
          { ...user, amount_paid: parseFloat(paymentRecord.amount).toFixed(2), total_loan_amount: parseFloat(loanDetails.amount_requested).toFixed(2) });
        sendUserPersonalNotification(user, 'Part loan repayment successful', 
          PersonalNotifications.partLoanRepaymentSuccessful({ amount: parseFloat(paymentRecord.amount) }), 'successful-repayment', { });
        sendPushNotification(user.user_id, PushNotifications.successfulLoanRepayment, user.fcm_token);
        userActivityTracking(paymentRecord.user_id, activityType, 'success');
        return next();
      }
      await Promise.all([
        processAnyData(loanQueries.updatePersonalLoanPaymentTable, [ paymentRecord.user_id, paymentRecord.loan_id, parseFloat(paymentRecord.amount), 'debit', 
          loanDetails.loan_reason, 'full loan repayment', `paystack ${body.data.channel}` ]),
        processAnyData(loanQueries.updateAllLoanRepaymentOnFullPayment, [ paymentRecord.loan_id, paymentRecord.user_id ]),
        processAnyData(loanQueries.updateLoanWithRepayment, [ paymentRecord.loan_id, paymentRecord.user_id, 'completed', parseFloat(paymentRecord.amount) ])
      ]);
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
      await MailService('Successful loan repayment', 'successfulRepayment', 
        { ...user, amount_paid: parseFloat(paymentRecord.amount).toFixed(2), total_loan_amount: parseFloat(loanDetails.amount_requested).toFixed(2) });
      sendUserPersonalNotification(user, 'Full loan repayment successful', 
        PersonalNotifications.fullLoanRepaymentSuccessful({ amount: parseFloat(paymentRecord.amount) }), 'successful-repayment', { });
      sendPushNotification(user.user_id, PushNotifications.successfulLoanRepayment, user.fcm_token);
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
