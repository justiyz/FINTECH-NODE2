DROP INDEX IF EXISTS admin_roles_code_index;
DROP INDEX IF EXISTS admin_roles_status_index;
DROP INDEX IF EXISTS admins_admin_id_index;
DROP INDEX IF EXISTS admins_email_index;
DROP INDEX IF EXISTS admins_verification_token_index;
DROP INDEX IF EXISTS admins_status_index;
DROP INDEX IF EXISTS admins_refresh_token_index;
DROP INDEX IF EXISTS admins_role_code_index;
DROP INDEX IF EXISTS admin_activity_logs_admin_id_index;
DROP INDEX IF EXISTS admin_activity_logs_activity_type_index;

DROP TYPE IF EXISTS admin_role_status CASCADE;

DROP TABLE IF EXISTS admin_roles CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS admin_activity_logs CASCADE;