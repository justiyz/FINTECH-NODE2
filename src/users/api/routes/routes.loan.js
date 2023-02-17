import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.loan';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as LoanController from '../controllers/controllers.loan';

const router = Router();

router.post(
  '/application',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanApplication, 'payload'),
  UserMiddleware.checkUserAdvancedKycUpdate,
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  UserMiddleware.isUploadedVerifiedId('confirm'),
  LoanController.checkUserLoanEligibility
);

export default router;
