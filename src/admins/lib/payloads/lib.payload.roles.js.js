export default {
  fetchRoles: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.from_date,
    query.to_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAdminsPerRole: (query) => [
    query.role_type,
    query.status,
    query.from_date,
    query.to_date,
    query.search ? `%${query.search}%` : null,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ]
};
  
