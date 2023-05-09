import dayjs from 'dayjs';
import * as Hash from '../../lib/utils/lib.util.hash';

const checkUserEligibilityPayload = async(user, body, userDefaultAccountDetails, loanApplicationDetails, userEmploymentDetails, userBvn, userMonoId) => ({
  user_id: user.user_id,
  loan_application_id: loanApplicationDetails.loan_id,
  loan_duration_in_month: `${body.duration_in_months}`,
  loan_amount: parseFloat(body.amount),
  loan_reason: body.loan_reason,
  monthly_income: userEmploymentDetails.monthly_income,
  employment_type: userEmploymentDetails.employment_type,
  martial_status: user.marital_status,
  number_of_dependants: user.number_of_children,
  account_number: userDefaultAccountDetails.account_number,
  bvn: await Hash.decrypt(decodeURIComponent(userBvn.bvn)),
  firstName: user.first_name,
  lastName: user.last_name,
  dateOfBirth: user.date_of_birth,
  email: user.email,
  address: '',
  phoneNumber: user.phone_number,
  gender: user.gender,
  user_mono_account_id: userMonoId
});

const processDeclinedLoanDecisionUpdatePayload = (data) => [
  data.loan_application_id,
  data.orr_score,
  'declined',
  data.final_decision,
  'automatically declined because user failed loan eligibility check'
];

const loanApplicationDeclinedDecisionResponse = async(user, data, loan_status, loan_decision) => ({
  user_id: user.user_id, 
  loan_id: data.loan_application_id, 
  loan_status,
  loan_decision
});

const processLoanDecisionUpdatePayload = (data, totalAmountRepayable, totalInterestAmount, status) => [
  data.loan_application_id,
  parseFloat(totalAmountRepayable).toFixed(2),
  parseFloat(totalInterestAmount).toFixed(2),
  data.orr_score,
  data.pricing_band,
  data.fees.processing_fee_percentage * 100,
  data.fees.insurance_fee_percentage * 100,
  data.fees.advisory_fee_percentage * 100,
  parseFloat((parseFloat(data.monthly_interest) * 100)).toFixed(2), // convert to percentage
  parseFloat(data.fees.processing_fee).toFixed(2),
  parseFloat(data.fees.insurance_fee).toFixed(2),
  parseFloat(data.fees.advisory_fee).toFixed(2),
  parseFloat(data.monthly_repayment).toFixed(2),
  status,
  data.final_decision,
  parseFloat(totalAmountRepayable).toFixed(2),
  data.max_approval !== null ? parseFloat(data.max_approval).toFixed(2) : null
];

const loanApplicationApprovalDecisionResponse = async(data, totalAmountRepayable, totalInterestAmount, user, loan_status, loan_decision, offer_letter_url) => ({
  user_id: user.user_id,
  loan_id: data.loan_application_id,
  loan_amount: `${parseFloat(data.loan_amount)}`,
  loan_duration_in_months: `${Number(data.loan_duration_in_month)}`,
  total_interest: `${parseFloat(totalInterestAmount).toFixed(2)}`,
  fees: {
    processing_fee: `${parseFloat(data.fees.processing_fee)}`,
    insurance_fee: `${parseFloat(data.fees.insurance_fee)}`,
    advisory_fee: `${parseFloat(data.fees.advisory_fee)}`
  },
  total_repayment: `${parseFloat(totalAmountRepayable).toFixed(2)}`,
  monthly_payment: `${parseFloat(data.monthly_repayment)}`,
  next_repayment_date: dayjs().add(30, 'days').format('MMM DD, YYYY'),
  loan_status,
  loan_decision,
  offer_letter_url ,
  max_allowable_amount: data.max_approval !== null ? `${parseFloat(data.max_approval).toFixed(2)}` : null
});

export default { 
  checkUserEligibilityPayload, 
  processDeclinedLoanDecisionUpdatePayload,
  loanApplicationDeclinedDecisionResponse,
  processLoanDecisionUpdatePayload,
  loanApplicationApprovalDecisionResponse
};
