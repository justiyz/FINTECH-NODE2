import Joi from "joi";

export default {
  createMerchant: (body) => [
    body.business_name.trim(),
    body.email.trim().toLowerCase(),
    body.phone_number.trim(),
    body.interest_rate.trim(),
    body.address.trim(),
    body.secret_key.trim(),
    body.orr_score_threshold.trim(),
    body.processing_fee,
    body.insurance_fee,
    body.advisory_fee,
    body.customer_loan_max_amount,
    body.merchant_loan_limit
  ],
  createMerchantAdmin: (body) => [
    body.merchant_id.trim(),
    body.first_name.trim().toLowerCase(),
    body.last_name.trim().toLowerCase(),
    body.email.trim().toLowerCase(),
    body.phone_number.trim(),
    body.gender.trim(),
    body.password.trim(),
    body.verification_token,
    body.verification_token_expires
  ],
  addMerchantBankAccount: (body) => [
    body.merchant_id.trim(),
    body.bank_name.trim(),
    body.bank_code.trim(),
    body.account_number.trim(),
    body.account_name.trim(),
    body.transfer_recipient_code.trim(),
  ],
  fetchMerchantUsers: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],
  countMerchantLoans: (req) => [
    req.params.merchant_id,
    req.query.user_id,
    req.query.status,
    req.query.search ? `%${req.query.search}%` : null,
  ],
  fetchMerchantLoans: (req) => {
    const page = req.query.page || 1;
    const perPage = req.query.per_page || 20;
    const offset = perPage * page - perPage;
    return [
      offset,
      perPage,
      req.params.merchant_id,
      req.query.user_id,
      req.query.status,
      req.query.search ? `%${req.query.search}%` : null,
    ]
  },
};
