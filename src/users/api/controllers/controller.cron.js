import { v4 as uuidv4 } from 'uuid';
import cronQueries from '../queries/queries.cron';
import loanQueries from '../queries/queries.loan';
import userQueries from '../queries/queries.user';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import { userActivityTracking } from '../../lib/monitor';
import { initializeDebitCarAuthChargeForLoanRepayment } from '../services/service.paystack';
import { sendUserPersonalNotification, sendPushNotification } from '../services/services.firebase';
import * as PushNotifications from '../../lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates//personalNotification';
import MailService from '../services/services.email';
import notificationQueries from '../queries/queries.notification';
import * as adminNotification from '../../lib/templates/adminNotification';
import { sendNotificationToAdmin } from '../services/services.firebase';
import config from '../../config';


/**
 * update user loan status to overdue
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the updated statuses
 * @memberof CronController
 */
export const updateLoanStatusToOverdue = async(req, res, next) => {
  try {
    const overDueLoanRepayments = await processAnyData(cronQueries.fetchAllOverdueLoanRepayments, []);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: all loan repayments that have passed the current date fetched from the database 
    updateLoanStatusToOverdue.controllers.cron.js`);
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
        await processOneOrNoneData(cronQueries.recordCronTrail, [ application.user_id, 'ODLNSETOD', 'user loan repayment is past and loan status set to over due' ]);
        userActivityTracking(application.user_id, 78, 'success');
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
export const initiateLoanRepayment = async(req, res, next) => {
  try {
    const dueForPaymentLoanRepayments = await processAnyData(cronQueries.fetchAllQualifiedRepayments, [ Number(7) ]);
    // still try to automatically debit until after 7 days proposed loan repayment date passes
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: all loan repayments that have passed the current date fetched from the database 
    updateLoanStatusToOverdue.controllers.cron.js`);
    await Promise.all([
      dueForPaymentLoanRepayments.map(async(repayment) => {
        const [ user ] = await processAnyData(userQueries.getUserByUserId, [ repayment.user_id ]);
        const [ userDebitCardDetails ] = await processAnyData(cronQueries.fetchUserSavedDebitCardsToken, [ repayment.user_id ]);
        const reference = uuidv4();
        const paystackAmountFormatting = parseFloat(repayment.total_payment_amount) * 100; // Paystack requires amount to be in kobo for naira payment
        await processAnyData(loanQueries.initializeBankTransferPayment, [ repayment.user_id, parseFloat(repayment.total_payment_amount), 'paystack', reference, 
          'automatic_loan_repayment', 'user repays part of or all of existing personal loan facility automatically via card', repayment.loan_id ]);
        const result = await initializeDebitCarAuthChargeForLoanRepayment(user, paystackAmountFormatting, reference, userDebitCardDetails); 
        // the first in the array is the default card, if no default card, use the next tokenized card
        if (result.status === true && result.message.trim().toLowerCase() === 'charge attempted' && result.data.status === 'success') {
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: loan repayment via paystack initialized 
          initiateManualCardOrBankLoanRepayment.controllers.loan.js`);
          await processOneOrNoneData(cronQueries.recordCronTrail, [ user.user_id, 'LNRPTCDIN', 'user next loan repayment initiated' ]);
          userActivityTracking(user.user_id, 79, 'success');
          return repayment;
        }
        await MailService('Failed card debiting', 'failedCardDebit', { ...user, ...userDebitCardDetails, ...repayment }),
        sendPushNotification(user.user_id, PushNotifications.failedCardDebit, user.fcm_token);
        sendUserPersonalNotification(user, `${user.name} Failed card debiting`, PersonalNotifications.failedCardDebit({ ...userDebitCardDetails, ...repayment }), 
          'failed-card-debit', { ...repayment});
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

/**
 * notify admin and non performing users
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON successful response
 * @memberof CronController
 */
export const nonPerformingLoans = async(req, res, next) => {
  try {
    const nplGraceDay = await processOneOrNoneData(notificationQueries.fetchAdminSetEnvDetails, [ 'npl_overdue_past' ]);
    const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'loan application' ]);
    const nonPerformingUsers = await processAnyData(notificationQueries.nonPerformingLoans, [ Number(nplGraceDay.value) ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}::Info: successfully fetched loan application admin and non performing users from the db nonPerformingLoans.controllers.loan.js`);

    const maxIterations = Math.max(admins.length, nonPerformingUsers.length);

    for (let i = 0; i < maxIterations; i++) {
      const admin = admins[i] || null;
      const users = nonPerformingUsers[i] || null;
      
      // should send notification to both users and admin for non performing users
      if (users) {
        sendPushNotification(users.user_id, PushNotifications.nonPerformingUsers(), users.fcm_token);
      }
    
      if (admin) {
        sendNotificationToAdmin(admin.admin_id, 'Non-Performing Loans', 
          adminNotification.nonPerformingLoans(), `${config.SEEDFI_ADMIN_WEB_BASE_URL}/to_add_path_from_frontend`, 'Non-Performing-Loans');
      }
    }
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully sent  notification to admin and users nonPerformingLoans.controllers.cron.js`);
    return ApiResponse.success(res, enums.NON_PERFORMING_LOANS, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.NON_PERFORMING_LOANS_CONTROLLER;
    logger.error(`Sending notification failed::${enums.NON_PERFORMING_LOANS_CONTROLLER}`, error.message);
    return next(error);
  }
};
