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
  type: Joi.string().required().valid('email', 'phone_number'),
  email: Joi.string().optional(),
  phone_number: Joi.string()
    .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
    .messages({
      'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
      'string.empty': 'Phone Number is not allowed to be empty'
    }).optional(),
  link_url: Joi.string().required()
});

export default  {
  createCluster,
  fetchClusters,
  clusterId,
  clusterIdParams,
  votingTicketIdParams,
  votingDecision,
  inviteClusterMember
}; 
