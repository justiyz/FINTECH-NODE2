const Joi = require('joi').extend(require('@joi/date'));

export const fetchClusters = Joi.object().keys({
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('active', 'inactive', 'deactivated', 'suspended'),
  loan_status: Joi.string().optional().valid('active', 'inactive'),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional()
});

export const clusterId = Joi.object().keys({
  cluster_id: Joi.string().optional()
});


export const createCluster = Joi.object().keys({
  name: Joi.string().required(), 
  description: Joi.string().required(),
  type: Joi.string().required().valid('private'),
  maximum_members: Joi.number().required(),
  loan_goal_target: Joi.number().required(),
  minimum_monthly_income: Joi.number().required()
});
  
export const inviteCluster = Joi.object().keys({
  email: Joi.string().email().required(),
  link_url: Joi.string().required()
});

export const editClusterStatus = Joi.object().keys({
  status: Joi.string().required().valid('active', 'deactivated')
});

export const editClusterMember = Joi.object().keys({
  status: Joi.string().required().valid('deactivated')
});
