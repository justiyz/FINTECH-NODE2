ALTER TABLE address_verification DROP COLUMN IF EXISTS is_editable;
ALTER TABLE address_verification ADD COLUMN IF NOT EXISTS is_editable BOOLEAN DEFAULT true;

ALTER TABLE clusters ALTER COLUMN minimum_monthly_income DROP NOT NULL;
ALTER TABLE personal_loans DROP CONSTRAINT IF EXISTS personal_loans_reschedule_extension_days_fkey;

ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS initial_amount_requested NUMERIC(19,4);

CREATE TABLE IF NOT EXISTS personal_rescheduled_loan(
    id SERIAL,
    reschedule_id VARCHAR PRIMARY KEY DEFAULT 'reschedule-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    loan_id VARCHAR NOT NULL REFERENCES personal_loans(loan_id), 
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    extension_in_days INTEGER NOT NULL,
    is_accepted BOOLEAN DEFAULT false, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX personal_rescheduled_loan_reschedule_id_index ON personal_rescheduled_loan(reschedule_id);
CREATE INDEX personal_rescheduled_loan_loan_id_index ON personal_rescheduled_loan(loan_id);

CREATE TABLE IF NOT EXISTS personal_renegotiated_loan(
    id SERIAL,
    renegotiation_id VARCHAR PRIMARY KEY DEFAULT 'renegotiation-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    loan_id VARCHAR NOT NULL REFERENCES personal_loans(loan_id), 
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    previous_loan_amount NUMERIC(19,4) NOT NULL,
    renegotiating_loan_amount NUMERIC(19,4) NOT NULL,
    previous_loan_tenor_in_months VARCHAR NOT NULL,
    renegotiating_loan_tenor_in_month VARCHAR NOT NULL,
    pricing_band NUMERIC(19,4),
    monthly_interest NUMERIC(19,4),
    monthly_repayment NUMERIC(19,4),
    processing_fee NUMERIC(19,4),
    advisory_fee NUMERIC(19,4),
    insurance_fee NUMERIC(19,4),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX personal_renegotiated_loan_renegotiation_id_index ON personal_renegotiated_loan(renegotiation_id);
CREATE INDEX personal_renegotiated_loan_loan_id_index ON personal_renegotiated_loan(loan_id);

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('INLNRSCDLN', 'initiate loan rescheduling', 'user initiates loan rescheduling');
