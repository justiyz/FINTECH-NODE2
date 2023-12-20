import { Router } from 'express';
import * as RecovaController from '../controllers/controllers.recova';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as RecovaMiddleware from '../middlewares/middlewares.recova';
import Schema from '../../lib/schemas/lib.schema.recova';
import Model from '../middlewares/middlewares.model';

const router = Router();

router.get(
  '/loan-due-amount/:loan_reference',
  AuthMiddleware.validateRecovaRequest,
  Model(Schema.fetchLoanDueAmountParams, 'params'),
  RecovaMiddleware.checkLoanExists,
  RecovaController.fetchLoanDueAmount
);

router.post(
  '/mandate-created',
  AuthMiddleware.validateRecovaRequest,
  Model(Schema.mandateCreatedPayload, 'payload'),
  RecovaMiddleware.checkLoanExists,
  RecovaController.handleMandateCreated
);

router.post(
  '/loan-balance-update',
  AuthMiddleware.validateRecovaRequest,
  Model(Schema.loanBalanceUpdate, 'payload'),
  RecovaMiddleware.checkLoanExists,
  RecovaController.handleMandateCreated
);


export default router;
