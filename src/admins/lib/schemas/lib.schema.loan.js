const Joi = require('joi').extend(require('@joi/date'));

const manualLoanApproval = Joi.object().keys({
  decision: Joi.string().required().valid('approve')
});

const manualLoanRejection = Joi.object().keys({
  decision: Joi.string().required().valid('decline'),
  rejection_reason: Joi.string().required()
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
  export: Joi.string().optional().valid('true')

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
  fetchClusterDetails
};
