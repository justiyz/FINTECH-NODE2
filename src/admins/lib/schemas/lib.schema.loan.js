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

export default {
  manualLoanApproval,
  manualLoanRejection,
  loanIdParams
};
