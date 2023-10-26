import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as UserController from '../controllers/controllers.user';
import * as shopCategories from '../controllers/controllers.shop';
import Schema from '../../lib/schemas/lib.schema.shop';
import * as LoanMiddleware from '../middlewares/middlewares.loan';

const router = Router();

router.get(
  '/shop-categories',
  AuthMiddleware.validateAuthToken,
  // AuthMiddleware.isCompletedKyc('confirm'),
  // Model(Schema.shopCategory, 'params'),
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
  '/ticket/:ticket_id/book',
  AuthMiddleware.validateAuthToken,
  Model(Schema.subscribeTicket, 'body'),
  LoanMiddleware.checkUserLoanApplicationExists,
  UserMiddleware.checkIfAccountDetailsExists,
  UserMiddleware.checkIfCardOrUserExist,
  shopCategories.createTicketSubscription
);

router.get(
  '/ticket/:ticket_id/summary',
  AuthMiddleware.validateAuthToken,
  shopCategories.getTicketSubscriptionSummary
);

router.post(
  '/ticket/:ticket_id/send_tickets',
  AuthMiddleware.validateAuthToken,
  shopCategories.sendEventTicketToEmails
);

export default router;
