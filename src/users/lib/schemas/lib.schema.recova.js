const Joi = require('joi').extend(require('@joi/date'));

const fetchLoanDueAmountParams = Joi.object().keys({
  loan_reference: Joi.string().required()
});

const mandateCreatedPayload = Joi.object().keys({
  loanReference: Joi.string().required(),
  institutionCode: Joi.string().required()
});


export default  {
  fetchLoanDueAmountParams,
  mandateCreatedPayload
};
