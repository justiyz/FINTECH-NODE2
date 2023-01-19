CREATE TYPE user_loan_status AS ENUM('inactive', 'active');
CREATE TYPE payment_status AS ENUM('pending', 'success', 'fail');

UPDATE tiers
SET description = 'Basic BVN verification'
WHERE tier = '1';

UPDATE tiers
SET description = 'Basic BVN verification and valid Id upload and verification'
WHERE tier = '2';

ALTER TABLE tiers DROP COLUMN IF EXISTS max_loan_amount;
ALTER TABLE tiers DROP COLUMN IF EXISTS max_loan_tenor_in_months;

ALTER TABLE users RENAME COLUMN home_address TO address;

ALTER TABLE users ADD COLUMN IF NOT EXISTS income_range VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS number_of_dependants VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS marital_status VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS loan_status user_loan_status DEFAULT 'inactive';

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('EDONPRF', 'edit own profile', 'user edits own profile'),
    ('SVDCDTS', 'save debit card details', 'user save debit card details'),
    ('SVDBADTS', 'save bank account details', 'user save bank account details'),
    ('RMSVDDC', 'remove saved debit card', 'user remove saved debit card'),
    ('RMSVDBA', 'remove saved bank account', 'user remove saved bank account details'),
    ('CFMPWD', 'confirm password', 'user confirms password'),
    ('CFMPIN', 'confirm pin', 'user confirms transaction pin'),
    ('INTCDPYT', 'initialize card payment', 'user initializes card payment'),
    ('PYTRFDD', 'payment refunded', 'user gets refunded');

CREATE TABLE IF NOT EXISTS user_bank_accounts(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    bank_name VARCHAR NOT NULL,
    bank_code VARCHAR NOT NULL,
    account_number VARCHAR NOT NULL,
    account_name VARCHAR NOT NULL,
    is_default BOOLEAN DEFAULT 'false',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_bank_accounts
ADD CONSTRAINT user_bank_accounts_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE;

CREATE INDEX user_bank_accounts_user_id_index ON user_bank_accounts(user_id);
CREATE INDEX user_bank_accounts_is_default_index ON user_bank_accounts(is_default);

CREATE TABLE IF NOT EXISTS user_debit_cards(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    tokenising_platform VARCHAR NOT NULL,
    first_6_digits TEXT,
    last_4_digits TEXT,
    card_type VARCHAR,
    expiry_month VARCHAR,
    expiry_year VARCHAR,
    auth_token TEXT NOT NULL,
    card_attached_bank VARCHAR,
    card_holder_name VARCHAR,
    is_default BOOLEAN DEFAULT 'false',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_debit_cards
ADD CONSTRAINT user_bank_accounts_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE;

CREATE INDEX user_debit_cards_user_id_index ON user_debit_cards(user_id);
CREATE INDEX user_debit_cards_is_default_index ON user_debit_cards(is_default);

CREATE TABLE IF NOT EXISTS card_payment_histories(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    amount NUMERIC(19,4) NOT NULL,
    payment_platform VARCHAR,
    transaction_reference TEXT,
    transaction_id VARCHAR,
    payment_type VARCHAR,
    payment_status payment_status,
    is_initiated_refund BOOLEAN DEFAULT 'false',
    is_refunded BOOLEAN DEFAULT 'false',
    refund_status payment_status,
    refund_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX card_payment_histories_user_id_index ON card_payment_histories(user_id);
CREATE INDEX card_payment_histories_is_refunded_index ON card_payment_histories(is_refunded);
CREATE INDEX card_payment_histories_payment_status_index ON card_payment_histories(payment_status);
CREATE INDEX card_payment_histories_transaction_id_index ON card_payment_histories(transaction_id);
CREATE INDEX card_payment_histories_transaction_reference_index ON card_payment_histories(transaction_reference);
