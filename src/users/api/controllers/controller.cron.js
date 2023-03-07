import { v4 as uuidv4 } from 'uuid';
import cronQueries from '../queries/queries.cron';
import loanQueries from '../queries/queries.loan';
import userQueries from '../queries/queries.user';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import { initializeDebitCarAuthChargeForLoanRepayment } from '../services/service.paystack';
import MailService from '../services/services.email';

/**
 * update user loan status to overdue
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the updated statuses
 * @memberof CronController
 */
export const updateLoanStatusToOverdue = async (req, res, next) => {
  try {
    const overDueLoanRepayments = await processAnyData(cronQueries.fetchAllOverdueLoanRepayments, []);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: all loan repayments that have passed the current date fetched from the database updateLoanStatusToOverdue.controllers.cron.js`);
    const key = 'loan_id';
    const distinctLoanApplications  = [ ...new Map(overDueLoanRepayments.map(repayment => [ repayment[key], repayment ])).values() ];
    await Promise.all([ distinctLoanApplications ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the unique values have been filtered apart updateLoanStatusToOverdue.controllers.cron.js`);
    await Promise.all([
      distinctLoanApplications.map(async(application) => {
        const [ nextRepayment ] = await processAnyData(cronQueries.fetchLoanNextRepayment, [ application.loan_id, application.user_id ]);
        await processOneOrNoneData(cronQueries.updateNextLoanRepaymentOverdue, [ nextRepayment.loan_repayment_id ]);
        await processOneOrNoneData(cronQueries.updateLoanWithOverDueStatus, [ application.loan_id, application.user_id ]);
        await processOneOrNoneData(cronQueries.updateUserLoanStatusOverDue,  [ application.user_id ]);
        // add updating cron trail table query when cron trail table is added
        return application;
      })
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully updated loans that are over due to over due in the database updateLoanStatusToOverdue.controllers.cron.js`);
    return ApiResponse.success(res, enums.USER_LOAN_STATUS_OVERDUE, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_LOAN_STATUS_TO_OVERDUE_CONTROLLER;
    logger.error(`updating users loan status to over due failed::${enums.UPDATE_LOAN_STATUS_TO_OVERDUE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * initiate loan repayment for user
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the initiated payments
 * @memberof CronController
 */
export const initiateLoanRepayment = async (req, res, next) => {
  try {
    const dueForPaymentLoanRepayments = await processAnyData(cronQueries.fetchAllQualifiedRepayments, [ Number(2) ]); // still try to automatically debit until after 2 days loan repayment passes
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: all loan repayments that have passed the current date fetched from the database updateLoanStatusToOverdue.controllers.cron.js`);
    await Promise.all([
      dueForPaymentLoanRepayments.map(async(repayment) => {
        const [ user ] = await processAnyData(userQueries.getUserByUserId, [ repayment.user_id ]);
        const [ userDebitCardDetails ] = await processAnyData(cronQueries.fetchUserSavedDebitCardsToken, [ repayment.user_id ]);
        const reference = uuidv4();
        const paystackAmountFormatting = parseFloat(repayment.total_payment_amount) * 100; // Paystack requires amount to be in kobo for naira payment
        await processAnyData(loanQueries.initializeBankTransferPayment, [ repayment.user_id, parseFloat(repayment.total_payment_amount), 'paystack', reference, 'automatic_loan_repayment', 'user repays part of or all of existing personal loan facility automatically via card', repayment.loan_id ]);
        const result = await initializeDebitCarAuthChargeForLoanRepayment(user, paystackAmountFormatting, reference, userDebitCardDetails); // the first in the array is the default card, if no default card, use the next tokenized card
        if (result.status === true && result.message.trim().toLowerCase() === 'charge attempted' && result.data.status === 'success') {
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack initialized initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
          // add updating cron trail table query when cron trail table is added
          return repayment;
        }
        MailService('Failed card debiting', 'failedCardDebit', { ...user, ...userDebitCardDetails, ...repayment });
        return repayment;
      })
    ]);
    return ApiResponse.success(res, enums.DUE_FOR_PAYMENT_LOAN_REPAYMENT_INITIATED, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.INITIATE_LOAN_REPAYMENT_CONTROLLER;
    logger.error(`initiating loan repayment for loan repayments which are due for repayment failed::${enums.INITIATE_LOAN_REPAYMENT_CONTROLLER}`, error.message);
    return next(error);
  }
};
