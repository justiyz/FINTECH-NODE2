import { Router } from 'express';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.admin';
import * as RolesMiddleware from '../middlewares/middlewares.roles';
import * as BvnController from '../controllers/controllers.bvn';
import * as BvnMiddleware from '../middlewares/middlewares.bvn';

const router = Router();

router.post(
  '/blacklist',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('bvn management', 'create'),
  Model(Schema.blacklistedBvn, 'payload'),
  BvnMiddleware.isBvnAlreadyBlacklisted,
  BvnController.addBlacklistedBvns
);

router.get(
  '/blacklist',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('bvn management', 'read'),
  Model(Schema.fetchBlacklistedBvn, 'params'),
  BvnController.fetchBlacklistedBvn
);

router.patch(
  '/unblacklist-bvn/:id',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('bvn management', 'update'),
  Model(Schema.unblacklist_bvn, 'params'),
  BvnMiddleware.checkIfBvnExist,
  BvnController.unblacklistBvn
);
export default router;
