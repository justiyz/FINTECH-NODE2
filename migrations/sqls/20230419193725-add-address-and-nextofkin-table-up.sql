ALTER TABLE users RENAME COLUMN number_of_dependents TO number_of_children;
ALTER TABLE users DROP COLUMN IF EXISTS address_image_url;

ALTER TABLE users ADD COLUMN IF NOT EXISTS next_profile_update VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_uploaded_utility_bill BOOLEAN DEFAULT false;

ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS max_possible_approval VARCHAR;

CREATE TABLE IF NOT EXISTS address_verification(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    street VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    house_number VARCHAR NOT NULL,
    lga VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    type_of_residence VARCHAR NOT NULL,
    rent_amount VARCHAR,
    is_verified_address BOOLEAN DEFAULT false,
    address_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS next_of_kin(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    phone_number VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    kind_of_relationship VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employment_type(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    employment_type VARCHAR NOT NULL,
    company_name VARCHAR,
    school_name VARCHAR,
    date_started VARCHAR,
    next_update VARCHAR NOT NULL,
    income_range  VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX address_verification_user_id_index ON address_verification(user_id);
CREATE INDEX next_of_kin_user_id_index ON next_of_kin(user_id);
CREATE INDEX employment_type_user_id_index ON employment_type(user_id);
