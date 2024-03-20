CREATE TABLE IF NOT EXISTS verified_bvn_records (
  id SERIAL NOT NULL,
  record_id VARCHAR PRIMARY KEY UNIQUE DEFAULT ('user-bvn-' || LOWER(REPLACE(CAST(uuid_generate_v1mc() AS VARCHAR(50)), '-',''))),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  bvn TEXT NOT NULL,
  gender TEXT NOT NULL,
  date_of_birth TEXT NULL,
  phone_number TEXT NULL,
  email VARCHAR(255) NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
