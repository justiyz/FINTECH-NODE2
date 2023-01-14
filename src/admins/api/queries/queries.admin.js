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
  RETURNING admin_id,  first_name, 
  last_name, 
  email`,

  fetchAllAdmin: `
  SELECT 
  count(*) OVER() AS total,
   admin_id,
   admin_roles.name AS role, 
   email, 
   CONCAT(first_name, ' ', last_name) AS name,
   to_char(DATE (admins.created_at)::date, 'Mon DD YYYY') AS date,
   admins.status
  FROM admins
  LEFT JOIN admin_roles ON admin_roles.code = admins.role_type
  WHERE admins.status = $1 OR $1 is null
  AND  admins.created_at::date BETWEEN $2 AND $3
  ORDER BY admins.created_at DESC
  OFFSET $4 LIMIT $5
`,
  fetchAndSearchAllAdmin: `
    SELECT
      count(*) OVER() AS total,
      admin_id, 
      admin_roles.name, 
      email, 
      CONCAT(first_name, ' ', last_name) as name,
      to_char(DATE (admins.created_at)::date, 'Mon DD YYYY') as date,
      admins.status
    FROM admins
    LEFT JOIN admin_roles ON admin_roles.code = admins.role_type
    WHERE (admins.first_name ILIKE $1 OR $1 is null) OR (admins.last_name ILIKE $1 OR $1 is null)
    ORDER BY admins.created_at DESC
    OFFSET $2 LIMIT $3
    `,
  editAdminStatus:`
      UPDATE admins
      SET
      updated_at = NOW(),
      status = $2
      WHERE admin_id = $1
      RETURNING *
    `
};
    
