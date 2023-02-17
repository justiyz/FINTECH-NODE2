import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.loan';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as LoanMiddleware from '../middlewares/middlewares.loan';
import * as LoanController from '../controllers/controllers.loan';

const router = Router();

router.post(
  '/application',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanApplication, 'payload'),
  UserMiddleware.checkUserAdvancedKycUpdate,
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  AuthMiddleware.isPinCreated('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  UserMiddleware.isUploadedVerifiedId('confirm'),
  LoanController.checkUserLoanEligibility
);

router.post(
  '/:loan_id/disbursement',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanIdParams, 'params'),
  Model(Schema.loanDisbursementPayload, 'payload'),
  AuthMiddleware.comparePin,
  LoanMiddleware.checkUserLoanApplicationExists,
  LoanMiddleware.checkIfLoanApplicationStatusIsCurrentlyApproved,
  // add middleware to call sterling API for disbursement
  LoanController.updateActivatedLoanApplicationDetails
);

export default router;
