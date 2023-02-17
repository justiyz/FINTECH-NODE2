ALTER TABLE users DROP COLUMN IF EXISTS device_token;

DROP TYPE IF EXISTS loan_application_status CASCADE;
DROP TYPE IF EXISTS loan_payment_status CASCADE;

DROP INDEX IF EXISTS personal_loans_user_id_index;
DROP INDEX IF EXISTS personal_loans_loan_id_index;
DROP INDEX IF EXISTS personal_loans_status_index;

DROP INDEX IF EXISTS personal_loan_payment_schedules_user_id_index;
DROP INDEX IF EXISTS personal_loan_payment_schedules_loan_id_index;
DROP INDEX IF EXISTS personal_loan_payment_schedules_loan_repayment_id_index;
DROP INDEX IF EXISTS personal_loan_payment_schedules_status_index;

DROP TABLE IF EXISTS personal_loans CASCADE;
DROP TABLE IF EXISTS personal_loan_payment_schedules CASCADE;
