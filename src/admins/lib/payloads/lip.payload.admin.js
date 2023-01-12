export default {
  addAdmin: (body, hash) => [ 
    body.first_name.trim().toLowerCase(), 
    body.last_name.trim().toLowerCase(), 
    body.email.trim().toLowerCase(),
    body.role_type.trim(),
    hash
  ]
};
  
