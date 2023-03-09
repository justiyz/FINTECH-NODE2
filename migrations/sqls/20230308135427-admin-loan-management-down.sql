DROP TYPE IF EXISTS user_account_status CASCADE;

ALTER TABLE users DROP COLUMN IF EXISTS status;
ALTER TABLE users DROP COLUMN IF EXISTS address_image_url;

ALTER TABLE personal_loans DROP COLUMN IF EXISTS user_tier;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS rejection_reason;

ALTER TABLE personal_loans DROP COLUMN IF EXISTS suggested_cluster_admin;

DROP INDEX IF EXISTS user_admin_uploaded_documents_id_index;
DROP INDEX IF EXISTS user_admin_uploaded_documents_user_id_index;

DROP INDEX IF EXISTS cron_job_trail_id_index;
DROP INDEX IF EXISTS cron_job_trail_user_id_index;

DROP TABLE IF EXISTS user_admin_uploaded_documents CASCADE;
DROP TABLE IF EXISTS cron_job_trail CASCADE;

