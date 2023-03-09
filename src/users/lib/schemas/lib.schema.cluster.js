const Joi = require('joi').extend(require('@joi/date'));

const createCluster = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required().valid('public', 'private'),
  maximum_members: Joi.number().positive().required().min(2),
  loan_goal_target: Joi.number().positive().required(),
  minimum_monthly_income: Joi.number().positive().required()
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
  deletion_reason: Joi.string().required()
});

const selectNewAdminParams = Joi.object().keys({
  cluster_id: Joi.string().required(),
  invitee_id: Joi.string().required()
});

const editCluster = Joi.object().keys({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  maximum_members: Joi.number().optional(),
  loan_goal_target: Joi.number().optional(),
  maximum_monthly_income: Joi.number().optional()
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
  editCluster
}; 
