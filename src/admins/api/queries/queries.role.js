export default {
  fetchRole: `
    SELECT id, code, name, status
    FROM admin_roles
    WHERE name = $1
    OR code = $1`,

  fetchAdminResourceById: `
    SELECT 
      id,
      resource_id,
      name
    FROM admin_resources
    WHERE resource_id = $1`,

  createAdminUserRole: `
    INSERT INTO admin_roles(
      name, code
    ) VALUES($1, $2)`,

  createRolesPermissions: `
    INSERT INTO admin_role_permissions(
      role_type, resource_id, permissions
    ) VALUES($1, $2, $3)`,

  fetchAdminResources: `
    SELECT 
      id,
      resource_id,
      name
    FROM admin_resources`,

  fetchNonSuperAdminRoles:`
      SELECT
        id,
        code,
        name,
        status
      FROM admin_roles
      WHERE code NOT IN ('SADM')
  `,

  deleteRole: `
      DELETE
         FROM admin_roles
      WHERE code = $1  
  `,

  deleteRoleType: `
      DELETE 
        FROM admin_role_permissions
      WHERE role_type = $1
  `,

  fetchAdminByRoleType: `
  SELECT role_type
    FROM admins 
  WHERE role_type = $1
  LIMIT 1`,
  
  fetchRoleByCode: `
      SELECT * 
      FROM admin_roles
      WHERE code = $1 or
  `,

  getAllRoles:`
    SELECT
        id,
        code,
        name,
        status
    FROM admin_roles
    WHERE (name ILIKE LOWER(TRIM($3)) OR $3 IS NULL) AND (status = $4 OR $4 IS NULL) AND 
    ((created_at::DATE BETWEEN $5::DATE AND $6::DATE) OR ($5 IS NULL AND $6 IS NULL))
    OFFSET $1
    LIMIT $2
  `,

  getRoleCount:`
  SELECT
       COUNT(code)
    FROM admin_roles
    WHERE (name = LOWER(TRIM($3)) OR $3 IS NULL) OR (status = $4 OR $4 IS NULL) OR 
    (created_at::DATE BETWEEN $5::DATE AND $6::DATE)
    LIMIT 1
  `
};
