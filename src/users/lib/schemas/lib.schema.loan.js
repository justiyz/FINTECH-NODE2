const Joi = require('joi').extend(require('@joi/date'));

const loanApplication = Joi.object().keys({
  amount: Joi.number().positive().required(),
  duration_in_months: Joi.number().positive().required(),
  loan_reason: Joi.string().required()
});

export default  {
  loanApplication
}; 
