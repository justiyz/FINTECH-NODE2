import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.auth';

const router = Router();

router.post(
  '/login',
  Model(Schema.login, 'payload')
);

export default router;
