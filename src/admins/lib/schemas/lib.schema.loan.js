const Joi = require('joi').extend(require('@joi/date'));

const manualLoanApproval = Joi.object().keys({
  decision: Joi.string().required().valid('approve')
});

const manualLoanRejection = Joi.object().keys({
  decision: Joi.string().required().valid('decline'),
  rejection_reason: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid cluster rejection reason input'
  }).required()
});

const loanIdParams = Joi.object().keys({
  loan_id: Joi.string().required()
});

const memberLoanIdParams = Joi.object().keys({
  member_loan_id: Joi.string().required()
});

const fetchLoans = Joi.object().keys({
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('pending', 'cancelled', 'in review', 'processing', 'declined', 'approved', 'ongoing',
    'over due', 'completed'),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  tier: Joi.number().optional().valid(1, 2),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  export: Joi.string().optional().valid('true'),
  loan_reason: Joi.string().optional().valid('Ticket Loan', 'Personal loan', 'business loan')
});

const fetchRepaidLoans = Joi.object().keys({
  search: Joi.string().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  tier: Joi.number().optional().valid(1, 2),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  export: Joi.string().optional().valid('true')
});
const fetchRescheduledLoans = Joi.object().keys({
  search: Joi.string().optional(),
  status: Joi.string().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  tier: Joi.number().optional().valid(1, 2),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  export: Joi.string().optional().valid('true')
});

const fetchClusterLoans = Joi.object().keys({
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('pending', 'cancelled', 'in review', 'processing', 'declined', 'approved', 'ongoing',
    'over due', 'completed'),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  export: Joi.string().optional().valid('true')
});

const fetchInReviewClusterLoans = Joi.object().keys({
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('in review'),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  export: Joi.string().optional().valid('true')
});
const fetchRescheduledClusterLoans = Joi.object().keys({
  search: Joi.string().optional(),
  status: Joi.string().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  export: Joi.string().optional().valid('true')
});
const fetchRepaidClusterLoans = Joi.object().keys({
  search: Joi.string().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  export: Joi.string().optional().valid('true')
});

const fetchSingleMemberDetails = Joi.object().keys({
  loan_id: Joi.string().required(),
  member_loan_id: Joi.string().required()
});

const memberLoanId = Joi.object().keys({
  member_loan_id: Joi.string().required()
});

const fetchClusterDetails = Joi.object().keys({
  cluster_id: Joi.string().required(),
  loan_id: Joi.string().required()
});

const manuallyCreateLoanRepaymentSchedule = Joi.object().keys({
  user_id: Joi.string().required(),
  loan_id: Joi.string().required(),
  repayment_order: Joi.number().positive().required(),
  principal_payment: Joi.number().positive().required(),
  interest_payment: Joi.number().positive().required(),
  fees: Joi.number().positive().required(),
  total_payment_amount: Joi.number().positive().required(),
  pre_payment_outstanding_amount: Joi.number().positive().required(),
  post_payment_outstanding_amount: Joi.number().positive().required(),
  proposed_payment_date: Joi.string().required(),
  pre_reschedule_proposed_payment_date: Joi.string().required()
});

const manuallyInitiatedLoanApplication = Joi.object().keys({
  user_id: Joi.string().required(),
  amount: Joi.number().positive().required(),
  loan_reason: Joi.string().required(),
  duration_in_months: Joi.number().positive().required(),
  total_repayment_amount: Joi.number().positive().optional(),
  total_interest_amount: Joi.number().positive().optional(),
  monthly_interest: Joi.number().required(),
  monthly_repayment: Joi.number().required(),
  percentage_advisory_fee: Joi.number().required(),
  percentage_insurance_fee: Joi.number().required(),
  percentage_pricing_band: Joi.number().required(),
  percentage_processing_fee: Joi.number().required(),
  processing_fee: Joi.number().optional(),
  insurance_fee: Joi.number().optional(),
  advisory_fee: Joi.number().optional(),
  loan_decision: Joi.string().optional(),
  is_renegotiated: Joi.boolean().default(false),
  is_loan_disbursed: Joi.boolean().default(false),
  total_outstanding_amount: Joi.number().optional(),
  loan_disbursed_at: Joi.string().optional(),
  status: Joi.string().required(),
  initial_amount_requested: Joi.number().required(),
  initial_loan_tenor_in_months: Joi.number().required(),
  reschedule_count: Joi.number().default(0),
  renegotiation_count: Joi.number().default(0)
});

const loanRepaymentParams = Joi.object().keys({
  loan_id: Joi.string().required(),
  payment_channel_id: Joi.string().required()
});

const loanRepaymentType = Joi.object().keys({
  payment_type: Joi.string().required().valid('full', 'part'),
  custom_amount: Joi.number().when('payment_type', {
    is: 'part',
    then: Joi.number().optional(),
    otherwise: Joi.forbidden()
  })
});

const createMandateRequestPayload = Joi.object().keys({
  loan_id: Joi.string().required()
});

const createManualLoan = Joi.object().keys({
  user_id: Joi.string().required(),
  loan_type: Joi.string().required().valid('manual'),
  loan_amount: Joi.number().positive().required(),
  loan_reason: Joi.string().required(),
  loan_tenor: Joi.number().integer().min(1).max(24).required(),
  interest_rate: Joi.number().positive().required(),
  processing_fee: Joi.number().positive().required(),
  insurance_fee: Joi.number().positive().required(),
  advisory_fee: Joi.number().positive().required(),
  loan_decision: Joi.string().required(),
  loan_disbursed: Joi.boolean().required(),
  loan_disbursement_date: Joi.date().max('now').required(),
  loan_status: Joi.string().valid('ongoing', 'completed', 'overdue').required(),
  initial_amount_requested: Joi.number().positive().required(),
  initial_loan_tenor: Joi.number().integer().min(1).max(24).required()
});

export const fetchLoanPeriod = Joi.object().keys({
  loan_tenor: Joi.number().integer().min(1).max(24).required()
});


export default {
  manualLoanApproval,
  manualLoanRejection,
  loanIdParams,
  memberLoanIdParams,
  fetchLoans,
  fetchRepaidLoans,
  fetchRescheduledLoans,
  fetchClusterLoans,
  fetchInReviewClusterLoans,
  fetchSingleMemberDetails,
  memberLoanId,
  fetchRescheduledClusterLoans,
  fetchRepaidClusterLoans,
  fetchClusterDetails,
  manuallyInitiatedLoanApplication,
  manuallyCreateLoanRepaymentSchedule,
  loanRepaymentParams,
  loanRepaymentType,
  createMandateRequestPayload,
  createManualLoan,
  fetchLoanPeriod
};
