CREATE TYPE merchant_status AS ENUM('pending', 'active', 'deactivated');

CREATE TABLE IF NOT EXISTS merchants (
    id SERIAL,
    merchant_id VARCHAR PRIMARY KEY DEFAULT 'merchant-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    interest_rate VARCHAR(255) NOT NULL,
    orr_score_threshold VARCHAR(255) NOT NULL,
    address TEXT NULL,
    secret_key TEXT NOT NULL,
    status merchant_status DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO activity_types
    (code, name, description)
VALUES
    ('CRMERCH', 'create merchant account', 'admin creates a merchant account'),
    ('EDTMERCH', 'edit merchant account info', 'admin edited a merchant account info'),
    ('ACTMERCH', 'activate merchant account', 'admin activated a merchant account'),
    ('DACTMERCH', 'deactivate merchant account', 'admin deactivated a merchant account'),
    ('EDMERCHINT', 'edit merchant interest rate', 'admin edited a merchant interest rate'),
    ('EDMERCHORR', 'edit merchant ORR score', 'admin edited a merchant ORR score');

INSERT INTO admin_resources
    (name)
VALUES
    ('merchants');

CREATE TABLE IF NOT EXISTS merchant_bank_accounts (
    id SERIAL PRIMARY KEY,
    merchant_id VARCHAR NOT NULL,
    CONSTRAINT merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id) ON DELETE CASCADE,
    bank_name VARCHAR NOT NULL,
    bank_code VARCHAR NOT NULL,
    account_number VARCHAR NOT NULL,
    account_name VARCHAR NOT NULL,
    transfer_recipient_code VARCHAR,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
