import dayjs from 'dayjs';
import * as Hash from '../../lib/utils/lib.util.hash';

const checkUserEligibility = async(user, body, userDefaultAccountDetails, loanApplicationDetails, userBvn) => ({
  user_id: user.user_id,
  loan_application_id: loanApplicationDetails.loan_id,
  loan_duration_in_month: `${body.duration_in_months}`,
  loan_amount: parseFloat(body.amount),
  loan_reason: body.loan_reason,
  monthly_income: user.income_range.replaceAll(',', ''),
  employment_type: user.employment_type,
  martial_status: user.marital_status,
  number_of_dependants: user.number_of_dependents,
  account_number: userDefaultAccountDetails.account_number,
  bvn: await Hash.decrypt(decodeURIComponent(userBvn.bvn)),
  firstName: user.first_name,
  lastName: user.last_name,
  dateOfBirth: user.date_of_birth,
  email: user.email,
  address: user.address,
  phoneNumber: user.phone_number,
  gender: user.gender
});

const processDeclinedLoanDecisionUpdatePayload = (data) => [
  data.loan_application_id,
  data.orr_score,
  'declined',
  data.final_decision,
  'User has bad credit bureaus record' // to be changed to what underwriting service returns
];

const processManualLoanDecisionUpdatePayload = (data, totalRepaymentAmount, totalInterestAmount) => [
  data.loan_application_id,
  parseFloat(totalRepaymentAmount).toFixed(2),
  parseFloat(totalInterestAmount).toFixed(2),
  data.orr_score,
  data.pricing_band,
  data.fees.processing_fee_percentage * 100,
  data.fees.insurance_fee_percentage * 100,
  data.fees.advisory_fee_percentage * 100,
  parseFloat(data.monthly_interest).toFixed(2),
  parseFloat(data.fees.processing_fee).toFixed(2),
  parseFloat(data.fees.insurance_fee).toFixed(2),
  parseFloat(data.fees.advisory_fee).toFixed(2),
  parseFloat(data.monthly_repayment).toFixed(2),
  'pending',
  data.final_decision
];

const processApprovedLoanDecisionUpdatePayload = (data, totalRepaymentAmount, totalInterestAmount) => [
  data.loan_application_id,
  parseFloat(totalRepaymentAmount).toFixed(2),
  parseFloat(totalInterestAmount).toFixed(2),
  data.orr_score,
  data.pricing_band,
  data.fees.processing_fee_percentage * 100,
  data.fees.insurance_fee_percentage * 100,
  data.fees.advisory_fee_percentage * 100,
  parseFloat(data.monthly_interest).toFixed(2),
  parseFloat(data.fees.processing_fee).toFixed(2),
  parseFloat(data.fees.insurance_fee).toFixed(2),
  parseFloat(data.fees.advisory_fee).toFixed(2),
  parseFloat(data.monthly_repayment).toFixed(2),
  'approved',
  data.final_decision
];

const loanApplicationApprovalDecisionResponse = async(data, totalRepaymentAmount, totalInterestAmount, user, loan_status, loan_decision) => ({
  user_id: user.user_id,
  loan_id: data.loan_application_id,
  loan_amount: `₦${parseFloat(data.loan_amount)}`,
  loan_duration_in_months: `${Number(data.loan_duration_in_month)}`,
  total_interest: `₦${parseFloat(totalInterestAmount).toFixed(2)}`,
  fees: {
    processing_fee: `₦${parseFloat(data.fees.processing_fee)}`,
    insurance_fee: `₦${parseFloat(data.fees.insurance_fee)}`,
    advisory_fee: `₦${parseFloat(data.fees.advisory_fee)}`
  },
  total_repayment: `₦${parseFloat(totalRepaymentAmount).toFixed(2)}`,
  monthly_payment: `₦${parseFloat(data.monthly_repayment)}`,
  next_repayment_date: dayjs().add(30, 'days').format('MMM DD, YYYY'),
  loan_status,
  loan_decision
});

export default { 
  checkUserEligibility, 
  processDeclinedLoanDecisionUpdatePayload,
  processManualLoanDecisionUpdatePayload,
  processApprovedLoanDecisionUpdatePayload,
  loanApplicationApprovalDecisionResponse
};
