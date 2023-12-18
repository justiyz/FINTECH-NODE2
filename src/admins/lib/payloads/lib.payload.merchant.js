export default {
  createMerchant: (body) => [
    body.business_name.trim(), 
    body.email.trim().toLowerCase(), 
    body.phone_number.trim(),
    body.interest_rate.trim(),
    body.address.trim(),
    body.secret_key
  ],
};
