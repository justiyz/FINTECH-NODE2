const Joi = require('joi').extend(require('@joi/date'));

const fetchLoanDueAmountParams = Joi.object().keys({
  loan_reference: Joi.string().required()
});

const mandateCreatedPayload = Joi.object().keys({
  loanReference: Joi.string().required(),
  institutionCode: Joi.string().required()
});

const createMandateRequestPayload = Joi.object().keys({
  loanReference: Joi.string().required(),
});

const loanBalanceUpdate = Joi.object().keys({
  loanReference: Joi.string().required(),
  institutionCode: Joi.string().required(),
  debitedAmount: Joi.number().required(),
  recoveryFee: Joi.number().required(),
  settlementAmount: Joi.number().required(),
  transactionReference: Joi.string().required(),
  narration: Joi.string().required(),
});


export default  {
  fetchLoanDueAmountParams,
  mandateCreatedPayload,
  createMandateRequestPayload,
  loanBalanceUpdate
};
