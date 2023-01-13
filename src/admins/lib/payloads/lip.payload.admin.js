export default {
  addAdmin: (body, hash) => [ 
    body.first_name.trim().toLowerCase(), 
    body.last_name.trim().toLowerCase(), 
    body.email.trim().toLowerCase(),
    body.role_code.trim(),
    hash
  ],

  fetchRoles: (query) => [
    query.page && query.per_page ? (query.page - 1) * query.per_page : undefined,
    query.per_page,
    query.search ? `%${query.search}%` : undefined,
    query.status,
    query.from_date,
    query.to_date
    
  ]
};
  
