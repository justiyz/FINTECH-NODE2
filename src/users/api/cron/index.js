import cron from 'node-cron';
import { updateLoanStatusToOverdue, initiateLoanRepayment } from '../../api/controllers/controller.cron';

function CreateSchedule(time, task, zone) {
  return cron.schedule(time, task, zone);
}

const updateUsersPersonalLoanToOverdue = CreateSchedule('* 0,17 * * *', () => updateLoanStatusToOverdue(), {
  scheduled: true,
  timezone: 'Africa/Lagos'
}); // runs every 12:00am and 05:00pm

const automaticallyDebitUserForLoanRepayment = CreateSchedule('*/1 * * * *', () => initiateLoanRepayment(), {
  scheduled: true,
  timezone: 'Africa/Lagos'
}); // runs every 04:00am and 06:00pm

export const scheduleList = [ updateUsersPersonalLoanToOverdue, automaticallyDebitUserForLoanRepayment ];

export const RunSchedules = async(schedules = []) => {
  const promises = [];
  for (const schedule of schedules) {
    promises.push(schedule.start());
  }
  await Promise.all(promises);
};
