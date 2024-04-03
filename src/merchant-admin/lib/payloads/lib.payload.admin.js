export default {
  completeAdminProfile: (admin, body) => [ 
    admin.admin_id, 
    body.first_name.trim().toLowerCase(), 
    body.last_name.trim().toLowerCase(), 
    body.phone_number.trim(),
    body.gender
  ],
  
  addAdmin: (admin_details, hash) => [ 
    admin_details.first_name.trim().toLowerCase(), 
    admin_details.last_name.trim().toLowerCase(), 
    admin_details.email.trim().toLowerCase(),
    admin_details.role_name.trim(),
    admin_details.phone_number.trim(),
    hash
  ],

  fetchActivityLog: (query) => [
    query.search ? `%${query.search}%` : null,
    query.from_date,
    query.to_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ],

  sendUserNotification: (admin, body) => [
    admin.admin_id,
    body.type,
    body.title,
    body.content,
    body.end_at ? [ 'All Users' ] : body.sent_to,
    body.end_at || null
  ],

  fetchNotifications: (query) => [
    query.type ? query.type : null,
    query.title ? `%${query.title}%` : null,
    query.start_date || null,
    query.end_date || null,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ]
};
