export default {
  createMerchant: (body) => [
    body.business_name.trim(), 
    body.email.trim().toLowerCase(), 
    body.phone_number.trim(),
    body.interest_rate.trim(),
    body.address.trim(),
    body.secret_key.trim(),
    body.orr_score_threshold.trim(),
  ],
  addMerchantBankAccount: (body) => [
    body.merchant_id.trim(),
    body.bank_name.trim(),
    body.bank_code.trim(),
    body.account_number.trim(),
    body.account_name.trim(),
    body.transfer_recipient_code.trim(),
  ],
};
