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
  ]
};
    
