import loanQueries from '../queries/queries.loan';
import userLoanQueries from '../../../users/api/queries/queries.loan';
import * as helpers from '../../lib/utils/lib.util.helpers';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../../users/lib/http/lib.http.responses';
import enums from '../../../users/lib/enums';
import { adminActivityTracking } from '../../lib/monitor';
import * as descriptions from '../../lib/monitor/lib.monitor.description';

/**
 * check if loan application is existing in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminLoanMiddleware
 */
export const checkIfLoanExists = async(req, res, next) => {
  try {
    const { params: { loan_id }, admin } = req;
    const [ loanApplication ] = await processAnyData(loanQueries.fetchLoanDetailsById, [ loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: checked if loan application exists in the db checkIfLoanExists.admin.middlewares.loan.js`);
    if (loanApplication) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan application exists checkIfLoanExists.admin.middlewares.loan.js`);
      req.loanApplication = loanApplication;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan application does not exist checkIfLoanExists.admin.middlewares.loan.js`);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_NOT_EXISTING_IN_DB, enums.HTTP_BAD_REQUEST, enums.CHECK_LOAN_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_LOAN_EXISTS_MIDDLEWARE;
    logger.error(`checking if loan application exists failed::${enums.CHECK_LOAN_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if cluster member loan application is existing in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminLoanMiddleware
 */
export const checkIfClusterMemberLoanExists = async(req, res, next) => {
  try {
    const { params: { member_loan_id }, admin } = req;
    const [ loanApplication ] = await processAnyData(loanQueries.fetchClusterMemberLoanDetailsById, [ member_loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: checked if cluster member loan application exists in the db
    checkIfClusterMemberLoanExists.admin.middlewares.loan.js`);
    if (loanApplication) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan application exists checkIfClusterMemberLoanExists.admin.middlewares.loan.js`);
      req.loanApplication = loanApplication;
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: cluster member loan application does not exist
    checkIfClusterMemberLoanExists.admin.middlewares.loan.js`);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_NOT_EXISTING_IN_DB, enums.HTTP_BAD_REQUEST, enums.CHECK_CLUSTER_MEMBER_LOAN_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_CLUSTER_MEMBER_LOAN_EXISTS_MIDDLEWARE;
    logger.error(`checking if cluster member loan application exists failed::${enums.CHECK_CLUSTER_MEMBER_LOAN_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if loan application is of status in review in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminLoanMiddleware
 */
export const checkIfLoanStatusIsInReview = async(req, res, next) => {
  const { loanApplication, admin, body: { decision } } = req;
  const adminName = `${admin.first_name} ${admin.last_name}`;
  const activityType = decision === 'approve' ? 21 : 22;
  const loanType = loanApplication.member_loan_id ? 'cluster' : 'individual';
  const descriptionType = decision === 'approve' ?
    descriptions.manually_loan_approval_failed(adminName, loanType) : descriptions.manually_loan_disapproval_failed(adminName, loanType);
  try {
    if (loanApplication.status === 'in review') {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan application is of status ${loanApplication.status}
      checkIfLoanStatusIsInReview.admin.middlewares.loan.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan application is of status ${loanApplication.status}
    checkIfLoanStatusIsInReview.admin.middlewares.loan.js`);
    await adminActivityTracking(req.admin.admin_id, activityType, 'fail', descriptionType);
    return ApiResponse.error(res, enums.LOAN_APPLICATION_STATUS(loanApplication.status), enums.HTTP_BAD_REQUEST, enums.CHECK_LOAN_EXISTS_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_LOAN_EXISTS_MIDDLEWARE;
    logger.error(`checking if loan application status is still in review failed::${enums.CHECK_LOAN_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};


/**
 * checks if a particular cluster loan exists in the DB
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminLoanMiddleware
 */
export const checkIfClusterLoanExists = async(req, res, next) => {
  try {
    const { params: { loan_id }, admin } = req;
    const  clusterLoanApplication  = await processAnyData(loanQueries.fetchClusterLoanDetailsById, [ loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: checked if cluster loan application exists in the db
    checkIfClusterLoanExists.admin.middlewares.loan.js`);
    if (clusterLoanApplication.length === 0) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan application does not exist checkIfLoanExists.admin.middlewares.loan.js`);
      return ApiResponse.error(res, enums.LOAN_APPLICATION_NOT_EXISTING_IN_DB, enums.HTTP_BAD_REQUEST, enums.CHECK_LOAN_EXISTS_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: cluster loan application exists checkIfClusterLoanExists.admin.middlewares.loan.js`);
    return next();
  } catch (error) {
    error.label = enums.CHECK_CLUSTER_LOAN_EXISTS_MIDDLEWARE;
    logger.error(`checking if cluster loan application exists failed::${enums.CHECK_CLUSTER_LOAN_EXISTS_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * checks if admin is super admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminLoanMiddleware
 */
export const checkIfAdminIsSuperAdmin = async(req, res, next) => {
  try {
    const { admin } = req;
    if (admin.role_type === 'SADM') {
      logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: successfully confirms admin is super admin middlewares.checkIfAdminIsSuperAdmin.loan.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP},  ${admin.admin_id}:::Info: successfully confirms admin is not super admin middlewares.checkIfAdminIsSuperAdmin.loan.js`);
    return ApiResponse.error(res, enums.ADMIN_NOT_SUPER_ADMIN, enums.HTTP_FORBIDDEN, enums.CHECK_IF_ADMIN_IS_SUPER_ADMIN_MIDDLEWARE);  

  } catch (error) {
    error.label = enums.CHECK_IF_ADMIN_IS_SUPER_ADMIN_MIDDLEWARE;
    logger.error(`checking if admin is super admin::${enums.CHECK_IF_ADMIN_IS_SUPER_ADMIN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check loan is active
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminLoanMiddleware
 */
export const checkIfLoanIsActive = async(req, res, next) => {
  try {
    const { params: {loan_id, user_id} , admin } = req;
    const loan = await processOneOrNoneData(loanQueries.checkIfLoanIsActive, [ user_id, loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan details fetched successfully
      checkIfLoanIsActive.admin.middlewares.loan.js`);

    if (!loan) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: confirms loan is inactive for user
        checkIfLoanIsActive.admin.middlewares.loan.js`);
      return ApiResponse.error(res, enums.LOAN_IS_INACTIVE, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_LOAN_IS_ACTIVE_MIDDLEWARE);
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: confirms loan is active for user
      checkIfLoanIsActive.admin.middlewares.loan.js`);

    req.totalOutstandingAmount = loan.total_outstanding_amount;
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_LOAN_IS_ACTIVE_MIDDLEWARE;
    logger.error(`checking if loan is active failed::${enums.CHECK_IF_LOAN_IS_ACTIVE_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if amount paid exceeds outstanding amount
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminLoanMiddleware
 */
export const checkIfAmountPaidExceedsOutstanding = async(req, res, next) => {
  try {
    const { body: { loan_id, user_id, amount }, loanApplication, admin } = req;
    const result = await helpers.sumOfPaymentsRecordedOnPaymentSchedules(user_id, loan_id);
    const currentAmountPaid = result.total_recorded_amount_paid;
    const totalAmountPendingPayment = (parseFloat(loanApplication.total_repayment_amount) - parseFloat(currentAmountPaid)).toFixed(2);
     
    if (parseFloat(amount) > parseFloat(totalAmountPendingPayment)) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: confirms amount to be paid is greater than the outstanding loan amount
      checkIfAmountPaidExceedsOutstanding.admin.middlewares.loan.js`);
      return ApiResponse.error(res, enums.LOAN_OVERPAID, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_AMOUNT_PAID_EXCEEDS_OUTSTANDING_AMOUNT_MIDDLEWARE);
    }
    return next();
  } catch (error) {
    error.label = enums.CHECK_IF_AMOUNT_PAID_EXCEEDS_OUTSTANDING_AMOUNT_MIDDLEWARE;
    logger.error(`checking if amount paid exceeds outstanding amount failed::${enums.CHECK_IF_AMOUNT_PAID_EXCEEDS_OUTSTANDING_AMOUNT_MIDDLEWARE}`, error.message);
    return next(error);
  }
};

/**
 * check if loan application was created by admin
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns {object} - Returns an object (error or response).
 * @memberof AdminLoanMiddleware
 */
export const checkIfAdminCreatedLoan= async(req, res, next) => {
  try {
    const { params: { loan_id }, admin } = req;
    const [ loanApplication ] = await processAnyData(loanQueries.fetchLoanDetailsById, [ loan_id ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: fetched loan details successfully checkIfAdminCreatedLoan.admin.middlewares.loan.js`);
    if (loanApplication.is_created_by_admin) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan is created by admin checkIfAdminCreatedLoan.admin.middlewares.loan.js`);
      return next();
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${admin.admin_id}:::Info: loan was not created by admin.admin.middlewares.loan.js`);
    return ApiResponse.error(res, enums.LOAN_WAS_NOT_CREATED_BY_ADMIN, enums.HTTP_BAD_REQUEST, enums.CHECK_IF_ADMIN_CREATED_LOAN_MIDDLEWARE);
  } catch (error) {
    error.label = enums.CHECK_IF_ADMIN_CREATED_LOAN_MIDDLEWARE;
    logger.error(`checking if admin created loan failed::${enums.CHECK_IF_ADMIN_CREATED_LOAN_MIDDLEWARE}`, error.message);
    return next(error);
  }
};
