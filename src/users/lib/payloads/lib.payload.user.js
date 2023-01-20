
export default {
  bankAccountPayload: (user, body, accountNumberDetails) => [ 
    user.user_id, 
    body.bank_name.toLowerCase(),
    body.bank_code,
    body.account_number,
    accountNumberDetails.data.account_name.trim().toLowerCase().replaceAll(',', '')
  ],

  imgVerification: (user, body) => [ 
    user.user_id, 
    body.id_type.toLowerCase(),
    body.card_number,
    body.image_url,
    body.verification_url,
    body.issued_date || null,
    body.expiry_date || null
  ],

  updateUserProfile: (body, user) => [
    user.user_id,
    body.first_name || user.first_name,
    body.middle_name || user.middle_name,
    body.last_name || user.last_name,
    body.date_of_birth || user.date_of_birth,
    body.gender || user.gender,
    body.address || user.address,
    body.income_range || user.income_range,
    body.number_of_dependants || user.number_of_dependants,
    body.marital_status || user.marital_status
  ]
};
  
