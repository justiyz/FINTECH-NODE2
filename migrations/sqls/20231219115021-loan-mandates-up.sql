CREATE TABLE IF NOT EXISTS loan_mandate (
  id SERIAL,
  loan_id VARCHAR NOT NULL,
  institution_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE loan_mandate ADD PRIMARY KEY (id);

CREATE INDEX idx_loan_mandate_loan_id ON loan_mandate (loan_id);
