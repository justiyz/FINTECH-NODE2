CREATE TYPE transaction_type AS ENUM('credit', 'debit');
CREATE TYPE loan_disbursement_payment_type AS ENUM('fail', 'success', 'reversed');

DROP INDEX IF EXISTS personal_loans_status_index;
DROP TYPE IF EXISTS loan_application_status CASCADE;

CREATE TYPE loan_application_status AS ENUM('pending', 'cancelled', 'in review', 'processing', 'declined', 'approved', 'ongoing', 'over due', 'completed');

ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS status loan_application_status DEFAULT 'pending';

CREATE INDEX personal_loans_status_index ON personal_loans(status);

ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS offer_letter_url TEXT;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS loan_application_declined_reason;

ALTER TABLE IF EXISTS card_payment_histories RENAME TO paystack_payment_histories;

ALTER TABLE paystack_payment_histories ADD COLUMN IF NOT EXISTS transaction_type transaction_type;
ALTER TABLE paystack_payment_histories ADD COLUMN IF NOT EXISTS payment_reason VARCHAR;
ALTER TABLE paystack_payment_histories ADD COLUMN IF NOT EXISTS loan_id VARCHAR;

CREATE TABLE IF NOT EXISTS personal_loan_disbursements(
    id SERIAL,
    disbursement_id VARCHAR PRIMARY KEY DEFAULT 'disburse-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    loan_id VARCHAR NOT NULL REFERENCES personal_loans(loan_id),
    amount NUMERIC(19,4) NOT NULL,
    payment_id INT NOT NULL REFERENCES paystack_payment_histories(id),
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

CREATE INDEX personal_loan_disbursements_disbursement_id_index ON personal_loan_disbursements(disbursement_id);
CREATE INDEX personal_loan_disbursements_user_id_index ON personal_loan_disbursements(user_id);
CREATE INDEX personal_loan_disbursements_loan_id_index ON personal_loan_disbursements(loan_id);
CREATE INDEX personal_loan_disbursements_status_index ON personal_loan_disbursements(status);

UPDATE tiers
SET description = 'BVN verified successfully'
WHERE tier = '1';

UPDATE tiers
SET description = 'BVN verified successfully and valid national identity card verified successfully'
WHERE tier = '2';

INSERT INTO tiers
    (tier, description) VALUES
    ('0', 'No form of identity verified yet') 
    ON CONFLICT (tier)
    DO
    UPDATE
    SET
    tier = EXCLUDED.tier,
    description = EXCLUDED.description;

ALTER TABLE users ALTER COLUMN tier SET DEFAULT '0';

ALTER INDEX IF EXISTS card_payment_histories_user_id_index RENAME TO paystack_payment_histories_user_id_index;
ALTER INDEX IF EXISTS card_payment_histories_is_refunded_index RENAME TO paystack_payment_histories_is_refunded_index;
ALTER INDEX IF EXISTS card_payment_histories_payment_status_index RENAME TO paystack_payment_histories_payment_status_index;
ALTER INDEX IF EXISTS card_payment_histories_transaction_id_index RENAME TO paystack_payment_histories_transaction_id_index;
ALTER INDEX IF EXISTS card_payment_histories_transaction_reference_index RENAME TO paystack_payment_histories_transaction_reference_index;

CREATE TABLE IF NOT EXISTS personal_loan_payments(
    id SERIAL,
    payment_id VARCHAR PRIMARY KEY DEFAULT 'loan-pymt-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    loan_id VARCHAR NOT NULL REFERENCES personal_loans(loan_id),
    amount NUMERIC(19,4) NOT NULL,
    loan_purpose VARCHAR,
    transaction_type transaction_type,
    status VARCHAR DEFAULT 'paid',
    payment_description TEXT,
    payment_means VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX personal_loan_payments_payment_id_index ON personal_loan_payments(payment_id);
CREATE INDEX personal_loan_payments_user_id_index ON personal_loan_payments(user_id);
CREATE INDEX personal_loan_payments_loan_id_index ON personal_loan_payments(loan_id);

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('INPSLNDSBT', 'personal loan disbursement initiated', 'user initiates personal loan disbursement'),
    ('PSLNDBSFLD', 'personal loan disbursement failed', 'user personal loan disbursement failed'),
    ('PSLNDBSRVD', 'personal loan disbursement payment reversed to seedfi account', 'personal loan disbursement payment reversed to seedfi account');
