const Joi = require('joi').extend(require('@joi/date'));

const createCluster = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required().valid('public', 'private'),
  maximum_members: Joi.number().positive().required(),
  loan_goal_target: Joi.number().positive().required(),
  minimum_monthly_income: Joi.number().positive().required()
});

export default  {
  createCluster
}; 
