import { Router } from 'express';
// import Schema from '../../lib/schemas/lib.schema.role';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as ShopController from '../controllers/controller.shop';

const router = Router();

router.get(
  '/shop-categories',
  AuthMiddleware.validateAdminAuthToken,
  ShopController.listShopCategories
);

router.post(
  '/create-shop-category',
  AuthMiddleware.validateAdminAuthToken,
  ShopController.createShopCategory
);

router.get(
  '/get-event-list',
  AuthMiddleware.validateAdminAuthToken,
  ShopController.getEventsList
);

router.get(
  '/get-event-by-id/:event_id',
  AuthMiddleware.validateAdminAuthToken,
  ShopController.getEventById
);

router.post(
  '/create-event-record',
  AuthMiddleware.validateAdminAuthToken,
  // ShopMiddleware.uploadAdminImage,
  ShopController.createEventRecord
);

router.post(
  '/:event_id/update',
  AuthMiddleware.validateAdminAuthToken,
  ShopController.editEventRecord
);

router.post(
  '/category/:ticket_category_id/update',
  AuthMiddleware.validateAdminAuthToken,
  ShopController.editEventTicketCategory
);

router.get(
  '/ticket/:ticket',
  AuthMiddleware.validateAdminAuthToken,
  ShopController.fetchEventTicketCategories
);

router.delete(
  '/:ticket_id/delete',
  AuthMiddleware.validateAdminAuthToken,
  ShopController.removeTicketRecord
);
export default router;
