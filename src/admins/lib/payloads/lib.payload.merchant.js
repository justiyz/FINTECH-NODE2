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
};
