import { db } from '../../../users/config/db';
import * as enums from '../../../users/lib/enums/lib.enum.labels';
import dayjs from 'dayjs';
import loanQueries from '../queries/queries.loan';

/**
 * Process db.any calls to the database
 * @param {String} query - The request from the endpoint.
 * @param {{ticket_status: *, ticket_name, insurance_coverage, processing_fee: (string|*),
 *  ticket_image_url, ticket_description}} payload - The response returned by the method.
 * @returns { Promise<JSON> } - A Promise response with the queried data or no data
 * @memberof AdminPostgresDbService
 */
export const processAnyData = (query, payload) => db.any(query, payload);

/**
 * Process db.none calls to the database
 * @param {String} query - The request from the endpoint.
 * @param {Array} payload - The response returned by the method.
 * @returns { Promise<JSON> } - no queried value
 * @memberof AdminPostgresDbService
 */
export const processNoneData = (query, payload) => db.none(query, payload);

/**
 * Process db.oneOrNone calls to the database
 * @param {String} query - The request from the endpoint.
 * @param {(*|number)[]} payload - The response returned by the method.
 * @returns { Promise<JSON> } - A Promise response with the queried data or no data
 * @memberof AdminPostgresDbService
 */
export const processOneOrNoneData = (query, payload) => db.oneOrNone(query, payload);

export const updatePayment = async(userId, loanId, amountPaid, paymentDate, loanApplication) => {
  let paymentSchedules = await processAnyData(loanQueries.fetchLoanRepaymentSchedule, [ loanId ]);
  logger.info(`${enums.CURRENT_TIME_STAMP}, :::Info: fetched user payment schedule successfully
    updatePayment.admin.service.loan.js`);
  const amountToDeduct = parseFloat(amountPaid);

  const paymentUpdateResult = await db.tx(async(t) => {
    const paymentRecord = await t.one(loanQueries.recordPayment, [ userId, loanId, amountPaid, paymentDate ]);
    const totalOutstanding = parseFloat(loanApplication.total_repayment_amount);
    paymentSchedules.sort(
      (a, b) => a.repayment_order - b.repayment_order
    );

    let updatedSchedule;
    let updateLoanStatus;
    let sumOfPaymentsRecordedOnPaymentSchedules;
    for (let index = 0; index < paymentSchedules.length; index++) {
      const schedule = paymentSchedules[index];
                
      if (schedule.status === 'paid') {
        continue;
      }
      if (amountPaid == 0) break;

      if (parseFloat(schedule.total_payment_amount) - parseFloat(schedule.amount_paid) > 0) {
        const amountToPay = parseFloat(schedule.total_payment_amount) - parseFloat(schedule.amount_paid);

        if (parseFloat(amountPaid) >= parseFloat(amountToPay)) {
          amountPaid = parseFloat(amountPaid) - parseFloat(amountToPay);
          updatedSchedule = await t.none(loanQueries.updateScheduleStatus, [ schedule.id, paymentDate, 
            (parseFloat(schedule.amount_paid) +  parseFloat(amountToPay)),  'paid' ]);
        } else {
          updatedSchedule = await t.none(
            loanQueries.updateScheduleStatus, [ schedule.id, paymentDate, (parseFloat(schedule.amount_paid) + parseFloat(amountPaid)), schedule.status ]
          );
          amountPaid = 0;
        }
      }
      sumOfPaymentsRecordedOnPaymentSchedules = await t.one(loanQueries.sumOfPaymentsRecordedOnPaymentSchedules, [ userId, loanId ]);         
      if (parseFloat(sumOfPaymentsRecordedOnPaymentSchedules.total_recorded_amount_paid).toFixed(2) == parseFloat(totalOutstanding).toFixed(2)) {
        await t.none(loanQueries.updateScheduleStatusToPaid, loanId);
        updateLoanStatus = await t.one(loanQueries.updateLoanStatusToComplete, [ loanId, userId, dayjs(paymentDate).format('YYYY-MM-DD HH:mm:ss') ]);
      }
    }
    await t.one(loanQueries.updateLoanOutstandingAmount, [ loanId, userId, amountToDeduct ]);

    return t.batch([
      paymentRecord,
      updatedSchedule,
      sumOfPaymentsRecordedOnPaymentSchedules,
      updateLoanStatus
    ]);

  });
  return {
    payment_record: paymentUpdateResult[0],
    total_paid: paymentUpdateResult[2],
    updated_loan_status: paymentUpdateResult[3]
  };
};




