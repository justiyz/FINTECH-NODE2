const Joi = require('joi').extend(require('@joi/date'));

const createCluster = Joi.object().keys({
  type: Joi.string().required().valid('public', 'private')
}).when(Joi.object({ type: Joi.string().valid('public') }).unknown(), {
  then: Joi.object({
    name: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
      'string.pattern.base': 'Invalid cluster name input'
    }).required(),
    description: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
      'string.pattern.base': 'Invalid cluster description input'
    }).required(),
    maximum_members: Joi.number().positive().required().min(2),
    minimum_monthly_income: Joi.number().positive().required()
  })
}).when(Joi.object({ type: Joi.string().valid('private') }).unknown(), {
  then: Joi.object({
    name: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
      'string.pattern.base': 'Invalid cluster name input'
    }).required(),
    description: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
      'string.pattern.base': 'Invalid cluster description input'
    }).required(),
    maximum_members: Joi.number().positive().required().min(2),
    loan_goal_target: Joi.number().positive().required(),
    minimum_monthly_income: Joi.number().positive().required()
  })
});

const fetchClusters = Joi.object().keys({
  type: Joi.string().required().valid('explore', 'my cluster', 'created')
});

const clusterId = Joi.object().keys({
  cluster_id: Joi.string().required()
});

const clusterIdParams = Joi.object().keys({
  cluster_id: Joi.string().required()
});

const votingTicketIdParams = Joi.object().keys({
  ticket_id: Joi.string().required()
});

const votingDecision = Joi.object().keys({
  decision: Joi.string().required().valid('yes', 'no')
});


const inviteClusterMember = Joi.object().keys({
  link_url: Joi.string().required(),
  type: Joi.string().required().valid('email', 'phone_number')
}).when(Joi.object({ type: Joi.string().valid('email') }).unknown(), {
  then: Joi.object({
    email: Joi.string().email().required()
  })
}).when(Joi.object({ type: Joi.string().valid('phone_number') }).unknown(), {
  then: Joi.object({
    phone_number: Joi.string()
      .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
      .messages({
        'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
        'string.empty': 'Phone Number is not allowed to be empty'
      }).required()
  })
});

const initiateDeleteCluster = Joi.object().keys({
  deletion_reason: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid deletion reason input'
  }).required()
});

const selectNewAdminParams = Joi.object().keys({
  cluster_id: Joi.string().required(),
  invitee_id: Joi.string().required()
});

const editCluster = Joi.object().keys({
  name: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid cluster name input'
  }).optional(),
  description: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid cluster description input'
  }).optional(),
  maximum_members: Joi.number().optional(),
  loan_goal_target: Joi.number().optional(),
  minimum_monthly_income: Joi.number().optional()
});

const initiateClusterLoan = Joi.object().keys({
  total_amount: Joi.number().positive().required(),
  duration_in_months: Joi.number().positive().required(),
  bank_statement_service_choice: Joi.string().required().valid('okra', 'mono'),
  sharing_type: Joi.string().required().valid('equal', 'self-allocate')
}).when(Joi.object({ sharing_type: Joi.string().valid('self-allocate') }).unknown(), {
  then: Joi.object({
    amount: Joi.number().positive().required()
  })
});

const clusterMemberLoanIdParams = Joi.object().keys({
  member_loan_id: Joi.string().required()
});

const clusterLoanIdParams = Joi.object().keys({
  cluster_id: Joi.string().required(),
  loan_id: Joi.string().required()
});

const clusterLoanRenegotiation = Joi.object().keys({
  new_loan_amount: Joi.number().positive().required()
});

const membersClusterLoanEligibilityCheck = Joi.object().keys({
  amount: Joi.number().positive().required(),
  bank_statement_service_choice: Joi.string().required().valid('okra', 'mono')
});

const membersClusterLoanDecision = Joi.object().keys({
  decision: Joi.string().required().valid('accept', 'decline')
});

const userPinPayload = Joi.object().keys({
  pin: Joi.string().length(4).required()
});

const noCardOrBankLoanRepaymentType = Joi.object().keys({
  payment_type: Joi.string().required().valid('full', 'part'),
  payment_channel: Joi.string().required().valid('card', 'bank_transfer')
});

const loanRepaymentParams = Joi.object().keys({
  member_loan_id: Joi.string().required(),
  payment_channel_id: Joi.string().required()
});

const loanRepaymentType = Joi.object().keys({
  payment_type: Joi.string().required().valid('full', 'part'),
  payment_channel: Joi.string().required().valid('card', 'bank')
});

const referenceIdParams = Joi.object().keys({
  reference_id: Joi.string().required()
});

const paymentOtp = Joi.object().keys({
  otp: Joi.string().required()
});

const rescheduleExtensionId = Joi.object().keys({
  extension_id: Joi.number().positive().required()
});

const clusterLoanRescheduleParams = Joi.object().keys({
  member_loan_id: Joi.string().required(),
  reschedule_id: Joi.string().required()
});

export default  {
  createCluster,
  fetchClusters,
  clusterId,
  clusterIdParams,
  votingTicketIdParams,
  votingDecision,
  inviteClusterMember,
  initiateDeleteCluster,
  selectNewAdminParams,
  editCluster,
  initiateClusterLoan,
  clusterMemberLoanIdParams,
  clusterLoanIdParams,
  clusterLoanRenegotiation,
  membersClusterLoanEligibilityCheck,
  membersClusterLoanDecision,
  userPinPayload,
  noCardOrBankLoanRepaymentType,
  loanRepaymentParams,
  loanRepaymentType,
  referenceIdParams,
  paymentOtp,
  rescheduleExtensionId,
  clusterLoanRescheduleParams
}; 
