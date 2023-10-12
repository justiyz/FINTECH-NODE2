import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
// import * as UserMiddleware from '../middlewares/middlewares.user';
// import * as UserController from '../controllers/controllers.user';
import * as shopCategories from '../controllers/controllers.shop';
import Schema from '../../lib/schemas/lib.schema.shop';
import * as ClusterMiddleware from '../middlewares/middlewares.cluster';
import * as ClusterController from '../controllers/controllers.cluster';

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
export default router;
