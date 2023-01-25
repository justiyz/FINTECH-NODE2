export default {
  fetchAdminPassword: `
      SELECT id, admin_id, password
      FROM admins 
      WHERE admin_id = $1`,

  fetchAdminByVerificationToken: `
      SELECT id, email, admin_id, verification_token, verification_token_expires, is_created_password
      FROM admins 
      WHERE verification_token = $1`,

  updateLoginToken: `
      UPDATE admins
      SET 
        updated_at = NOW(),
        is_verified_email = TRUE,
        verification_token = $2,
        verification_token_expires = $3
      WHERE admin_id = $1
      RETURNING id, admin_id, first_name, last_name, role_type, image_url, email, is_created_password, is_verified_email, is_completed_profile, status`,

  fetchRolePermissions: `
      SELECT 
        admin_roles.code,
        admin_resources.name,
        admin_role_permissions.resource_id,
        string_to_array(admin_role_permissions.permissions, ',') AS permissions
      FROM admin_role_permissions
      LEFT JOIN admin_resources
      ON admin_role_permissions.resource_id = admin_resources.resource_id
      LEFT JOIN admin_roles
      ON admin_role_permissions.role_type = admin_roles.code
      WHERE admin_role_permissions.role_type = $1
      AND admin_roles.status = 'active'`,

  fetchAdminPermissions: `
      SELECT 
        admin_user_permissions.admin_id,
        admin_resources.name,
        admin_user_permissions.resource_id,
        string_to_array(admin_user_permissions.permissions, ',') AS permissions
      FROM admin_user_permissions
      LEFT JOIN admin_resources
      ON admin_user_permissions.resource_id = admin_resources.resource_id
      WHERE admin_user_permissions.admin_id = $1`,

  adminForgotPassword: `
    UPDATE admins
    SET
      verification_token = $2,
      verification_token_expires = $3,
      updated_at = NOW()
    WHERE email = $1
    RETURNING admin_id, first_name, last_name, status`,

  setNewAdminPassword: `
    UPDATE admins
    SET 
      updated_at = NOW(),
      status = 'active',
      is_created_password = TRUE,
      password = $2
    WHERE admin_id = $1
    RETURNING admin_id, status, is_created_password, is_verified_email, is_completed_profile`
};
  
