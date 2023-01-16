export default {
  addAdmin: (body, hash) => [ 
    body.first_name.trim().toLowerCase(), 
    body.last_name.trim().toLowerCase(), 
    body.email.trim().toLowerCase(),
    body.role_code.trim(),
    hash
  ],

  fetchRoles: (query) => [
    query.page && query.per_page ? (query.page - 1) * query.per_page : 1,
    query.per_page ? query.per_page : 10,
    query.search ? `%${query.search}%` : null,
    query.status,
    query.from_date,
    query.to_date
    
  ]
};
  
