export default {
  completeAdminProfile: (admin, body) => [ 
    admin.admin_id, 
    body.first_name.trim().toLowerCase(), 
    body.last_name.trim().toLowerCase(), 
    body.phone_number.trim(),
    body.gender
  ],
  
  addAdmin: (body, hash) => [ 
    body.first_name.trim().toLowerCase(), 
    body.last_name.trim().toLowerCase(), 
    body.email.trim().toLowerCase(),
    body.role_code.trim(),
    hash
  ],
  blacklistedBvn: (body, hash) => [
    body.first_name, 
    body.middle_name || null, 
    body.last_name, 
    body.date_of_birth,
    hash
  ],

  fetchBlacklistedBvn: (query) => [
    query.search ? `%${query.search}%` : null,
    query.bvn,
    query.from_date,
    query.to_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ]
};
  
