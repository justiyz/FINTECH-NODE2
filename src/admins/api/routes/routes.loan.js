import { Router } from 'express';
import Model from '../../../users/api/middlewares/middlewares.model';
import Schema from '../../lib/schemas/lib.schema.loan';
import * as AuthMiddleware from '../middlewares/middlewares.auth';
import * as AdminClusterMiddleware from '../middlewares/middlewares.cluster';
import * as RoleMiddleware from '../middlewares/middlewares.roles';
import * as LoanMiddleware from '../middlewares/middlewares.loan';
import * as LoanController from '../controllers/controllers.loan';
import * as UserMiddleware from '../middlewares/middlewares.user';

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
  '/clusters',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchClusterLoans, 'query'),
  LoanController.fetchClusterLoans
);

router.get(
  '/:cluster_id/:loan_id/cluster',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchClusterDetails, 'params'),
  AdminClusterMiddleware.checkIfClusterExists('all'),
  LoanMiddleware.checkIfClusterLoanExists,
  LoanController.fetchAClusterLoanDetails
);

router.get(
  '/cluster/:member_loan_id/members-loan-details',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.memberLoanId, 'params'),
  LoanMiddleware.checkIfClusterMemberLoanExists,
  LoanController.fetchSingleMemberClusterLoanDetails
);

router.get(
  '/cluster/in-review-loans',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchInReviewClusterLoans, 'query'),
  LoanController.fetchInReviewClusterLoans
);

router.get(
  '/cluster/:member_loan_id/in-review-loan-details',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.memberLoanId, 'params'),
  LoanMiddleware.checkIfClusterMemberLoanExists,
  LoanController.fetchSingleMemberInReviewLoanDetails
);

router.get(
  '/cluster/repayments',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchRepaidClusterLoans, 'query'),
  LoanController.fetchClusterMembersLoanRepayment
);

router.get(
  '/cluster/:member_loan_id/repayment',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.memberLoanId, 'params'),
  LoanController.fetchUserClusterLoanRepaymentDetails
);

router.get(
  '/cluster/rescheduled-loans',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.fetchRescheduledClusterLoans, 'query'),
  LoanController.fetchRescheduledClusterLoans
);

router.get(
  '/cluster/:member_loan_id/rescheduled-loan-details',
  AuthMiddleware.validateAdminAuthToken,
  RoleMiddleware.adminAccess('loan application', 'read'),
  Model(Schema.memberLoanId, 'params'),
  LoanMiddleware.checkIfClusterMemberLoanExists,
  LoanController.fetchSingleClusterMemberRescheduledLoan
);

router.post(
  '/manual-application',
  AuthMiddleware.validateAdminAuthToken,
  UserMiddleware.checkIfUserExists,
  RoleMiddleware.adminAccess('loan application', 'create'),
  Model(Schema.manuallyInitiatedLoanApplication, 'payload'),
  LoanController.manuallyInitiatePersonalLoanApplication
);

export default router;
