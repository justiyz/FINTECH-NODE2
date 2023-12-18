import { Router } from 'express';
import * as RecovaController from '../controllers/controllers.recova';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as RecovaMiddleware from '../middlewares/middlewares.recova';
import Schema from '../../lib/schemas/lib.schema.recova';
import Model from '../middlewares/middlewares.model';

const router = Router();

router.get(
  '/loan-due-amount/:loan_reference',
  Model(Schema.fetchLoanDueAmountParams, 'params'),
  AuthMiddleware.validateRecovaRequest,
  RecovaMiddleware.checkLoanExists,
  RecovaController.fetchLoanDueAmount
);


export default router;
