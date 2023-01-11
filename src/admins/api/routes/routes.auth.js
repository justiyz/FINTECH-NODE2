import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.auth';
import * as AdminMiddleware from '../middlewares/middlewares.admin';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as AuthController from '../controllers/controllers.auth';


const router = Router();

router.post(
  '/login',
  Model(Schema.login, 'payload'),
  AdminMiddleware.validateUnAuthenticatedAdmin('login'),
  AuthMiddleware.compareAdminPassword,
  AuthMiddleware.generateAdminVerificationToken,
  AuthController.completeAdminLoginRequest
);

router.post(
  '/verify-login',
  Model(Schema.verifyLogin, 'payload'),
  AuthMiddleware.verifyLoginVerificationToken,
  AdminMiddleware.validateUnAuthenticatedAdmin('login'),
  AuthMiddleware.adminPermissions,
  AuthController.login
);

export default router;
