export default {
  fetchUsers: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.from_date,
    query.to_date,
    query.loan_status,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllUsers: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.from_date,
    query.to_date,
    query.loan_status
  ],

  addBlacklistedBvn: (userDetails) => [
    userDetails.first_name,
    userDetails.middle_name || null,
    userDetails.last_name,
    userDetails.date_of_birth,
    userDetails.bvn
  ],

  fetchUserRewards: (user_id, query) => [
    user_id,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  updateUserProfile: (body, user) => [
    user.user_id,
    body.email || user.email,
    body.phone_number || user.phone_number,
    body.gender || user.gender,
    body.date_of_birth || user.date_of_birth,
    body.number_of_children || user.number_of_children,
    body.marital_status || user.marital_status,
    body.first_name || user.first_name,
    (body.middle_name === '') ? null : body.middle_name,
    body.last_name || user.last_name,
    body.tier || user.tier
  ],

  updateEmploymentDetails: (body, result) => [
    result.user_id,
    body.employment_type || result.employment_type,
    body.company_name || result.company_name,
    body.school_name ||  result.school_name,
    body.date_started || result.date_started,
    body.monthly_income || result.monthly_income
  ],

  updateResidentialAddress: (body, result) => [
    result.user_id,
    body.street || result.street,
    body.state || result.state,
    body.city ||  result.city,
    body.house_number || result.house_number,
    body.landmark || result.landmark,
    body.lga || result.lga,
    body.country || result.country,
    body.type_of_residence || result.type_of_residence,
    body.rent_amount || result.rent_amount,
  ],

  updateNextOfKin: (body, result) => [
    result.user_id,
    body.first_name || result.first_name,
    body.last_name || result.last_name,
    body.phone_number ||  result.phone_number,
    body.email || result.email,
    body.kind_of_relationship || result.kind_of_relationship,
  ],
};

