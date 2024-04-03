/* Replace with your SQL commands */

DROP INDEX IF EXISTS merchant_admin_activity_logs_merchant_admin_id_index;
DROP INDEX IF EXISTS merchant_admin_activity_logs_activity_type_index;
DROP INDEX IF EXISTS merchant_admin_resources_resource_id_index;
DROP INDEX IF EXISTS merchant_admin_permissions_merchant_admin_id_index;
DROP INDEX IF EXISTS merchant_admin_permissions_resource_id_index;

DROP TABLE IF EXISTS merchant_admin_permissions CASCADE;
DROP TABLE IF EXISTS merchant_admin_resources CASCADE;
DROP TABLE IF EXISTS merchant_admin_activity_logs CASCADE;
ALTER TABLE merchant_admins DROP COLUMN IF EXISTS role_name;
ALTER TABLE merchant_admins DROP COLUMN IF EXISTS is_created_by_seedfi;






