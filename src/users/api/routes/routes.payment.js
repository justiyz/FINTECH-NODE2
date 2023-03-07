import { Router } from 'express';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as PaymentController from '../controllers/controllers.payment';
import * as PaymentMiddleware from '../middlewares/middlewares.payment';
import * as UserMiddleware from '../middlewares/middlewares.user';

const router = Router();

router.get(
  '/initiate-card-tokenization',
  AuthMiddleware.validateAuthToken,
  UserMiddleware.checkIfMaximumDebitCardsSaved,
  PaymentController.initializeCardTokenizationPayment
);

router.post(
  '/paystack-webhook',
  PaymentMiddleware.paystackWebhookVerification,
  PaymentMiddleware.verifyPaystackPaymentStatus,
  PaymentMiddleware.verifyTransactionPaymentRecord,
  PaymentMiddleware.processPersonalLoanTransferPayments,
  PaymentMiddleware.processPersonalLoanRepayments,
  PaymentMiddleware.handleTransactionRefundResponse,
  PaymentMiddleware.updatePaymentHistoryStatus,
  PaymentMiddleware.saveCardAuth,
  PaymentMiddleware.raiseRefundForCardTokenization,
  PaymentController.finalWebhookResponse
);

export default router;
