/* Replace with your SQL commands */

ALTER TABLE merchant_admins RENAME COLUMN role_name TO role_type;
ALTER TABLE merchant_admin_activity_logs ADD COLUMN IF NOT EXISTS description TEXT;