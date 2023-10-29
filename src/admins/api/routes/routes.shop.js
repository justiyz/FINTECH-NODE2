import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
// import Schema from '../../lib/schemas/lib.schema.role';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as RoleMiddleware from '../middlewares/middlewares.roles';
import * as ShopMiddleware from '../middlewares/middlewares.user';
import * as ShopController from '../controllers/controller.shop';
import * as ShopSchema from '../../../users/lib/schemas/lib.schema.shop';

const router = Router();

router.get(
  '/shop-categories',
  AuthMiddleware.validateAdminAuthToken,
  // RoleMiddleware.adminAccess('role management', 'read'),
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


router.post(
  '/create-event-record',
  AuthMiddleware.validateAdminAuthToken,
  // ShopMiddleware.uploadAdminImage,
  ShopController.createEventRecord
);

router.post(
  '/update-event-record/:event_id',
  AuthMiddleware.validateAdminAuthToken,
  ShopController.updateEventRecord
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

// router.get(
//   '/:shop_category_id/details',
//   AuthMiddleware.validateAdminAuthToken,
//   Model(ShopSchema.shopCategoryIdParams, 'params'),
//   ShopController.fetchShopDetails
// );

router.get(
  '/ticket/:ticket',
  AuthMiddleware.validateAdminAuthToken,
  ShopController.fetchEventTicketCategories
);
export default router;
