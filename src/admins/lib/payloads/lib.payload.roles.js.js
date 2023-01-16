export default {
  fetchRoles: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.from_date,
    query.to_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : (1 - 1) * (query.per_page || 10),
    query.per_page ? query.per_page : '10'
  ]
};
  
