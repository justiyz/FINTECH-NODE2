const Joi = require('joi').extend(require('@joi/date'));

const loanApplication = Joi.object().keys({
  amount: Joi.number().positive().required(),
  duration_in_months: Joi.number().positive().required(),
  loan_reason: Joi.string().required(),
  bank_statement_service_choice: Joi.string().required().valid('okra', 'mono')
});

const loanForEventApplication = Joi.object().keys({
  duration_in_months: Joi.number().positive().required(),
  loan_reason: Joi.string().required(),
  bank_statement_service_choice: Joi.string().required().valid('okra', 'mono'),
  tickets: Joi.array().required(),
  insurance_coverage: Joi.boolean().required(),
  payment_channel: Joi.string().required().valid('bank', 'card'),
  payment_tenure: Joi.number().positive().required(),
  fee: Joi.object().required()
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
  payment_type: Joi.string().required().valid('full', 'part'),
  payment_channel: Joi.string().required().valid('card', 'bank_transfer')
});

const loanRepaymentType = Joi.object().keys({
  payment_type: Joi.string().required().valid('full', 'part'),
  payment_channel: Joi.string().required().valid('card', 'bank')
});

const paymentOtp = Joi.object().keys({
  otp: Joi.string().required()
});

const rescheduleExtensionId = Joi.object().keys({
  extension_id: Joi.number().positive().required()
});

const loanRescheduleParams = Joi.object().keys({
  loan_id: Joi.string().required(),
  reschedule_id: Joi.string().required()
});

const loanRenegotiation = Joi.object().keys({
  new_loan_amount: Joi.number().positive().required(),
  new_loan_duration_in_month: Joi.number().positive().required()
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
  paymentOtp,
  rescheduleExtensionId,
  loanRescheduleParams,
  loanRenegotiation,
  loanForEventApplication
};
