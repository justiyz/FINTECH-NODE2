CREATE TYPE merchant_admin_status AS ENUM('pending', 'active', 'deactivated');
CREATE TYPE merchant_admin_gender AS ENUM('male', 'female');

CREATE TABLE IF NOT EXISTS merchant_admins (
  id SERIAL,
  merchant_admin_id VARCHAR PRIMARY KEY UNIQUE DEFAULT ('merchant-admin-' || LOWER(REPLACE(CAST(uuid_generate_v1mc() AS VARCHAR(50)), '-',''))),
  merchant_id VARCHAR(255) NOT NULL,
  CONSTRAINT merchant_id_fk FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  status merchant_admin_status DEFAULT 'pending',
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20) NOT NULL UNIQUE,
  gender merchant_admin_gender DEFAULT 'male' NOT NULL,
  password TEXT,
  is_verified_email BOOLEAN DEFAULT false,
  verification_token TEXT,
  verification_token_expires TIMESTAMPTZ,
  invalid_verification_token_count INTEGER DEFAULT 0,
  verification_token_request_count INTEGER DEFAULT 0,
  is_created_password BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

