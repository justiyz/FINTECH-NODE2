const Joi = require('joi').extend(require('@joi/date'));

const fetchLoanDueAmountParams = Joi.object().keys({
  loan_reference: Joi.string().required()
});


export default  {
  fetchLoanDueAmountParams
};
