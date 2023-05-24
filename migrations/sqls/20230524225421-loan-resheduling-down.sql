DROP TYPE IF EXISTS cluster_interest_type CASCADE;

ALTER TABLE cluster_members DROP COLUMN IF EXISTS loan_status;
ALTER TABLE clusters DROP COLUMN IF EXISTS loan_status;

ALTER TABLE clusters DROP COLUMN IF EXISTS company_name;
ALTER TABLE clusters DROP COLUMN IF EXISTS company_address;
ALTER TABLE clusters DROP COLUMN IF EXISTS company_type;
ALTER TABLE clusters DROP COLUMN IF EXISTS company_contact_number;
ALTER TABLE clusters DROP COLUMN IF EXISTS interest_type;
ALTER TABLE clusters DROP COLUMN IF EXISTS percentage_interest_type_value;

DROP TABLE IF EXISTS personal_loan_rescheduling_extension CASCADE;

ALTER TABLE personal_loans DROP COLUMN IF EXISTS is_rescheduled;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS reschedule_extension_days;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS reschedule_count;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS renegotiation_count;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS reschedule_loan_tenor_in_months;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS reschedule_at;
