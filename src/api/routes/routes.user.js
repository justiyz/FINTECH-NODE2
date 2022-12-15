import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.user';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserController from '../controllers/controllers.user';

const router = Router();

router.patch(
  '/update-fcm-token',
  Model(Schema.updateFcmToken, 'payload'),
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateAuthToken,
  UserController.updateFcmToken

);

export default router;
