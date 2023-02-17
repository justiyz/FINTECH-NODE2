const Joi = require('joi').extend(require('@joi/date'));

const loanApplication = Joi.object().keys({
  amount: Joi.number().positive().required(),
  duration_in_months: Joi.number().positive().required(),
  loan_reason: Joi.string().required()
});

const loanIdParams = Joi.object().keys({
  loan_id: Joi.string().required()
});

const loanDisbursementPayload = Joi.object().keys({
  pin: Joi.string().length(4).required()
});

export default  {
  loanApplication,
  loanIdParams,
  loanDisbursementPayload
}; 
