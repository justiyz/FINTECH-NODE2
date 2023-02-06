import { v4 as uuidv4 } from 'uuid';
import paymentQueries from '../queries/queries.payment';
import { processAnyData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import { initializeCardPayment } from '../services/service.paystack';
import enums from '../../lib/enums';
import config from '../../config';
import { userActivityTracking } from '../../lib/monitor';

/**
 * initialize card tokenization payment
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the url to complete payment
 * @memberof PaymentController
 */
export const initializeCardTokenizationPayment = async (req, res, next) => {
  try {
    const { user } = req;
    const reference = uuidv4();
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment reference generated initializeCardTokenizationPayment.controllers.payment.js`);
    const tokenizingAmount = parseFloat(config.SEEDFI_CARD_TOKENIZING_AMOUNT);
    await processAnyData(paymentQueries.initializeCardPayment, [ user.user_id, tokenizingAmount, 'paystack', reference, 'card_tokenization'  ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment reference and amount saved in the DB initializeCardTokenizationPayment.controllers.payment.js`);
    const paystackAmountFormatting = parseFloat(tokenizingAmount) * 100; // Paystack requires amount to be in kobo for naira payment
    const result = await initializeCardPayment(user, paystackAmountFormatting, reference);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: payment initialize via paystack returns response initializeCardTokenizationPayment.controllers.payment.js`);
    if (result.status === true && result.message.trim().toLowerCase() === 'authorization url created') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: card payment via paystack initialized initializeCardTokenizationPayment.controllers.payment.js`);
      userActivityTracking(user.user_id, 32, 'success');
      return ApiResponse.success(res, result.message, enums.HTTP_OK, result.data );
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: card payment via paystack failed to be initialized initializeCardTokenizationPayment.controllers.payment.js`);
    userActivityTracking(user.user_id, 32, 'fail');
    return ApiResponse.error(res, result.message, enums.HTTP_UNPROCESSABLE_ENTITY, enums.INITIALIZE_CARD_TOKENIZATION_PAYMENT_CONTROLLER);
  } catch (error) {
    userActivityTracking(req.user.user_id, 32, 'fail');
    error.label = enums.INITIALIZE_CARD_TOKENIZATION_PAYMENT_CONTROLLER;
    logger.error(`initializing card tokenization payment failed::${enums.INITIALIZE_CARD_TOKENIZATION_PAYMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * final webhook response based on event type not catered for
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the url to complete payment
 * @memberof PaymentController
 */
export const finalWebhookResponse = async (req, res, next) => {
  try {
    const { user } = req;
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: webhook event type not catered for finalWebhookResponse.controllers.payment.js`);
    return ApiResponse.success(res, enums.PAYSTACK_WEBHOOK_EVENT_TYPE_NOT_CATERED_FOR, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.FINAL_WEBHOOK_RESPONSE_CONTROLLER;
    logger.error(`returning response to paystack for webhook response not catered for failed::${enums.FINAL_WEBHOOK_RESPONSE_CONTROLLER}`, error.message);
    return next(error);
  }
};
