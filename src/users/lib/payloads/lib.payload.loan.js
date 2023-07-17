import dayjs from 'dayjs';
import * as Hash from '../../lib/utils/lib.util.hash';

const checkUserEligibilityPayload = async(user, body, userDefaultAccountDetails, loanApplicationDetails, userEmploymentDetails, userBvn, userMonoId, 
  userLoanDiscount, clusterType, userAllowableAmount, previousLoanCount, previouslyDefaultedCount) => ({
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
  user_mono_account_id: userMonoId,
  loan_type: 'individual',
  interest_rate_type: userLoanDiscount.interest_rate_type || null,
  interest_rate_value: userLoanDiscount.interest_rate_value || null,
  general_loan_id: null,
  cluster_type: clusterType,
  user_allowable_amount: userAllowableAmount,
  previous_loan_count: previousLoanCount,
  previous_loan_defaulted_count: previouslyDefaultedCount
});

const processDeclinedLoanDecisionUpdatePayload = (data) => [
  data.loan_application_id,
  data.orr_score,
  'declined',
  data.final_decision,
  'automatically declined because user failed loan eligibility check',
  data.is_stale ? true : false
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
  data.max_approval !== null ? parseFloat(data.max_approval).toFixed(2) : null,
  data.max_approval !== null ? parseFloat(data.max_approval).toFixed(2) : parseFloat(data.loan_amount).toFixed(2),
  data.is_stale ? true : false
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
  offer_letter_url,
  max_allowable_amount: data.max_approval !== null ? `${parseFloat(data.max_approval).toFixed(2)}` : null
});

const loanReschedulingRequestSummaryResponse = async(existingLoanApplication, user, loanRescheduleExtensionDetails, nextRepayment) => ({
  user_id: user.user_id,
  loan_id: existingLoanApplication.loan_id,
  loan_amount: `${parseFloat(existingLoanApplication.amount_requested)}`,
  loan_duration_in_months: `${Number(existingLoanApplication.loan_tenor_in_months)}`,
  total_interest: `${parseFloat(existingLoanApplication.total_interest_amount).toFixed(2)}`,
  total_repayment: `${parseFloat(existingLoanApplication.total_repayment_amount).toFixed(2)}`,
  monthly_payment: `${parseFloat(existingLoanApplication.monthly_repayment)}`,
  next_repayment_date: dayjs(nextRepayment.proposed_payment_date).add(Number(loanRescheduleExtensionDetails.extension_in_days), 'days').format('MMM DD, YYYY'),
  loan_status: existingLoanApplication.status,
  rescheduling_count: existingLoanApplication.reschedule_count || 0
});

const loanRenegotiationPayload = async(user, body, existingLoanApplication, data) => [
  existingLoanApplication.loan_id,
  user.user_id,
  parseFloat(existingLoanApplication.amount_requested),
  parseFloat(body.new_loan_amount),
  parseFloat(existingLoanApplication.loan_tenor_in_months),
  parseFloat(body.new_loan_duration_in_month),
  parseFloat(data.pricing_band),
  parseFloat((parseFloat(data.monthly_interest) * 100)).toFixed(2),
  parseFloat(data.monthly_repayment),
  parseFloat(data.fees.processing_fee),
  parseFloat(data.fees.advisory_fee),
  parseFloat(data.fees.insurance_fee)
];

const loanApplicationRenegotiationPayload = async(data, totalAmountRepayable, totalInterestAmount, body, existingLoanApplication) => [
  data.loan_application_id,
  data.pricing_band,
  parseFloat((parseFloat(data.monthly_interest) * 100)).toFixed(2), // convert to percentage
  parseFloat(data.monthly_repayment).toFixed(2),
  parseFloat(data.fees.processing_fee).toFixed(2),
  parseFloat(data.fees.insurance_fee).toFixed(2),
  parseFloat(data.fees.advisory_fee).toFixed(2),
  data.fees.processing_fee_percentage * 100,
  data.fees.insurance_fee_percentage * 100,
  data.fees.advisory_fee_percentage * 100,
  parseFloat(body.new_loan_amount),
  parseFloat(body.new_loan_duration_in_month),
  parseFloat(totalAmountRepayable).toFixed(2),
  parseFloat(totalInterestAmount).toFixed(2),
  parseFloat(totalAmountRepayable).toFixed(2),
  parseFloat((existingLoanApplication.renegotiation_count || 0) + 1)
];

const loanApplicationRenegotiationResponse = async(data, totalAmountRepayable, totalInterestAmount, user, updatedLoanDetails, offer_letter_url, body) => ({
  user_id: user.user_id,
  loan_id: data.loan_application_id,
  loan_amount: `${parseFloat(body.new_loan_amount)}`,
  loan_duration_in_months: `${Number(body.new_loan_duration_in_month)}`,
  total_interest: `${parseFloat(totalInterestAmount).toFixed(2)}`,
  fees: {
    processing_fee: `${parseFloat(data.fees.processing_fee)}`,
    insurance_fee: `${parseFloat(data.fees.insurance_fee)}`,
    advisory_fee: `${parseFloat(data.fees.advisory_fee)}`
  },
  total_repayment: `${parseFloat(totalAmountRepayable).toFixed(2)}`,
  monthly_payment: `${parseFloat(data.monthly_repayment)}`,
  next_repayment_date: dayjs().add(30, 'days').format('MMM DD, YYYY'),
  loan_status: updatedLoanDetails.status,
  loan_decision: updatedLoanDetails.loan_decision,
  offer_letter_url,
  max_allowable_amount: null
});

export default { 
  checkUserEligibilityPayload, 
  processDeclinedLoanDecisionUpdatePayload,
  loanApplicationDeclinedDecisionResponse,
  processLoanDecisionUpdatePayload,
  loanApplicationApprovalDecisionResponse,
  loanReschedulingRequestSummaryResponse,
  loanRenegotiationPayload,
  loanApplicationRenegotiationPayload,
  loanApplicationRenegotiationResponse
};
