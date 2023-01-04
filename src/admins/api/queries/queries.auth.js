export default {
  getAdminByEmail: `
      SELECT id, admin_id, role_type, email, phone_number, first_name, middle_name, last_name, gender, date_of_birth, image_url,
        is_verified_email, is_created_password, is_completed_profile, status, refresh_token, is_deleted
      FROM admins
      WHERE email = $1`
};
  
