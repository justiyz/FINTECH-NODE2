
CREATE TABLE IF NOT EXISTS loan_mandate (
  id SERIAL,
  loan_id VARCHAR NOT NULL REFERENCES personal_loans(loan_id),
  institution_code NOT NULL VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_loan_mandate_loan_id ON loan_mandate (loan_id);
