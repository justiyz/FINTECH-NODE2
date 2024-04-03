export default {

  fetchMerchantAdminMembership: `
    SELECT *
    FROM merchant_admins_merchants
    WHERE merchant_id = $1 AND merchant_admin_id = $2`,

  // ================================================================================================

  fetchRole: `
    SELECT id, code, name, status, created_at
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

  updateRoleName: `
    UPDATE admin_roles
    SET
      updated_at = NOW(),
      name = $2
    WHERE code = $1`,

  updateRoleStatus: `
    UPDATE admin_roles
    SET
      updated_at = NOW(),
      status = $2
    WHERE code = $1
    RETURNING *`,

  checkIfResourcePermissionCreated: `
    SELECT permissions
    FROM admin_role_permissions
    WHERE role_type = $1
    AND resource_id = $2`,

  editRolePermissions: `
    UPDATE admin_role_permissions
    SET
      updated_at = NOW(),
      permissions = $3
    WHERE role_type = $1
    AND resource_id = $2`,

  fetchNonSuperAdminRoles: `
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

  getRoles: `
    SELECT
        id,
        code,
        name,
        (SELECT COUNT(id) FROM admins WHERE role_type = code) AS number_of_admins,
        status,
        to_char(DATE (created_at)::date, 'Mon DD YYYY') As date
    FROM admin_roles
    WHERE (name ILIKE TRIM($1) OR $1 IS NULL)
    AND (status = $2 OR $2 IS NULL)
    AND ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
    ORDER BY created_at DESC
    OFFSET $5
    LIMIT $6
  `,

  getAllRoles: `
    SELECT
        id,
        code,
        name,
        (SELECT COUNT(id) FROM admins WHERE role_type = code) AS number_of_admins,
        status,
        to_char(DATE (created_at)::date, 'Mon DD YYYY') As date
    FROM admin_roles
    WHERE (name ILIKE TRIM($1) OR $1 IS NULL)
    AND (status = $2 OR $2 IS NULL)
    AND ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
    ORDER BY created_at DESC
  `,

  getRoleCount: `
    SELECT
       COUNT(code) AS total_count
    FROM admin_roles
    WHERE (name ILIKE TRIM($1) OR $1 IS NULL)
    AND (status = $2 OR $2 IS NULL)
    AND ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
  `,

  getAdminsPerRole: `
    SELECT
      admin_id,
      CONCAT(first_name, ' ', last_name) AS name,
      email,
      status,
      to_char(DATE (created_at)::date, 'Mon DD YYYY') As date,
      role_type
    FROM admins
    WHERE role_type= $1
    AND (status = $2 OR  $2 IS NULL)
    AND ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
    AND (TRIM(CONCAT(first_name, ' ', last_name)) ILIKE TRIM($5)
    OR TRIM(CONCAT(last_name, ' ', first_name)) ILIKE TRIM($5)
    OR $5 IS NULL)
    OFFSET $6
    LIMIT $7
  `,

  getAdminsPerRoleCount: `
  SELECT
     COUNT(role_type) AS total_count
  FROM admins
  WHERE role_type = $1
  AND (status = $2 OR $2 IS NULL)
  AND ((created_at::DATE BETWEEN $3::DATE AND $4::DATE) OR ($3 IS NULL AND $4 IS NULL))
  AND (TRIM(CONCAT(first_name, ' ', last_name)) ILIKE TRIM($5)
  OR TRIM(CONCAT(last_name, ' ', first_name)) ILIKE TRIM($5)
  OR $5 IS NULL)
  `,

  fetchMerchantAdminResources: `
    SELECT
      id,
      resource_id,
      name
    FROM merchant_admin_resources`
};
