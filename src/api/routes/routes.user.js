import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.user';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserController from '../controllers/controllers.user';

const router = Router();

router.patch(
  '/update-fcm-token',
  AuthMiddleware.getAuthToken,
  AuthMiddleware.validateAuthToken,
  Model(Schema.updateFcmToken, 'payload'),
  UserController.updateFcmToken
);

export default router;
