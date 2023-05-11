ALTER TABLE clusters DROP COLUMN IF EXISTS created_by;
ALTER TABLE clusters DROP COLUMN IF EXISTS admin;
ALTER TABLE clusters DROP COLUMN IF EXISTS loan_amount;
ALTER TABLE clusters DROP COLUMN IF EXISTS is_created_by_admin;

ALTER TABLE admin_activity_logs DROP COLUMN IF EXISTS description;