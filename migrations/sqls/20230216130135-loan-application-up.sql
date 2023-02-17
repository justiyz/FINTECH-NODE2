ALTER TABLE users ADD COLUMN IF NOT EXISTS device_token TEXT;

CREATE TYPE loan_application_status AS ENUM('pending', 'declined', 'approved', 'ongoing', 'over due', 'completed');
CREATE TYPE loan_payment_status AS ENUM('paid', 'not due', 'over due');

CREATE TABLE IF NOT EXISTS personal_loans(
    id SERIAL,
    loan_id VARCHAR PRIMARY KEY DEFAULT 'pers-loan-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    amount_requested NUMERIC(19,4) NOT NULL,
    loan_reason TEXT,
    loan_tenor_in_months VARCHAR NOT NULL,
    total_repayment_amount NUMERIC(19,4),
    total_interest_amount NUMERIC(19,4),
    percentage_orr_score VARCHAR,
    percentage_pricing_band VARCHAR,
    percentage_processing_fee VARCHAR,
    percentage_insurance_fee VARCHAR,
    percentage_advisory_fee VARCHAR,
    monthly_interest NUMERIC(19,4),
    processing_fee NUMERIC(19,4),
    insurance_fee NUMERIC(19,4),
    advisory_fee NUMERIC(19,4),
    monthly_repayment NUMERIC(19,4),
    status loan_application_status DEFAULT 'pending',
    loan_decision VARCHAR,
    is_renegotatied BOOLEAN DEFAULT false,
    renegotiation_reason TEXT,
    is_loan_disbursed BOOLEAN DEFAULT false,
    loan_disbursed_at TIMESTAMPTZ,
    loan_application_declined_reason TEXT,
    extra_data JSON,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX personal_loans_user_id_index ON personal_loans(user_id);
CREATE INDEX personal_loans_loan_id_index ON personal_loans(loan_id);
CREATE INDEX personal_loans_status_index ON personal_loans(status);

CREATE TABLE IF NOT EXISTS personal_loan_payment_schedules(
    id SERIAL,
    loan_repayment_id VARCHAR PRIMARY KEY DEFAULT 'pers-loan-repy' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    loan_id VARCHAR NOT NULL REFERENCES personal_loans(loan_id),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    repayment_order INT NOT NULL,
    principal_payment NUMERIC(19,4) NOT NULL,
    interest_payment NUMERIC(19,4) NOT NULL,
    fees NUMERIC(19,4) NOT NULL,
    total_payment_amount NUMERIC(19,4) NOT NULL,
    pre_payment_outstanding_amount NUMERIC(19,4) NOT NULL,
    post_payment_outstanding_amount NUMERIC(19,4) NOT NULL,
    proposed_payment_date TIMESTAMPTZ NOT NULL,
    payment_at TIMESTAMPTZ,
    status loan_payment_status DEFAULT 'not due',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX personal_loan_payment_schedules_user_id_index ON personal_loan_payment_schedules(user_id);
CREATE INDEX personal_loan_payment_schedules_loan_id_index ON personal_loan_payment_schedules(loan_id);
CREATE INDEX personal_loan_payment_schedules_loan_repayment_id_index ON personal_loan_payment_schedules(loan_repayment_id);
CREATE INDEX personal_loan_payment_schedules_status_index ON personal_loan_payment_schedules(status);

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('APLYLOAN', 'apply for personal loan', 'user applies for personal loan'),
    ('PLONAPAUT', 'personal loan approved automatically', 'users personal loan approved automatically'),
    ('PLONDCLND', 'personal loan declined', 'users personal loan declined'),
    ('PLONMNAPP', 'personal loan subjected to manual approval', 'users personal loan subjected to manual approval'),
    ('RNGPSLOAN', 'renegotiate personal loan', 'user renegotiates personal loan'),
    ('PSLOANDBSD', 'personal loan disbursed', 'personal loan disbursed to user');
