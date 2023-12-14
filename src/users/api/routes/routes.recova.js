import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.loan';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as PaymentMiddleware from '../middlewares/middlewares.payment';
import * as LoanMiddleware from '../middlewares/middlewares.loan';
import * as LoanController from '../controllers/controllers.loan';
const router = Router();

router.get(
  '/loan-due-amount/:loan_reference',
  AuthMiddleware.validateRecovaRequest,
  (req, res) => {console.log('loan-due-amount');}
);


export default router;
