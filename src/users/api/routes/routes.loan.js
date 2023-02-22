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
  LoanMiddleware.validateLoanAmountAndTenor,
  LoanMiddleware.checkIfUserHasActivePersonalLoan,
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  AuthMiddleware.isPinCreated('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  UserMiddleware.isUploadedVerifiedId('confirm'),
  LoanController.checkUserLoanEligibility
);

router.post(
  '/:loan_id/cancel-application',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanIdParams, 'params'),
  LoanMiddleware.checkUserLoanApplicationExists,
  LoanMiddleware.checkIfLoanApplicationStatusIsStillPending,
  LoanController.cancelLoanApplication
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

router.get(
  '/:loan_id/personal/details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanIdParams, 'params'),
  LoanMiddleware.checkUserLoanApplicationExists,
  LoanController.fetchPersonalLoanDetails
);

export default router;
