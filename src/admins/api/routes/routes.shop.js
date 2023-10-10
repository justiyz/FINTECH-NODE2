import { Router } from 'express';
// import Model from '../../../users/api/middlewares/middlewares.model';
// import Schema from '../../lib/schemas/lib.schema.role';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as RoleMiddleware from '../middlewares/middlewares.roles';
import * as ShopController from '../controllers/controller.shop';

const router = Router();

router.get(
  '/fetch/shop-categories',
  AuthMiddleware.validateAdminAuthToken,
  // RoleMiddleware.adminAccess('role management', 'read'),
  ShopController.listShopCategories
);
export default router;
