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
    FROM admin_resources`
};
