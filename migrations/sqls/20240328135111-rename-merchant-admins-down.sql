/* Replace with your SQL commands */

ALTER TABLE merchant_admins RENAME COLUMN role_type TO role_name;
ALTER TABLE merchant_admin_activity_logs DROP COLUMN IF EXISTS description;
