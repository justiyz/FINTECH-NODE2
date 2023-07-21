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
  ],
  fetchAllRepaidClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.start_date,
    query.end_date
  ],

  fetchRescheduledLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllRescheduledLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status
  ],

  fetchRescheduledClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllRescheduledClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status
  ],

  fetchClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date
  ],
  fetchInReviewClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  fetchAllInReviewClusterLoans: (query) => [
    query.search ? `%${query.search}%` : null,
    query.status,
    query.start_date,
    query.end_date
  ]
  
};
