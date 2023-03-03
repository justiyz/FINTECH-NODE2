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
  UserMiddleware.checkUserLoanStatus,
  UserMiddleware.checkUserAdvancedKycUpdate,
  LoanMiddleware.validateLoanAmountAndTenor,
  LoanMiddleware.checkIfUserHasActivePersonalLoan,
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  AuthMiddleware.isPinCreated('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
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
  LoanMiddleware.checkSeedfiPaystackBalance,
  LoanMiddleware.generateLoanDisbursementRecipient,
  LoanController.initiateLoanDisbursement
);

router.get(
  '/current-loans',
  AuthMiddleware.validateAuthToken,
  LoanController.fetchUserCurrentLoans
);

router.get(
  '/:loan_id/personal/details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanIdParams, 'params'),
  LoanMiddleware.checkUserLoanApplicationExists,
  LoanController.fetchPersonalLoanDetails
);

router.get(
  '/loan-payments',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanType, 'query'),
  LoanController.fetchUserLoanPaymentTransactions
);

router.get(
  '/:loan_payment_id/personal/payment-details',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanPaymentIdParams, 'params'),
  LoanMiddleware.checkUserLoanPaymentExists,
  LoanController.fetchPersonalLoanPaymentDetails
);

export default router;
