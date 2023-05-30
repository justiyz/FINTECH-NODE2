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

router.get(
  '/personal-loans',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchLoans, 'query'),
  LoanController.fetchLoans
);

router.get(
  '/repaid-loans',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchRepaidloans, 'query'),
  LoanController.fetchRepaidLoans
);

router.get(
  '/rescheduled-loans',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchRescheduledloans, 'query'),
  LoanController.fetchRescheduledLoans
);
router.get(
  '/:loan_id/rescheduled-loans',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.loanIdParams, 'params'),
  LoanMiddleware.checkIfLoanExists,
  LoanController.fetchSingleUserRescheduledLoan
);

export default router;
