export default {
  blacklistedBvn: (body, hash) => [
    body.first_name.trim(), 
    body.middle_name.trim(), 
    body.last_name.trim(), 
    body.date_of_birth.trim(),
    hash
  ],
  
  fetchBlacklistedBvn: (query) => [
    query.search ? `%${query.search}%` : null,
    query.from_date,
    query.to_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  unBlacklistedBvn: (data) => [
    data.first_name, 
    data.middle_name || null, 
    data.last_name, 
    data.date_of_birth,
    data.bvn
  ]
};
