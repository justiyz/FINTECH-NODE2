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

router.patch(
  '/cluster/:member_loan_id/approve',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'approve'),
  Model(Schema.memberLoanIdParams, 'params'),
  Model(Schema.manualLoanApproval, 'payload'),
  LoanMiddleware.checkIfClusterMemberLoanExists,
  LoanMiddleware.checkIfLoanStatusIsInReview,
  LoanController.approveClusterMemberLoanApplication
);

router.patch(
  '/cluster/:member_loan_id/reject',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'reject'),
  Model(Schema.memberLoanIdParams, 'params'),
  Model(Schema.manualLoanRejection, 'payload'),
  LoanMiddleware.checkIfClusterMemberLoanExists,
  LoanMiddleware.checkIfLoanStatusIsInReview,
  LoanController.declineClusterMemberLoanApplication
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
  Model(Schema.fetchRepaidLoans, 'query'),
  LoanController.fetchRepaidLoans
);

router.get(
  '/rescheduled-loans',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchRescheduledLoans, 'query'),
  LoanController.fetchRescheduledLoans
);

router.get(
  '/:loan_id/rescheduled-loan',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.loanIdParams, 'params'),
  LoanMiddleware.checkIfLoanExists,
  LoanController.fetchSingleUserRescheduledLoan
);

router.get(
  '/cluster-loans',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchClusterLoans, 'query'),
  LoanController.fetchClusterLoans
);

router.get(
  '/:loan_id/cluster-members',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.loanIdParams, 'params'),
  LoanMiddleware.checkIfClusterLoanExists,
  LoanController.fetchDetailsOfMembersOfACluster
);
router.get(
  '/:member_loan_id/cluster-member',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.memberLoanId, 'params'),
  LoanController.fetchSingleMemberClusterLoanDetails
);

router.get(
  '/in-review-cluster-loans',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchInReviewClusterLoans, 'query'),
  LoanController.fetchInReviewClusterLoans
);
router.get(
  '/:loan_id/in-review-cluster-loans-members',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.loanIdParams, 'params'),
  LoanMiddleware.checkIfClusterLoanExists,
  LoanController.fetchInReviewClusterLoanMembers
);
router.get(
  '/:member_loan_id/in-review-cluster-loans-member',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.memberLoanId, 'params'),
  LoanController.fetchSingleMemberInReviewLoanDetails
);

router.get(
  '/cluster-repayments',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchRepaidClusterLoans, 'query'),
  LoanController.fetchClusterMembersLoanRepayment
);

router.get(
  '/rescheduled-cluster-loans',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchRescheduledClusterLoans, 'query'),
  LoanController.fetchRescheduledClusterLoans
);

router.get(
  '/:member_loan_id/rescheduled-cluster-loan',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.memberLoanId, 'params'),
  LoanController.fetchSingleClusterMemberRescheduledLoan
);
export default router;
