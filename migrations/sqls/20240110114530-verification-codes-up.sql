CREATE TABLE IF NOT EXISTS verification_codes (
  verification_key VARCHAR(255) NOT NULL UNIQUE,
  code VARCHAR(255),
  expiresAt TIMESTAMPTZ,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE verification_codes ADD PRIMARY KEY (verification_key);

