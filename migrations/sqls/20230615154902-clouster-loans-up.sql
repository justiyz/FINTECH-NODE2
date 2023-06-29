CREATE TYPE cluster_loan_sharing_type AS ENUM('equal', 'self-allocate');

ALTER TABLE personal_loans RENAME COLUMN is_renegotatied To is_renegotiated;
ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS used_previous_eligibility_details BOOLEAN DEFAULT false;

CREATE TABLE IF NOT EXISTS cluster_loans (
    id SERIAL,
    loan_id VARCHAR PRIMARY KEY DEFAULT 'cluster-loan-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    cluster_id VARCHAR NOT NULL REFERENCES clusters(cluster_id),
    cluster_name VARCHAR,
    initiator_id VARCHAR NOT NULL REFERENCES users(user_id),
    total_amount_requested NUMERIC(19,4) NOT NULL,
    loan_tenor_in_months VARCHAR NOT NULL,
    sharing_type cluster_loan_sharing_type NOT NULL,
    percentage_interest_rate VARCHAR,
    total_repayment_amount NUMERIC(19,4),
    total_interest_amount NUMERIC(19,4),
    total_monthly_repayment NUMERIC(19,4),
    status loan_application_status DEFAULT 'pending',
    rejection_reason TEXT,
    extra_data JSON,
    is_loan_disbursed BOOLEAN DEFAULT false,
    loan_disbursed_at TIMESTAMPTZ,
    can_disburse_loan BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    initial_total_amount_requested NUMERIC(19,4),
    initial_loan_tenor_in_months VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_loans_loan_id_index ON cluster_loans(loan_id);
CREATE INDEX cluster_loans_status_index ON cluster_loans(status);
CREATE INDEX cluster_loans_cluster_id_index ON cluster_loans(cluster_id);

CREATE TABLE IF NOT EXISTS cluster_member_loans (
    id SERIAL,
    member_loan_id VARCHAR PRIMARY KEY DEFAULT 'member-loan-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    loan_id VARCHAR NOT NULL REFERENCES cluster_loans(loan_id),
    cluster_id VARCHAR NOT NULL REFERENCES clusters(cluster_id),
    cluster_name VARCHAR,
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    sharing_type cluster_loan_sharing_type NOT NULL,
    total_cluster_amount NUMERIC(19,4) NOT NULL,
    amount_requested NUMERIC(19,4) NOT NULL,
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
    is_loan_initiator BOOLEAN DEFAULT false,
    is_renegotiated BOOLEAN DEFAULT false,
    is_loan_disbursed BOOLEAN DEFAULT false,
    loan_disbursed_at TIMESTAMPTZ,
    loan_application_declined_reason TEXT,
    accepted_loan_request BOOLEAN DEFAULT false,
    is_taken_loan_request_decision BOOLEAN DEFAULT false,
    extra_data JSON,
    total_outstanding_amount NUMERIC(19,4),
    extra_interests NUMERIC(19,4),
    offer_letter_url TEXT,
    rejection_reason TEXT,
    max_possible_approval NUMERIC(19,4),
    is_rescheduled BOOLEAN DEFAULT false,
    reschedule_extension_days INTEGER REFERENCES personal_loan_rescheduling_extension(extension_in_days),
    reschedule_count INTEGER DEFAULT 0,
    renegotiation_count INTEGER DEFAULT 0,
    reschedule_loan_tenor_in_months VARCHAR,
    reschedule_at TIMESTAMPTZ,
    initial_amount_requested NUMERIC(19,4),
    initial_loan_tenor_in_months VARCHAR,
    total_reschedule_extension_days VARCHAR,
    completed_at TIMESTAMPTZ,
    used_previous_eligibility_details BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_member_loans_loan_id_index ON cluster_member_loans(loan_id);
CREATE INDEX cluster_member_loans_status_index ON cluster_member_loans(status);
CREATE INDEX cluster_member_loans_cluster_id_index ON cluster_member_loans(cluster_id);
CREATE INDEX cluster_member_loans_member_loan_id_index ON cluster_member_loans(member_loan_id);
CREATE INDEX cluster_member_loans_user_id_index ON cluster_member_loans(user_id);

CREATE TABLE IF NOT EXISTS cluster_member_loan_disbursements (
    id SERIAL,
    disbursement_id VARCHAR PRIMARY KEY DEFAULT 'disburse-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    cluster_id VARCHAR NOT NULL REFERENCES clusters(cluster_id),
    member_loan_id VARCHAR NOT NULL REFERENCES cluster_member_loans(member_loan_id),
    loan_id VARCHAR NOT NULL REFERENCES cluster_loans(loan_id),
    amount NUMERIC(19,4) NOT NULL,
    payment_id INTEGER NOT NULL REFERENCES paystack_payment_histories(id),
    account_number VARCHAR,
    account_name VARCHAR,
    bank_name VARCHAR,
    bank_code VARCHAR,
    recipient_id VARCHAR,
    transfer_code VARCHAR,
    status loan_disbursement_payment_type,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_member_loan_disbursements_loan_id_index ON cluster_member_loan_disbursements(loan_id);
CREATE INDEX cluster_member_loan_disbursements_user_id_index ON cluster_member_loan_disbursements(user_id);
CREATE INDEX cluster_member_loan_disbursements_member_loan_id_index ON cluster_member_loan_disbursements(member_loan_id);
CREATE INDEX cluster_member_loan_disbursements_cluster_id_index ON cluster_member_loan_disbursements(cluster_id);

CREATE TABLE IF NOT EXISTS cluster_member_loan_payment_schedules (
    id SERIAL,
    loan_repayment_id VARCHAR PRIMARY KEY DEFAULT 'member-loan-repy-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    cluster_id VARCHAR NOT NULL REFERENCES clusters(cluster_id),
    member_loan_id VARCHAR NOT NULL REFERENCES cluster_member_loans(member_loan_id),
    loan_id VARCHAR NOT NULL REFERENCES cluster_loans(loan_id),
    repayment_order INTEGER NOT NULL,
    principal_payment NUMERIC(19,4) NOT NULL,
    interest_payment NUMERIC(19,4) NOT NULL,
    fees NUMERIC(19,4) NOT NULL,
    total_payment_amount NUMERIC(19,4) NOT NULL,
    pre_payment_outstanding_amount NUMERIC(19,4) NOT NULL,
    post_payment_outstanding_amount NUMERIC(19,4) NOT NULL,
    proposed_payment_date TIMESTAMPTZ NOT NULL,
    payment_at TIMESTAMPTZ,
    status loan_payment_status DEFAULT 'not due',
    pre_reschedule_proposed_payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_member_loan_payment_schedules_loan_id_index ON cluster_member_loan_payment_schedules(loan_id);
CREATE INDEX cluster_member_loan_payment_schedules_user_id_index ON cluster_member_loan_payment_schedules(user_id);
CREATE INDEX cluster_member_loan_payment_schedules_member_loan_id_index ON cluster_member_loan_payment_schedules(member_loan_id);
CREATE INDEX cluster_member_loan_payment_schedules_cluster_id_index ON cluster_member_loan_payment_schedules(cluster_id);
CREATE INDEX cluster_member_loan_payment_schedules_status_index ON cluster_member_loan_payment_schedules(status);

CREATE TABLE IF NOT EXISTS cluster_member_loan_payments (
    id SERIAL,
    payment_id VARCHAR PRIMARY KEY DEFAULT 'loan-pymt-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    cluster_id VARCHAR NOT NULL REFERENCES clusters(cluster_id),
    member_loan_id VARCHAR NOT NULL REFERENCES cluster_member_loans(member_loan_id),
    loan_id VARCHAR NOT NULL REFERENCES cluster_loans(loan_id),
    amount NUMERIC(19,4) NOT NULL,
    loan_purpose VARCHAR,
    transaction_type transaction_type,
    status VARCHAR DEFAULT 'paid',
    payment_description text,
    payment_means VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_member_loan_payments_loan_id_index ON cluster_member_loan_payments(loan_id);
CREATE INDEX cluster_member_loan_payments_user_id_index ON cluster_member_loan_payments(user_id);
CREATE INDEX cluster_member_loan_payments_member_loan_id_index ON cluster_member_loan_payments(member_loan_id);
CREATE INDEX cluster_member_loan_payments_cluster_id_index ON cluster_member_loan_payments(cluster_id);
CREATE INDEX cluster_member_loan_payments_transaction_type_index ON cluster_member_loan_payments(transaction_type);

CREATE TABLE cluster_member_renegotiated_loan (
    id SERIAL,
    renegotiation_id VARCHAR PRIMARY KEY DEFAULT 'renegotiation-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    cluster_id VARCHAR NOT NULL REFERENCES clusters(cluster_id),
    member_loan_id VARCHAR NOT NULL REFERENCES cluster_member_loans(member_loan_id),
    loan_id VARCHAR NOT NULL REFERENCES cluster_loans(loan_id),
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

CREATE INDEX cluster_member_renegotiated_loan_loan_id_index ON cluster_member_renegotiated_loan(loan_id);
CREATE INDEX cluster_member_renegotiated_loan_user_id_index ON cluster_member_renegotiated_loan(user_id);
CREATE INDEX cluster_member_renegotiated_loan_member_loan_id_index ON cluster_member_renegotiated_loan(member_loan_id);
CREATE INDEX cluster_member_renegotiated_loan_cluster_id_index ON cluster_member_renegotiated_loan(cluster_id);

CREATE TABLE cluster_member_rescheduled_loan (
    id SERIAL,
    reschedule_id VARCHAR PRIMARY KEY DEFAULT 'reschedule-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    cluster_id VARCHAR NOT NULL REFERENCES clusters(cluster_id),
    member_loan_id VARCHAR NOT NULL REFERENCES cluster_member_loans(member_loan_id),
    loan_id VARCHAR NOT NULL REFERENCES cluster_loans(loan_id),
    extension_in_days INTEGER NOT NULL,
    is_accepted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cluster_member_rescheduled_loan_loan_id_index ON cluster_member_rescheduled_loan(loan_id);
CREATE INDEX cluster_member_rescheduled_loan_user_id_index ON cluster_member_rescheduled_loan(user_id);
CREATE INDEX cluster_member_rescheduled_loan_member_loan_id_index ON cluster_member_rescheduled_loan(member_loan_id);
CREATE INDEX cluster_member_rescheduled_loan_cluster_id_index ON cluster_member_rescheduled_loan(cluster_id);

INSERT INTO admin_resources
    (name) 
VALUES
    ('notifications');


INSERT INTO admin_env_values_settings
    (name, value, description)
VALUES
    ('private_cluster_fixed_interest_rate', '30', 'this is a fixed interest rate for all private clusters loan application');
