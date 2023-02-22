DROP INDEX IF EXISTS personal_loans_status_index;
DROP TYPE IF EXISTS loan_application_status CASCADE;

CREATE TYPE loan_application_status AS ENUM('pending', 'cancelled', 'declined', 'approved', 'ongoing', 'over due', 'completed');

ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS status loan_application_status DEFAULT 'pending';

CREATE INDEX personal_loans_status_index ON personal_loans(status);

ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS total_outstanding_amount NUMERIC(19,4) DEFAULT 0;
ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS extra_interests NUMERIC(19,4) DEFAULT 0;

CREATE TABLE IF NOT EXISTS admin_env_values_settings(
    id SERIAL,
    env_id VARCHAR PRIMARY KEY DEFAULT 'admin-env-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(20))
            , '-',''
        )
    ),
    name VARCHAR UNIQUE NOT NULL,
    value VARCHAR NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX admin_env_values_settings_name_index ON admin_env_values_settings(name);
CREATE INDEX admin_env_values_settings_env_id_index ON admin_env_values_settings(env_id);

INSERT INTO admin_env_values_settings
    (name, value, description)
VALUES
    ('card_tokenization_charge', '500', 'amount to be deducted from user account when adding a card to the platform, it is usually refunded' ),
    ('maximum_loan_amount', '2000000', 'maximum allowable loan amount' ),
    ('maximum_loan_tenor', '12', 'maximum allowable loan tenor' ),
    ('minimum_loan_tenor', '1', 'minimum allowable loan tenor' );

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('CNCPLNAP', 'user cancel personal loan application process', 'user cancels personal loan application process');
