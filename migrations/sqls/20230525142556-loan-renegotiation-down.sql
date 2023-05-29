ALTER TABLE address_verification DROP COLUMN IF EXISTS is_editable;

ALTER TABLE clusters ALTER COLUMN minimum_monthly_income SET NOT NULL;

ALTER TABLE personal_loans DROP COLUMN IF EXISTS initial_amount_requested;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS initial_loan_tenor_in_months;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS total_reschedule_extension_days;

DROP INDEX IF EXISTS personal_rescheduled_loan_reschedule_id_index;
DROP INDEX IF EXISTS personal_rescheduled_loan_loan_id_index;
DROP INDEX IF EXISTS personal_renegotiated_loan_renegotiation_id_index;
DROP INDEX IF EXISTS personal_renegotiated_loan_loan_id_index;

DROP TABLE IF EXISTS personal_rescheduled_loan CASCADE;
DROP TABLE IF EXISTS personal_renegotiated_loan CASCADE;
