import { Router } from 'express';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as RolesMiddleware from '../middlewares/middlewares.roles';
import * as BvnController from '../controllers/controllers.bvn';
import * as BvnMiddleware from '../middlewares/middlewares.bvn';

const router = Router();

router.post(
  '/blacklist',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('bvn management', 'create'),
  BvnMiddleware.isBvnAlreadyBlacklisted,
  BvnController.addBlacklistedBvns
);

router.get(
  '/blacklist',
  AuthMiddleware.validateAdminAuthToken,
  RolesMiddleware.adminAccess('bvn management', 'read'),
  BvnController.fetchBlacklistedBvn
);

export default router;
