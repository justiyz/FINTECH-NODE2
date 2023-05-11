import { Router } from 'express';
import Model from '../middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.loan';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as UserMiddleware from '../middlewares/middlewares.user';
import * as PaymentMiddleware from '../middlewares/middlewares.payment';
import * as LoanMiddleware from '../middlewares/middlewares.loan';
import * as LoanController from '../controllers/controllers.loan';

const router = Router();

router.post(
  '/application',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanApplication, 'payload'),
  LoanMiddleware.checkIfUserHasActivePersonalLoan,
  UserMiddleware.checkUserAdvancedKycUpdate,
  LoanMiddleware.checkIfEmploymentTypeLimitApplies,
  LoanMiddleware.validateLoanAmountAndTenor,
  UserMiddleware.isEmailVerified('authenticate'),
  UserMiddleware.isUploadedImageSelfie('confirm'),
  AuthMiddleware.isPinCreated('confirm'),
  UserMiddleware.isVerifiedBvn('confirm'),
  LoanMiddleware.checkIfUserBvnNotBlacklisted,
  LoanController.checkUserLoanEligibility
);

router.patch(
  '/:loan_id/accept-allowable-amount',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanIdParams, 'params'),
  LoanMiddleware.checkUserLoanApplicationExists,
  LoanMiddleware.checkIfLoanApplicationStatusIsStillPending,
  LoanController.acceptSystemMaximumAllowableLoanAmount
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

router.get(
  '/:loan_id/initiate-repayment',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanIdParams, 'params'),
  Model(Schema.noCardOrBankLoanRepaymentType, 'query'),
  LoanMiddleware.checkUserLoanApplicationExists,
  LoanController.initiateManualLoanRepayment
);

router.post(
  '/:loan_id/:payment_channel_id/initiate-repayment',
  AuthMiddleware.validateAuthToken,
  Model(Schema.loanRepaymentParams, 'params'),
  Model(Schema.loanRepaymentType, 'query'),
  LoanMiddleware.checkUserLoanApplicationExists,
  UserMiddleware.checkIfAccountDetailsExists,
  UserMiddleware.checkIfCardOrUserExist,
  LoanController.initiateManualCardOrBankLoanRepayment
);

router.post(
  '/:reference_id/submit-otp',
  AuthMiddleware.validateAuthToken,
  Model(Schema.referenceIdParams, 'params'),
  Model(Schema.paymentOtp, 'payload'),
  PaymentMiddleware.verifyTransactionPaymentRecord,
  LoanController.submitPaymentOtp
);

export default router;
