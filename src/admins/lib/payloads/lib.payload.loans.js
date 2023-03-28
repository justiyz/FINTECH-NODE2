export default {
  fetchLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date
  ],

  fetchRepaidLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.start_date,
    query.end_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllRepaidLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.start_date,
    query.end_date
  ]
  
};
