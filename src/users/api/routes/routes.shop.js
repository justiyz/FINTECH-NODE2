import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as UserController from '../controllers/controllers.user';
import * as shopCategories from '../controllers/controllers.shop';
import Schema from '../../lib/schemas/lib.schema.shop';
import loanSchema from '../../lib/schemas/lib.schema.loan';
import * as LoanMiddleware from '../middlewares/middlewares.loan';
import * as paymentMiddleware from '../middlewares/middlewares.payment';
import * as LoanController from '../controllers/controllers.loan'
import {cancelShopLoanApplication} from "../controllers/controllers.loan";
import {checkAvailableNumberOfTicketsBeforePurchase} from "../middlewares/middlewares.loan";
// import {availableTicketsMiddleware} from "../middlewares/middlewares.loan";

const router = Router();

router.get(
  '/shop-categories',
  AuthMiddleware.validateAuthToken,
  shopCategories.shopCategories
);

router.get(
  '/:shop_category_id/details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.shopCategoryIdParams, 'params'),
  shopCategories.fetchShopDetails
);

router.get(
  '/ticket-list',
  AuthMiddleware.validateAuthToken,
  Model(Schema.ticketList, 'params'),
  shopCategories.fetchTickets
);

router.get(
  '/user-tickets',
  AuthMiddleware.validateAuthToken,
  Model(Schema.userTickets, 'params'),
  shopCategories.fetchUserTickets
);

router.get(
  '/ticket/:ticket_id',
  AuthMiddleware.validateAuthToken,
  Model(Schema.ticketId, 'params'),
  shopCategories.fetchTicketCategories
);

router.post(
  '/ticket/:ticket_id/:payment_channel_id/book',
  AuthMiddleware.validateAuthToken,
  AuthMiddleware.isCompletedKyc('confirm'),
  UserMiddleware.checkIfAccountDetailsExists,
  Model(loanSchema.loanForEventApplication, 'params'),
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  AuthMiddleware.isPinCreated('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  UserMiddleware.isUploadedVerifiedId('confirm'),
  UserMiddleware.checkUserAdvancedKycUpdate,
  LoanMiddleware.checkIfUserHasActivePersonalLoan, // only on live
  LoanMiddleware.validateLoanAmountAndTenor, // only on live
  LoanMiddleware.checkIfEmploymentTypeLimitApplies,
  LoanMiddleware.checkIfUserBvnNotBlacklisted, // only on live
  LoanMiddleware.checkIfUserHasClusterDiscount,
  LoanMiddleware.checkAvailableNumberOfTicketsBeforePurchase,
  LoanMiddleware.additionalUserChecksForLoan,
  shopCategories.checkUserTicketLoanEligibility,
  shopCategories.createTicketSubscription
);

router.post(
  '/ticket/payment-successful',
  AuthMiddleware.validateAuthToken,
  Model(loanSchema.successfulEventPayment, 'payload'),
  paymentMiddleware.ticketPurchaseUpdate,
  shopCategories.ticketPurchaseUpdate
);

router.get(
  '/ticket/:ticket_id/summary',
  AuthMiddleware.validateAuthToken,
  shopCategories.getTicketSubscriptionSummary
);

router.post(
  '/ticket/send_notifications',
  AuthMiddleware.validateAuthToken,
  shopCategories.sendEventTicketToEmails
);

router.delete(
  '/:ticket_id/delete',
  AuthMiddleware.validateAuthToken,
    LoanController.cancelShopLoanApplication,
  shopCategories.cancel_ticket_booking
);

export default router;
