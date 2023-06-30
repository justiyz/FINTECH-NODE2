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
    body.sent_to,
    body.end_at
  ],

  fetchNotifications: (query) => [
    query.is_ended || false,
    query.title ? `%${query.title}%` : null,
    query.start_date,
    query.end_date,
    query.page ? (query.page - 1) * (query.per_page || 10) : 0,
    query.per_page ? query.per_page : '10'
  ]
};
