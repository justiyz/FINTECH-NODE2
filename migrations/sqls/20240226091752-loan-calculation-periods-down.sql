/* Replace with your SQL commands */
DROP INDEX IF EXISTS loan_calculation_periods_id_index;
DROP INDEX IF EXISTS loan_calculation_periods_period_index;
DROP TABLE IF EXISTS loan_calculation_periods CASCADE;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS is_created_by_admin;