import { v4 as uuidv4 } from 'uuid';
import cronQueries from '../queries/queries.cron';
import loanQueries from '../queries/queries.loan';
import userQueries from '../queries/queries.user';
import { processAnyData, processOneOrNoneData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import { userActivityTracking } from '../../lib/monitor';
import { initializeDebitCarAuthChargeForLoanRepayment } from '../services/service.paystack';
import { sendUserPersonalNotification, sendPushNotification, sendNotificationToAdmin } from '../services/services.firebase';
import * as PushNotifications from '../../lib/templates/pushNotification';
import * as PersonalNotifications from '../../lib/templates//personalNotification';
import MailService from '../services/services.email';
import notificationQueries from '../queries/queries.notification';
import * as adminNotification from '../../lib/templates/adminNotification';


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
    const distinctLoanApplications = [ ...new Map(overDueLoanRepayments.map(repayment => [ repayment[key], repayment ])).values() ];
    await Promise.all([ distinctLoanApplications ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the unique values have been filtered apart updateLoanStatusToOverdue.controllers.cron.js`);
    await Promise.all([
      distinctLoanApplications.map(async(application) => {
        const [ nextRepayment ] = await processAnyData(cronQueries.fetchLoanNextRepayment, [ application.loan_id, application.user_id ]);
        await processOneOrNoneData(cronQueries.updateNextLoanRepaymentOverdue, [ nextRepayment.loan_repayment_id ]);
        await processOneOrNoneData(cronQueries.updateLoanWithOverDueStatus, [ application.loan_id, application.user_id ]);
        await processOneOrNoneData(cronQueries.updateUserLoanStatusOverDue, [ application.user_id ]);
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
 * update user cluster loan status to overdue
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the updated statuses
 * @memberof CronController
 */
export const updateClusterLoanStatusToOverdue = async(req, res, next) => {
  try {
    const overDueLoanRepayments = await processAnyData(cronQueries.fetchAllOverdueClusterLoanRepayments, []);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: all cluster loan repayments that have passed the current date fetched from the database 
    updateClusterLoanStatusToOverdue.controllers.cron.js`);
    const key = 'member_loan_id';
    const distinctLoanApplications = [ ...new Map(overDueLoanRepayments.map(repayment => [ repayment[key], repayment ])).values() ];
    await Promise.all([ distinctLoanApplications ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: the unique values have been filtered apart updateClusterLoanStatusToOverdue.controllers.cron.js`);
    await Promise.all([
      distinctLoanApplications.map(async(application) => {
        const [ nextRepayment ] = await processAnyData(cronQueries.fetchClusterLoanNextRepayment, [ application.member_loan_id, application.user_id ]);
        await processOneOrNoneData(cronQueries.updateNextClusterLoanRepaymentOverdue, [ nextRepayment.loan_repayment_id ]);
        await processOneOrNoneData(cronQueries.updateClusterLoanWithOverDueStatus, [ application.member_loan_id, application.user_id ]);
        await processOneOrNoneData(cronQueries.updateUserLoanStatusOverDue, [ application.user_id ]);
        await processOneOrNoneData(cronQueries.updateClusterMemberClusterLoanStatusOverDue, [ application.cluster_id, application.user_id ]);
        await processOneOrNoneData(cronQueries.updateGeneralClusterLoanStatusOverDue, [ application.cluster_id ]);
        await processOneOrNoneData(cronQueries.recordCronTrail, [ application.user_id, 'ODLNSETOD', 'user cluster loan repayment is past and loan status set to over due' ]);
        userActivityTracking(application.user_id, 78, 'success');
        return application;
      })
    ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully updated cluster loans that are over due to over due in the database 
    updateClusterLoanStatusToOverdue.controllers.cron.js`);
    return ApiResponse.success(res, enums.USER_LOAN_STATUS_OVERDUE, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_CLUSTER_LOAN_STATUS_TO_OVERDUE_CONTROLLER;
    logger.error(`updating users cluster loan status to over due failed::${enums.UPDATE_CLUSTER_LOAN_STATUS_TO_OVERDUE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * initiate cluster loan repayment for user
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the initiated payments
 * @memberof CronController
 */
export const initiateClusterLoanRepayment = async(req, res, next) => {
  try {
    const dueForPaymentClusterLoanRepayments = await processAnyData(cronQueries.fetchAllQualifiedClusterLoanRepayments, [ Number(7) ]);
    // still try to automatically debit until after 7 days proposed loan repayment date passes
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: all luster loan repayments that have passed the current date fetched from the database 
    initiateClusterLoanRepayment.controllers.cron.js`);
    await Promise.all([
      dueForPaymentClusterLoanRepayments.map(async(clusterRepayment) => {
        const [ user ] = await processAnyData(userQueries.getUserByUserId, [ clusterRepayment.user_id ]);
        const [ userDebitCardDetails ] = await processAnyData(cronQueries.fetchUserSavedDebitCardsToken, [ clusterRepayment.user_id ]);
        const reference = uuidv4();
        const paystackAmountFormatting = parseFloat(clusterRepayment.total_payment_amount) * 100; // Paystack requires amount to be in kobo for naira payment
        await processAnyData(loanQueries.initializeBankTransferPayment, [ clusterRepayment.user_id, parseFloat(clusterRepayment.total_payment_amount), 'paystack', reference,
          'automatic_cluster_loan_repayment', 'user repays part of or all of existing cluster loan facility automatically via card', clusterRepayment.member_loan_id ]);
        const result = await initializeDebitCarAuthChargeForLoanRepayment(user, paystackAmountFormatting, reference, userDebitCardDetails);
        // the first in the array is the default card, if no default card, use the next tokenized card
        if (result.status === true && result.message.trim().toLowerCase() === 'charge attempted' && result.data.status === 'success') {
          logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: cluster loan repayment via paystack initialized 
          initiateClusterLoanRepayment.controllers.cron.js`);
          await processOneOrNoneData(cronQueries.recordCronTrail, [ user.user_id, 'LNRPTCDIN', 'user next cluster loan repayment initiated' ]);
          userActivityTracking(user.user_id, 79, 'success');
          return clusterRepayment;
        }
        await MailService('Failed card debiting', 'failedCardDebit', { ...user, ...userDebitCardDetails, ...clusterRepayment }),
        sendPushNotification(user.user_id, PushNotifications.failedCardDebit, user.fcm_token);
        sendUserPersonalNotification(user, `${user.name} Failed card debiting`, PersonalNotifications.failedCardDebit({ ...userDebitCardDetails, ...clusterRepayment }),
          'failed-card-debit', { ...clusterRepayment });
        return clusterRepayment;
      })
    ]);
    return ApiResponse.success(res, enums.DUE_FOR_PAYMENT_LOAN_REPAYMENT_INITIATED, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.INITIATE_CLUSTER_LOAN_REPAYMENT_CONTROLLER;
    logger.error(`initiating cluster loan repayment for loan repayments which are due for repayment 
    failed::${enums.INITIATE_CLUSTER_LOAN_REPAYMENT_CONTROLLER}`, error.message);
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
    initiateLoanRepayment.controllers.cron.js`);
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
          initiateLoanRepayment.controllers.cron.js`);
          await processOneOrNoneData(cronQueries.recordCronTrail, [ user.user_id, 'LNRPTCDIN', 'user next loan repayment initiated' ]);
          userActivityTracking(user.user_id, 79, 'success');
          return repayment;
        }
        await MailService('Failed card debiting', 'failedCardDebit', { ...user, ...userDebitCardDetails, ...repayment }),
        sendPushNotification(user.user_id, PushNotifications.failedCardDebit, user.fcm_token);
        sendUserPersonalNotification(user, `${user.name} Failed card debiting`, PersonalNotifications.failedCardDebit({ ...userDebitCardDetails, ...repayment }),
          'failed-card-debit', { ...repayment });
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
 * updates promo status to active
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON successful response
 * @memberof CronController
 */
export const updatesPromoStatusToActive = async(req, res, next) => {
  try {
    await processAnyData(cronQueries.updatePromoStatusToActive);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: certain inactive promos in the database has been made active
      updatesPromoStatusToActive.controllers.cron.js`);
    await processOneOrNoneData(cronQueries.recordCronTrail, [ null, 'UPRMSTACT', 'update promo status to active' ]);
    return ApiResponse.success(res, enums.PROMO_DUE_TO_START, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_PROMO_STATUS_TO_ACTIVE_CONTROLLER;
    logger.error(`updating promo status to active failed::${enums.UPDATE_PROMO_STATUS_TO_ACTIVE_CONTROLLER}`, error.message);
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
export const nonPerformingPersonalLoans = async(req, res, next) => {
  try {
    const nplGraceDay = await processOneOrNoneData(notificationQueries.fetchAdminSetEnvDetails, [ 'npl_overdue_past' ]);
    const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'loan application' ]);
    const nonPerformingUsers = await processAnyData(notificationQueries.nonPerformingLoans, [ Number(nplGraceDay.value) ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}::Info: successfully fetched loan application admin and non performing users from the db nonPerformingLoans.controllers.loan.js`);

    const userName = [];
    await nonPerformingUsers.map((user, admin) => {
      const adminUsers = admins[admin];
      userName.push(user.user_name);
      if (user) {
        sendPushNotification(user.user_id, PushNotifications.nonPerformingUsers(), user.fcm_token);
        sendUserPersonalNotification(user, 'Loan Overdue', PushNotifications.nonPerformingUser(), 'non-performing-user');
      }
      if (adminUsers) {
        sendNotificationToAdmin(adminUsers.admin_id, 'Non-Performing Users Loan',
          adminNotification.nonPerformingPersonalLoans(userName), userName, 'non-performing-loans');
      }
    });
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully sent  notification to admin and users nonPerformingLoans.controllers.cron.js`);
    await processOneOrNoneData(cronQueries.recordCronTrail, [ null, 'SNPLNNTADM', 'send non performing loan notifications to admins' ]);
    return ApiResponse.success(res, enums.NON_PERFORMING_LOANS, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.NON_PERFORMING_LOANS_CONTROLLER;
    logger.error(`Sending non performing personal loans notification failed::${enums.NON_PERFORMING_LOANS_CONTROLLER}`, error.message);
    return next(error);
  }
};




/**
 * notify admin for non performing clusters
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON successful response
 * @memberof CronController
 */
export const nonPerformingClusterLoans = async(req, res, next) => {
  try {
    const nplGraceDay = await processOneOrNoneData(notificationQueries.fetchAdminSetEnvDetails, [ 'npl_overdue_past' ]);
    const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'loan application' ]);
    const nonPerformingClusters = await processAnyData(notificationQueries.nonPerformingClusterLoans, [ Number(nplGraceDay.value) ]);

    logger.info(`${enums.CURRENT_TIME_STAMP}::Info: successfully fetched loan application admin and non-performing users from the db nonPerformingLoans.controllers.loan.js`);

    for (const [ admin, cluster ] of admins) {
      const adminId = [ admin.admin_id ];
      const clusterNames = nonPerformingClusters[cluster].names;
      sendNotificationToAdmin(adminId, 'Non-Performing Cluster Loans', adminNotification.nonPerformingPersonalLoans(), clusterNames, 'non-performing-loans');
    }

    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: successfully sent notification to admin and users nonPerformingLoans.controllers.cron.js`);
    await processOneOrNoneData(cronQueries.recordCronTrail, [ null, 'SNPLNNTADM', 'send non-performing loan notifications to admins' ]);
    return ApiResponse.success(res, enums.NON_PERFORMING_LOANS, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.NON_PERFORMING_LOANS_CONTROLLER;
    logger.error(`Sending notification failed::${enums.NON_PERFORMING_LOANS_CONTROLLER}`, error.message);
    return next(error);
  }
};


/**
 * updates promo status to ended
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the initiated payments
 * @memberof CronController
 */
export const updatesPromoStatusToEnded = async(req, res, next) => {
  try {
    await processAnyData(cronQueries.updatePromoStatusToEnded);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Info: certain active promos in the database has been made to end updatesPromoStatusToEnded.controllers.cron.js`);
    await processOneOrNoneData(cronQueries.recordCronTrail, [ null, 'UPRMSTAEND', 'update promo status to ended' ]);
    return ApiResponse.success(res, enums.PROMO_DUE_TO_END, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.UPDATE_PROMO_STATUS_TO_ACTIVE_CONTROLLER;
    logger.error(`updating promo status to active failed::${enums.UPDATE_PROMO_STATUS_TO_ACTIVE_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * promo ending soon admin notification
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with success response 
 * @memberof CronController
 */
export const promoEndingSoonNotification = async(req, res, next) => {
  try {
    const admins = await processAnyData(notificationQueries.fetchAdminsForNotification, [ 'settings' ]);
    const [ promo ] = await processAnyData(notificationQueries.fetchEndingPromo, [ 'settings' ]);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info: successfully fetched promo and admins for notification promoEndingSoonNotification.controllers.cron.js`);
    await admins.map((admin) => {
      sendNotificationToAdmin(admin.admin_id, 'Admin Promo Ending Soon', adminNotification.promoEndingSoonNotification(`${promo.name}`), 'ending-promo');
    });
    await processOneOrNoneData(cronQueries.recordCronTrail, [ null, 'SPESNTADM', 'send promo ending soon notification to admins' ]);
    return ApiResponse.success(res, enums.PROMO_NOTIFICATION, enums.HTTP_OK);
  } catch (error) {
    error.label = enums.PROMO_ENDING_SOON_NOTIFICATION_CONTROLLER;
    logger.error(`promo notification failed:::${enums.PROMO_ENDING_SOON_NOTIFICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update alert notification 
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with success response 
 * @memberof CronController
 */
export const updateAlertNotification = async(req, res, next) => {
  try {
    const data = await processAnyData(userQueries.updateAlertNotification, []);
    logger.info(`${enums.CURRENT_TIME_STAMP}:::Info:: successfully fetched alert notification from the DB. fetchAlertNotification.controller.cron.js`);
    await processOneOrNoneData(cronQueries.recordCronTrail, [ null, 'SANTEND', 'set alert notifications to ended' ]);
    return ApiResponse.success(res, enums.UPDATE_ALERT_NOTIFICATION, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.UPDATE_ALERT_NOTIFICATION_CONTROLLER;
    logger.error(`Fetching alert notification failed:::${enums.UPDATE_ALERT_NOTIFICATION_CONTROLLER}`, error.message);
    return next(error);
  }
};
