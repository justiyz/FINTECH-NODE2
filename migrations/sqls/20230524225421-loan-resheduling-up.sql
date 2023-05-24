CREATE TYPE cluster_interest_type AS ENUM('fixed', 'discount');

ALTER TABLE cluster_members DROP COLUMN IF EXISTS loan_status;
ALTER TABLE clusters DROP COLUMN IF EXISTS loan_status;

ALTER TABLE cluster_members ADD COLUMN IF NOT EXISTS loan_status loan_status DEFAULT 'inactive';
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS loan_status loan_status DEFAULT 'inactive';
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS company_name VARCHAR;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS company_address TEXT;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS company_type VARCHAR;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS company_contact_number VARCHAR;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS interest_type cluster_interest_type;
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS percentage_interest_type_value NUMERIC;

CREATE TABLE IF NOT EXISTS personal_loan_rescheduling_extension(
    id SERIAL PRIMARY KEY,
    extension_in_days INTEGER UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO personal_loan_rescheduling_extension
    (extension_in_days)
VALUES
    (1),
    (7),
    (14);

INSERT INTO admin_env_values_settings
    (name, value, description)
VALUES
    ('allowable_personal_loan_rescheduling_count', '1', 'the number of allowable times a user can reschedule a loan application');

ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS is_rescheduled BOOLEAN DEFAULT false;
ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS reschedule_extension_days INTEGER REFERENCES personal_loan_rescheduling_extension(extension_in_days);
ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS reschedule_count INTEGER;
ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS renegotiation_count INTEGER;
ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS reschedule_loan_tenor_in_months VARCHAR;
ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS reschedule_at TIMESTAMPTZ;

ALTER TABLE personal_loan_payment_schedules ADD COLUMN IF NOT EXISTS rescheduled_proposed_payment_date TIMESTAMPTZ;

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('ADBLKCMBIT', 'admin bulk cluster member invite', 'admin invites cluster member using the bulk invite option');
