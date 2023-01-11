DROP INDEX IF EXISTS admin_resources_resource_id_index;
DROP INDEX IF EXISTS admin_role_permissions_role_type_index;
DROP INDEX IF EXISTS admin_role_permissions_resource_id_index;
DROP INDEX IF EXISTS admin_user_permissions_admin_id_index;
DROP INDEX IF EXISTS admin_user_permissions_resource_id_index;

DROP TABLE IF EXISTS admin_resources CASCADE;
DROP TABLE IF EXISTS admin_role_permissions CASCADE;
DROP TABLE IF EXISTS admin_user_permissions CASCADE;
