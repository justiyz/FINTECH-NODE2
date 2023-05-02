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
    body.image_url.trim(),
    body.verification_url,
    body.issued_date || null,
    body.expiry_date || null
  ],

  addressVerification: (body, user, userCandidateId) => [
    user.user_id,
    body.street.trim().toLowerCase(),
    body.state.trim().toLowerCase(),
    body.city.trim().toLowerCase(),
    body.house_number.trim().toLowerCase(),
    body.landmark.trim().toLowerCase(),
    body.lga.trim().toLowerCase(),
    'nigeria',
    body.resident_type.trim().toLowerCase(),
    body.rent_amount || null,
    false,
    userCandidateId
  ],

  updateAddressVerification: (body, user, requestId, candidateId, userAddressVerificationRequestDetails) => [
    user.user_id,
    body.street.trim().toLowerCase(),
    body.state.trim().toLowerCase(),
    body.city.trim().toLowerCase(),
    body.house_number.trim().toLowerCase(),
    body.landmark.trim().toLowerCase(),
    body.lga.trim().toLowerCase(),
    'nigeria',
    body.resident_type.trim().toLowerCase(),
    body.rent_amount || null,
    requestId,
    userAddressVerificationRequestDetails.id,
    userAddressVerificationRequestDetails.status,
    candidateId
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
    body.monthly_income
  ],

  updateEmploymentDetails: (body, result) => [
    result.user_id,
    body.employment_type || result.employment_type, 
    body.company_name || result.company_name,
    body.school_name ||  result.school_name,
    body.date_started || result.date_started,
    dayjs().add(3, 'month').format(),
    body.monthly_income || result.monthly_income
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
  
