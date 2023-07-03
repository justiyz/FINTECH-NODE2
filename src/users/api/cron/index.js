import cron from 'node-cron';import { updateLoanStatusToOverdue, initiateLoanRepayment, nonPerformingLoans,
  updatesPromoStatusToActive, updatesPromoStatusToEnded, updateClusterLoanStatusToOverdue, initiateClusterLoanRepayment, promoNotification
} from '../../api/controllers/controller.cron';

function CreateSchedule(time, task, zone) {
  return cron.schedule(time, task, zone);
}

const updateUsersPersonalLoanToOverdue = CreateSchedule('0 0,17 * * *', () => updateLoanStatusToOverdue(), {
  scheduled: true,
  timezone: 'Africa/Lagos'
}); // runs every 12:00am and 05:00pm

const updateUsersClusterLoanToOverdue = CreateSchedule('0 0,17 * * *', () => updateClusterLoanStatusToOverdue(), {
  scheduled: true,
  timezone: 'Africa/Lagos'
}); // runs every 12:00am and 05:00pm

const automaticallyDebitUserForClusterLoanRepayment = CreateSchedule('0 4,18 * * *', () => initiateClusterLoanRepayment(), {
  scheduled: true,
  timezone: 'Africa/Lagos'
}); // runs every 04:00am and 06:00pm

const automaticallyDebitUserForLoanRepayment = CreateSchedule('0 4,18 * * *', () => initiateLoanRepayment(), {
  scheduled: true,
  timezone: 'Africa/Lagos'
}); // runs every 04:00am and 06:00pm

const nonPerformingUsersLoan = CreateSchedule('0 9 * * *', () => nonPerformingLoans(), {
  scheduled: true,
  timezone: 'Africa/Lagos'
}); // runs every 09:00am

const updatePromoStatusToActive = CreateSchedule('0 1, * * *', () => updatesPromoStatusToActive(), {
  scheduled: true,
  timezone: 'Africa/Lagos'
}); // runs every 01:00am 

const PromoEndDateNotification = CreateSchedule('0 9 * * *', () => promoNotification(), {
  scheduled: true,
  timezone: 'Africa/Lagos'
}); // runs every 09:00am 

const updatePromoStatusToEnded = CreateSchedule('0 1, * * *', () => updatesPromoStatusToEnded(), {
  scheduled: true,
  timezone: 'Africa/Lagos'
}); // runs every 01:00am 


export const scheduleList = [ updateUsersPersonalLoanToOverdue, automaticallyDebitUserForLoanRepayment, nonPerformingUsersLoan,
  updatePromoStatusToActive, updatePromoStatusToEnded, updateUsersClusterLoanToOverdue, automaticallyDebitUserForClusterLoanRepayment, PromoEndDateNotification ];

export const RunSchedules = async(schedules = []) => {
  const promises = [];
  for (const schedule of schedules) {
    promises.push(schedule.start());
  }
  await Promise.all(promises);
};
