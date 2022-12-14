CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE account_status AS ENUM('inactive', 'active', 'suspended', 'deactivated');
CREATE TYPE activity_status AS ENUM('success', 'fail');

CREATE TABLE IF NOT EXISTS activity_types(
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS national_id_types(
    id SERIAL,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO national_id_types
    (code, name) VALUES
    ('NIMC', 'National Identity Slip'),
    ('NIDC', 'National Identity Card'),
    ('VOC', 'Voter’s Card'),
    ('DLNSC', 'Driver’s License'),
    ('INTP', 'International Passport'),
    ('PRC', 'Permanent Resident Card');

CREATE TABLE IF NOT EXISTS tiers(
    id SERIAL,
    tier INT PRIMARY KEY,
    description VARCHAR,
    max_loan_amount NUMERIC(19,4),
    max_loan_tenor_in_months INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO tiers
    (tier, description) VALUES
    (0, 'No form of identity verification yet'),
    (1, 'Basic BVN verification and valid Id upload and verification'),
    (2, 'Basic BVN verification');

CREATE TABLE IF NOT EXISTS users(
    id SERIAL,
    user_id VARCHAR PRIMARY KEY DEFAULT 'user-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    title VARCHAR,
    first_name VARCHAR,
    middle_name VARCHAR,
    last_name VARCHAR,
    phone_number VARCHAR UNIQUE NOT NULL,
    email VARCHAR UNIQUE,
    tier INT REFERENCES tiers(tier) DEFAULT 0,
    gender VARCHAR,
    date_of_birth VARCHAR,
    bvn VARCHAR,
    home_address TEXT,
    image_url TEXT,
    verification_token TEXT,
    verification_token_expires TIMESTAMPTZ,
    password TEXT,
    pin TEXT,
    is_verified_phone_number BOOLEAN DEFAULT false,
    is_verified_email BOOLEAN DEFAULT false,
    is_uploaded_selfie_image BOOLEAN DEFAULT false,
    is_verified_bvn BOOLEAN DEFAULT false,
    is_created_password BOOLEAN DEFAULT false,
    is_created_pin BOOLEAN DEFAULT false,
    is_completed_kyc BOOLEAN DEFAULT false,
    is_uploaded_identity_card BOOLEAN DEFAULT false,
    referral_code VARCHAR,
    status account_status DEFAULT 'inactive',
    refresh_token TEXT,
    fcm_token TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION make_lower_trim() RETURNS TRIGGER AS '
    BEGIN
        new.first_name := LOWER(TRIM(new.first_name));
        new.middle_name := LOWER(TRIM(new.middle_name));
        new.last_name := LOWER(TRIM(new.last_name));
        new.email := LOWER(TRIM(new.email));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER make_lower_trim BEFORE INSERT OR UPDATE ON users FOR
EACH ROW EXECUTE PROCEDURE make_lower_trim();

CREATE TABLE IF NOT EXISTS user_activity_logs(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    activity_type VARCHAR NOT NULL,
    activity_status activity_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX user_activity_logs_user_id_index ON user_activity_logs(user_id);
CREATE INDEX user_activity_logs_activity_type_index ON user_activity_logs(activity_type);

ALTER TABLE user_activity_logs
ADD CONSTRAINT user_activity_logs_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE;

ALTER TABLE user_activity_logs
ADD CONSTRAINT user_activity_logs_activity_type_fkey
    FOREIGN KEY (activity_type)
    REFERENCES activity_types(code)
    ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS user_national_id_details(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL,
    id_type VARCHAR NOT NULL,
    card_number VARCHAR NOT NULL,
    issued_date VARCHAR,
    expiry_date VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_national_id_details
ADD CONSTRAINT user_national_id_details_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON UPDATE CASCADE;

ALTER TABLE user_national_id_details
ADD CONSTRAINT user_national_id_details_id_type_fkey
    FOREIGN KEY (id_type)
    REFERENCES national_id_types(name)
    ON UPDATE CASCADE;

CREATE INDEX users_user_id_index ON users(user_id);
CREATE INDEX users_phone_number_index ON users(phone_number);
CREATE INDEX users_email_index ON users(email);
CREATE INDEX users_verification_token_index ON users(verification_token);
CREATE INDEX users_status_index ON users(status);
CREATE INDEX users_refresh_token_index ON users(refresh_token);
CREATE INDEX users_referral_code_index ON users(referral_code);

CREATE TABLE IF NOT EXISTS referral_trail(
    id SERIAL PRIMARY KEY,
    referrer_user_id VARCHAR REFERENCES users(user_id),
    referred_user_id VARCHAR REFERENCES users(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX referral_trail_referrer_user_id_index ON referral_trail(referrer_user_id);
CREATE INDEX referral_trail_referred_user_id_index ON referral_trail(referred_user_id);

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('SNUP', 'signup', 'user creates an account with phone number'),
    ('VRYPN', 'verify signup phone number', 'user verifys signup phone number'),
    ('INVRYEML', 'initiate verify email', 'user initiates verifys email address'),
    ('VRYEML', 'verify email', 'user verifys email address'),
    ('VRYBVN', 'verify BVN', 'user verifies BVN'),
    ('RSPNVRYOTP', 'resend phone number verification OTP', 'user resends phone number verification OTP'),
    ('CMPKYCPWD', 'complete profile and create password', 'user completes profile and create password'),
    ('FGPWD', 'forgot password', 'user forgots password'),
    ('RSPWD', 'reset password', 'user resets password'),
    ('CHPWD', 'change password', 'user changes password'),
    ('CRPIN', 'create pin', 'user creates pin'),
    ('FGPIN', 'forgot pin', 'user forgots pin'),
    ('RSPIN', 'reset pin', 'user resets pin'),
    ('CHPIN', 'change pin', 'user changes pin'),
    ('LGIN', 'login', 'user logs in'),
    ('CFMTRPN', 'confirm transaction pin', 'user confirms transaction pi'),
    ('UPSIMG', 'upload selfie image', 'user snaps and uploads selfie image'),
    ('UPNID', 'upload national id', 'user snaps and uploads any national id card'),
    ('UPPRFL', 'update user profile', 'user updates own profile');
