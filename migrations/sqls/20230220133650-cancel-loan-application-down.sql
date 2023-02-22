DROP TYPE IF EXISTS loan_application_status CASCADE;

DROP INDEX IF EXISTS personal_loans_status_index;
DROP INDEX IF EXISTS admin_env_values_settings_name_index;
DROP INDEX IF EXISTS admin_env_values_settings_env_id_index;

DROP TABLE IF EXISTS admin_env_values_settings CASCADE;

ALTER TABLE personal_loans DROP COLUMN IF EXISTS total_outstanding_amount;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS extra_interests;
