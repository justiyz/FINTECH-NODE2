import { parsePhoneNumber } from 'awesome-phonenumber';
import { processOneOrNoneData, processAnyData } from '../services/services.db';
import ApiResponse from '../../lib/http/lib.http.responses';
import enums from '../../lib/enums';
import loanMandateQueries from '../queries/queries.recova';
import userQueries from '../queries/queries.user';
import loanQueries from '../queries/queries.loan';
import * as Hash from '../../lib/utils/lib.util.hash';
import * as zeehService from '../services/services.zeeh';
import * as recovaService from '../services/services.recova';
import dayjs from 'dayjs';
import config from '../../config';
import { generateLoanRepaymentSchedule } from '../../lib/utils/lib.util.helpers';

/**
 * update user device fcm token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the users updated fcm token
 * @memberof RecovaController
 */
export const fetchLoanDueAmount = async (req, res, next) => {
  try {
    const { loanDetails } = req;
    // TODO: return amount all next repayments that is over - due for the loan
    const [nextLoanRepaymentDetails] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [loanDetails.loan_id, loanDetails.user_id]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Recova:::Info: user loan repayment details fetched fetchLoanDueAmount.controllers.recova.js`);

    if (!nextLoanRepaymentDetails) return ApiResponse.error(res, 'No next repayment', enums.HTTP_BAD_REQUEST, enums.FETCH_LOAN_DUE_AMOUNT_CONTROLLER);

    const amountDue = nextLoanRepaymentDetails.status == 'over due' ? nextLoanRepaymentDetails.total_payment_amount : 0;
    const data = {
      loanReference: loanDetails.loan_id,
      amountDue: amountDue,
    };
    return ApiResponse.json(res, enums.LOAN_DUE_AMOUNT_FETCHED_SUCCESSFULLY, enums.HTTP_OK, data);
  } catch (error) {
    error.label = enums.FETCH_LOAN_DUE_AMOUNT_CONTROLLER;
    logger.error(`Fetch loan due amount failed::${enums.FETCH_LOAN_DUE_AMOUNT_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update user device fcm token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the users updated fcm token
 * @memberof RecovaController
 */
export const handleMandateCreated = async (req, res, next) => {
  try {
    const { loanDetails } = req;
    const data = ['confirmed', loanDetails.loan_id];
    await processOneOrNoneData(loanMandateQueries.updateLoanMandateRequestStatus, data);
    return ApiResponse.json(res, enums.MANDATE_CREATED_SUCCESSFULLY, enums.HTTP_OK, {});
  } catch (error) {
    error.label = enums.HANDLE_MANDATE_CREATED_CONTROLLER;
    logger.error(`Handle mandate created failed::${enums.HANDLE_MANDATE_CREATED_CONTROLLER}`, error.message);
    return next(error);
  }
};

/**
 * update user device fcm token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the users updated fcm token
 * @memberof RecovaController
 */
export const loanBalanceUpdate = async (req, res, next) => {
  try {
    // TODO: split debitedAmount into the next repayments
    const {
      body: { institutionCode, loanReference, debitedAmount, recoveryFee, settlementAmount, TransactionReference, narration },
      loanDetails,
    } = req;

    const [checkIfUserOnClusterLoan] = await processAnyData(loanQueries.checkUserOnClusterLoan, [loanDetails.user_id]);

    const [nextRepayment] = await processAnyData(loanQueries.fetchLoanNextRepaymentDetails, [loanDetails.loan_id, loanDetails.user_id]);
    const outstandingRepaymentCount = await processOneOrNoneData(loanQueries.existingUnpaidRepayments, [loanDetails.loan_id, loanDetails.user_id]);
    logger.info(`${enums.CURRENT_TIME_STAMP}, Recova:::Info: fetched next repayment details and the count for all outstanding repayments
    processPersonalLoanRepayments.middlewares.payment.js`);

    let statusType = Number(outstandingRepaymentCount.count) > 1 ? 'ongoing' : 'completed';

    const paymentDescriptionType = Number(outstandingRepaymentCount.count) > 1 ? 'part loan repayment' : 'full loan repayment';
    const completedAtType = statusType === 'completed' ? dayjs().format('YYYY-MM-DD HH:mm:ss') : null;

    // total outstanding repayment amount

    await Promise.all([
      processAnyData(loanQueries.updatePersonalLoanPaymentTable, [
        loanDetails.user_id,
        loanDetails.loan_id,
        parseFloat(debitedAmount / 100),
        'debit',
        loanDetails.loan_reason,
        paymentDescriptionType,
        'recova loan balance update',
      ]),
      processAnyData(loanQueries.updateNextLoanRepayment, [nextRepayment.loan_repayment_id]),
      processAnyData(loanQueries.updateLoanWithRepayment, [loanDetails.loan_id, loanDetails.user_id, statusType, parseFloat(debitedAmount / 100), completedAtType]),
    ]);

    logger.info(`Recova:::Info: loan, loan repayment and payment details updated successfully
    processPersonalLoanRepayments.middlewares.payment.js`);
    if (checkIfUserOnClusterLoan) {
      const statusChoice = checkIfUserOnClusterLoan.loan_status === 'active' ? 'active' : 'over due';
      await processOneOrNoneData(loanQueries.updateUserLoanStatus, [loanDetails.user_id, statusChoice]);
      logger.info('Recova:::Info: user loan status set to active processPersonalLoanRepayments.middlewares.payment.js');
    }
    if (!checkIfUserOnClusterLoan) {
      const statusOption = statusType === 'ongoing' ? 'active' : 'inactive';
      await processOneOrNoneData(loanQueries.updateUserLoanStatus, [loanDetails.user_id, statusOption]);
      logger.info('Recova:::Info: user loan status set to active processPersonalLoanRepayments.middlewares.payment.js');
    }

    return ApiResponse.json(res, enums.LOAN_BALANCE_UPDATED_SUCCESSFULLY, enums.HTTP_OK, {});
  } catch (error) {
    error.label = enums.LOAN_BALANCE_UPDATE_CONTROLLER;
    logger.error(`Handle mandate created failed::${enums.LOAN_BALANCE_UPDATE_CONTROLLER}`, error.message);
    return next(error);
  }
};

export const loanBalanceUpdateAlgo = async (req, res, next) => {
  const {
    body: { institutionCode, loanReference, debitedAmount, recoveryFee, settlementAmount, TransactionReference, narration },
    loanDetails,
  } = req;

  const unCompletedRepayments = await processAnyData(loanQueries.fetchExistingUnpaidRepayments, [req.loanDetails.loan_id, req.loanDetails.user_id]);
  const sumExistingUnpaidRepayments = await processOneOrNoneData(loanQueries.sumExistingUnpaidRepayments, [req.loanDetails.loan_id, req.loanDetails.user_id]);
  let outstanding = parseFloat(loanDetails.total_outstanding_amount);
  let payment = parseFloat(debitedAmount);
  const paidRepaymentNotInRecord = parseFloat(sumExistingUnpaidRepayments.sum) - outstanding;

  let currentRepaymentIndex = 0;
  let currentRepayment = parseFloat(unCompletedRepayments[currentRepaymentIndex].total_payment_amount) - paidRepaymentNotInRecord;
  outstanding = outstanding - payment; // new total outstanding amount
  let fullyPaidRepayments = [];

  while (payment > 0 && currentRepaymentIndex < unCompletedRepayments.length) {
    if (payment >= currentRepayment) {
      fullyPaidRepayments.push(unCompletedRepayments[currentRepaymentIndex].loan_repayment_id);
    }
    payment = payment - currentRepayment;
    currentRepaymentIndex++;
    if (currentRepaymentIndex < unCompletedRepayments.length) {
      currentRepayment = parseFloat(unCompletedRepayments[currentRepaymentIndex].total_payment_amount);
    }
  }

  const statusType = outstanding > 0 ? 'ongoing' : 'completed';
  const completedAtType = statusType === 'completed' ? dayjs().format('YYYY-MM-DD HH:mm:ss') : null;
  const paymentDescriptionType = outstanding > 0 ? 'part loan repayment' : 'full loan repayment';

  await Promise.all([
    statusType === 'completed' ? await recovaService.cancelMandate(loanDetails.loan_id) : null,
    processAnyData(loanQueries.updatePersonalLoanPaymentTable, [
      loanDetails.user_id,
      loanDetails.loan_id,
      parseFloat(debitedAmount),
      'debit',
      loanDetails.loan_reason,
      paymentDescriptionType,
      'recova loan balance update',
    ]),
    processAnyData(loanQueries.updateFullyPaidLoanRepayment, [fullyPaidRepayments]),
    processAnyData(loanQueries.updateLoanWithRepayment, [loanDetails.loan_id, loanDetails.user_id, statusType, parseFloat(debitedAmount), completedAtType]),
  ]);

  logger.info(`Recova:::Info: loan, loan repayment and payment details updated successfully
    processPersonalLoanRepayments.middlewares.payment.js`);

  const [checkIfUserOnClusterLoan] = await processAnyData(loanQueries.checkUserOnClusterLoan, [loanDetails.user_id]);

  if (checkIfUserOnClusterLoan) {
    const statusChoice = checkIfUserOnClusterLoan.loan_status === 'active' ? 'active' : 'over due';
    await processOneOrNoneData(loanQueries.updateUserLoanStatus, [loanDetails.user_id, statusChoice]);
    logger.info('Recova:::Info: user loan status set to active processPersonalLoanRepayments.middlewares.payment.js');
  }
  if (!checkIfUserOnClusterLoan) {
    const statusOption = statusType === 'ongoing' ? 'active' : 'inactive';
    await processOneOrNoneData(loanQueries.updateUserLoanStatus, [loanDetails.user_id, statusOption]);
    logger.info('Recova:::Info: user loan status set to active processPersonalLoanRepayments.middlewares.payment.js');
  }

  return ApiResponse.json(res, enums.LOAN_BALANCE_UPDATED_SUCCESSFULLY, enums.HTTP_OK, {});
};

/**
 * update user device fcm token
 * @param {Request} req - The request from the endpoint.
 * @param {Response} res - The response returned by the method.
 * @param {Next} next - Call the next operation.
 * @returns { JSON } - A JSON with the users updated fcm token
 * @memberof RecovaController
 */

export const createMandateConsentRequest = async (req, res, next) => {
  const {
    body: { loan_id },
    loanDetails,
    user,
  } = req;
  try {
    const [userDetails] = await processAnyData(userQueries.fetchAllDetailsBelongingToUser, [user.user_id]);

    const exisitingLoanRepaymentDetails = await processAnyData(loanQueries.fetchLoanRepaymentScheduleForMandate, [loanDetails.loan_id, user.user_id]);
    if (exisitingLoanRepaymentDetails.length > 0) {
      const mandate = await processOneOrNoneData(loanMandateQueries.getLoanMandateByLoanId, [loanDetails.loan_id]);
      if (mandate) return ApiResponse.success(res, enums.CONSENT_REQUEST_INITIATED_SUCCESSFULLY, enums.HTTP_OK, mandate);

      await processAnyData(loanQueries.deleteLoanRepaymentScheduleForMandate, loanDetails.loan_id);

      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: User previouly created temporary loan schedule loan createMandateConsentRequest.controller.recova.js`);
      // return ApiResponse.error(res, enums.MANDATE_ALREADY_ACCEPTED, enums.HTTP_BAD_REQUEST, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
    }

    const repaymentSchedule = await generateLoanRepaymentSchedule(loanDetails, user.user_id);

    const loanRepaymentDetails = await Promise.all(
      repaymentSchedule.map(async schedule => {
        return await processOneOrNoneData(loanQueries.updatePreDisbursementLoanRepaymentSchedule, [
          schedule.loan_id,
          schedule.user_id,
          schedule.repayment_order,
          schedule.principal_payment,
          schedule.interest_payment,
          schedule.fees,
          schedule.total_payment_amount,
          schedule.pre_payment_outstanding_amount,
          schedule.post_payment_outstanding_amount,
          schedule.proposed_payment_date,
          schedule.proposed_payment_date,
        ]);
      })
    );

    // repaymentSchedule.forEach(async schedule => {
    //   await processOneOrNoneData(loanQueries.updatePreDisbursementLoanRepaymentSchedule, [
    //     schedule.loan_id,
    //     schedule.user_id,
    //     schedule.repayment_order,
    //     schedule.principal_payment,
    //     schedule.interest_payment,
    //     schedule.fees,
    //     schedule.total_payment_amount,
    //     schedule.pre_payment_outstanding_amount,
    //     schedule.post_payment_outstanding_amount,
    //     schedule.proposed_payment_date,
    //     schedule.proposed_payment_date,
    //   ]);

    //   return schedule;
    // });
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user pre disbursement loan repayment details saved createMandateConsentRequest.controllers.recova.js`);

    // const loanRepaymentDetails = await processAnyData(loanQueries.fetchLoanRepaymentScheduleForMandate, [loanDetails.loan_id, user.user_id]);

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user loan repayment details fetched createMandateConsentRequest.controllers.recova.js`);
    const [accountDetails] = await processAnyData(loanQueries.fetchBankAccountDetailsByUserIdForMandate, user.user_id);
    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's default account details fetched successfully createMandateConsentRequest.controller.recova.js`);
    if (!accountDetails) {
      logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user does not have a default account createMandateConsentRequest.controller.recova.js`);
      return ApiResponse.error(res, enums.COMMERCIAL_BANK_REQUIRED, enums.HTTP_BAD_REQUEST, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
    }

    if (accountDetails.bank_code.length > 3) {
      logger.info(
        `${enums.CURRENT_TIME_STAMP}, ${user.user_id}
        :::Info: user bank account code ${accountDetails.bank_code} is not a commercial bank code createMandateConsentRequest.controller.recova.js`
      );
      return ApiResponse.error(res, enums.COMMERCIAL_BANK_REQUIRED, enums.HTTP_BAD_REQUEST, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
    }

    const totalRepayment = loanRepaymentDetails.reduce((acc, repayment) => {
      return acc + parseFloat(repayment.total_payment_amount);
    }, 0);

    const collectionPaymentSchedules = await loanRepaymentDetails.map(repayment => {
      return {
        repaymentDate: repayment.proposed_payment_date,
        repaymentAmountInNaira: parseFloat(repayment.total_payment_amount),
      };
    });
    const bvn = await Hash.decrypt(decodeURIComponent(userDetails.bvn));

    // const bvnData = await zeehService.zeehBVNVerificationCheck(bvn.trim(), {});

    // if (bvnData.status !== 'success') {
    //   logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's bvn verification failed createMandateConsentRequest.controller.recova.js`);

    //   return ApiResponse.error(res, 'Unable to process bvn', enums.HTTP_BAD_REQUEST, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
    // }
    const pn = parsePhoneNumber(userDetails.phone_number, { regionCode: 'NG' });
    if (!pn.valid) {
      logger.error(`${enums.CURRENT_TIME_STAMP}, Guest:::Info: user's  phone number is invalid  createMandateConsentRequest.controller.user.js`);
      return ApiResponse.error(res, 'Invalid phone number', enums.HTTP_BAD_REQUEST, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
    }
    const data = {
      bvn: bvn,
      businessRegistrationNumber: 'string',
      taxIdentificationNumber: 'string',
      loanReference: loanDetails.loan_id,
      customerID: userDetails.id,
      customerName: `${userDetails.first_name || ''} ${userDetails.middle_name || ''} ${userDetails.last_name || ''}`,
      customerEmail: userDetails.email,
      phoneNumber: pn.number.national.replace(/\s+/g, ''),
      loanAmount: loanDetails.amount_requested,
      totalRepaymentExpected: parseFloat(totalRepayment).toFixed(2),
      loanTenure: loanDetails.loan_tenor_in_months,
      linkedAccountNumber: accountDetails.account_number,
      repaymentType: 'Collection',
      preferredRepaymentBankCBNCode: accountDetails.bank_code,
      preferredRepaymentAccount: accountDetails.account_number,
      collectionPaymentSchedules: collectionPaymentSchedules,
    };

    logger.info(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's mandate data collated successfully createMandateConsentRequest.controller.recova.js`);
    const result = await recovaService.createConsentRequest(data);
    logger.info(
      `${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: user's mandate saved on recova external endpoint successfully createMandateConsentRequest.controller.recova.js`
    );

    if (result.requestStatus.toLowerCase() === 'awaitingconfirmation') {
      const mandate = await processOneOrNoneData(loanMandateQueries.initiateLoanMandate, [
        loanDetails.loan_id,
        config.SEEDFI_RECOVA_INSTITUTION_CODE,
        result.requestStatus.toLowerCase(),
        result.consentConfirmationUrl,
      ]);
      return ApiResponse.success(res, enums.CONSENT_REQUEST_INITIATED_SUCCESSFULLY, enums.HTTP_OK, mandate);
    }

    return ApiResponse.error(res, 'Unable to save initiated consent request', enums.HTTP_BAD_REQUEST, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
  } catch (error) {
    logger.error(`${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Error: ${error.message} createMandateConsentRequest.controller.recova.js`);
    await processAnyData(loanQueries.deleteRecentlyCreatedLoanRepaymentScheduleForMandate, loanDetails.loan_id);
    logger.info(
      `${enums.CURRENT_TIME_STAMP}, ${user.user_id}:::Info: recently create repayment schedule rollback and deleted  successfully createMandateConsentRequest.controller.recova.js`
    );
    return ApiResponse.error(res, 'Unable to initiate consent request', enums.HTTP_INTERNAL_SERVER_ERROR, enums.CREATE_MANDATE_CONSENT_REQUEST_CONTROLLER);
  }
};
