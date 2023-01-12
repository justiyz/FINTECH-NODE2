export default {
  getAdminByEmail: `
    SELECT id, admin_id, role_type, email, phone_number, first_name, last_name, gender, image_url,
      is_verified_email, is_created_password, is_completed_profile, status, refresh_token, is_deleted
    FROM admins
    WHERE email = $1`,

  getAdminByAdminId: `
    SELECT id, admin_id, role_type, email, phone_number, first_name, last_name, gender, image_url,
      is_verified_email, is_created_password, is_completed_profile, status, refresh_token, is_deleted
    FROM admins
    WHERE admin_id = $1`,

  addAdmin: `
    INSERT INTO admins (
      first_name, 
      last_name, 
      email,
      role_type,
      password
  )VALUES($1, $2, $3, $4, $5)
  RETURNING  first_name, 
  last_name, 
  email`
};
    
