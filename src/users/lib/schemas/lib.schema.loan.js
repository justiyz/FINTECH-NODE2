const Joi = require('joi').extend(require('@joi/date'));

const loanApplication = Joi.object().keys({
  amount: Joi.number().positive().required(),
  duration_in_months: Joi.number().positive().required(),
  loan_reason: Joi.string().required()
});

const loanIdParams = Joi.object().keys({
  loan_id: Joi.string().required()
});

const loanPaymentIdParams = Joi.object().keys({
  loan_payment_id: Joi.string().required()
});

const loanDisbursementPayload = Joi.object().keys({
  pin: Joi.string().length(4).required()
});

const loanType = Joi.object().keys({
  type: Joi.string().required().valid('personal', 'cluster')
});

const loanRepaymentParams = Joi.object().keys({
  loan_id: Joi.string().required(),
  payment_channel_id: Joi.string().required()
});

const referenceIdParams = Joi.object().keys({
  reference_id: Joi.string().required()
});

const noCardOrBankLoanRepaymentType = Joi.object().keys({
  payment_type: Joi.string().required().valid('full', 'part')
});

const loanRepaymentType = Joi.object().keys({
  payment_type: Joi.string().required().valid('full', 'part'),
  payment_channel: Joi.string().required().valid('card', 'bank')
});

const paymentOtp = Joi.object().keys({
  otp: Joi.string().required()
});

export default  {
  loanApplication,
  loanIdParams,
  loanPaymentIdParams,
  loanDisbursementPayload,
  loanType,
  loanRepaymentParams,
  noCardOrBankLoanRepaymentType,
  loanRepaymentType,
  referenceIdParams,
  paymentOtp
}; 
