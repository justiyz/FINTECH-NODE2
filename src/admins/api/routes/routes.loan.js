import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.loan';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as RoleMiddleware from '../middlewares/middlewares.roles';
import * as LoanMiddleware from '../middlewares/middlewares.loan';
import * as LoanController from '../controllers/controllers.loan';

const router = Router();

router.patch(
  '/:loan_id/approve',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'approve'),
  Model(Schema.loanIdParams, 'params'),
  Model(Schema.manualLoanApproval, 'payload'),
  LoanMiddleware.checkIfLoanExists,
  LoanMiddleware.checkIfLoanStatusIsInReview,
  LoanController.approveLoanApplication
);

router.patch(
  '/:loan_id/reject',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'reject'),
  Model(Schema.loanIdParams, 'params'),
  Model(Schema.manualLoanRejection, 'payload'),
  LoanMiddleware.checkIfLoanExists,
  LoanMiddleware.checkIfLoanStatusIsInReview,
  LoanController.declineLoanApplication
);

router.get(
  '/:loan_id/details',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.loanIdParams, 'params'),
  LoanMiddleware.checkIfLoanExists,
  LoanController.loanApplicationDetails
);

export default router;
