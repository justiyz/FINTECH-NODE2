CREATE TABLE banks (
  id NUMERIC NOT NULL,
  record_id VARCHAR PRIMARY KEY UNIQUE DEFAULT ('bank-' || LOWER(REPLACE(CAST(uuid_generate_v1mc() AS VARCHAR(50)), '-',''))),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  code TEXT NOT NULL,
  longcode TEXT NOT NULL,
  gateway TEXT NULL,
  pay_with_bank BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  country TEXT NOT NULL,
  currency TEXT NOT NULL,
  type TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
