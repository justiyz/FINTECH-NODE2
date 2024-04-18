CREATE TABLE IF NOT EXISTS pre_disbursement_loan_payment_schedules(
    id SERIAL,
    loan_repayment_id VARCHAR PRIMARY KEY DEFAULT 'pre-disb-loan-repy' || LOWER(
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

CREATE INDEX pre_disbursement_loan_payment_schedules_user_id_index ON pre_disbursement_loan_payment_schedules(user_id);
CREATE INDEX pre_disbursement_loan_payment_schedules_loan_id_index ON pre_disbursement_loan_payment_schedules(loan_id);
CREATE INDEX pre_disbursement_loan_payment_schedules_loan_repayment_id_index ON pre_disbursement_loan_payment_schedules(loan_repayment_id);
CREATE INDEX pre_disbursement_loan_payment_schedules_status_index ON pre_disbursement_loan_payment_schedules(status);
