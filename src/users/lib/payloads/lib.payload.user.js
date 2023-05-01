import dayjs from 'dayjs';

export default {
  bankAccountPayload: (user, body, accountNumberDetails) => [ 
    user.user_id, 
    body.bank_name.toLowerCase(),
    body.bank_code,
    body.account_number,
    accountNumberDetails.data.account_name.trim().toLowerCase().split(',').join('')
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
    body.number_of_children || user.number_of_children,
    body.marital_status || user.marital_status,
    dayjs().add(3, 'month').format()
  ],  

  employmentDetails: (body, user) => [
    user.user_id,
    body.employment_type,
    body.company_name,
    body.school_name,
    body.date_started,
    dayjs().add(3, 'month').format(),
    body.income_range
  ],

  updateEmploymentDetails: (body, result) => [
    result.user_id,
    body.employment_type || result.employment_type, 
    body.company_name || result.company_name,
    body.school_name ||  result.school_name,
    body.date_started || result.date_started,
    dayjs().add(3, 'month').format(),
    body.income_range || result.income_range
  ],

  createNextOfKin: (body, user) => [
    user.user_id,
    body.first_name,
    body.last_name,
    body.phone_number,
    body.email,
    body.kind_of_relationship
  ]
};
  
