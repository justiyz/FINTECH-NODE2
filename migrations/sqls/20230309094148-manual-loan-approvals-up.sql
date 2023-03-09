CREATE TYPE admin_manual_decision AS ENUM('approve', 'decline');

ALTER TABLE personal_loans DROP COLUMN IF EXISTS user_tier;

CREATE TABLE IF NOT EXISTS manual_personal_loan_approval_trail(
    id SERIAL PRIMARY KEY,
    loan_id VARCHAR NOT NULL REFERENCES personal_loans(loan_id), 
    loan_applicant VARCHAR NOT NULL REFERENCES users(user_id),
    decision admin_manual_decision NOT NULL,
    decided_by VARCHAR NOT NULL REFERENCES admins(admin_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX manual_personal_loan_approval_trail_id_index ON manual_personal_loan_approval_trail(id);
CREATE INDEX manual_personal_loan_approval_trail_loan_id_index ON manual_personal_loan_approval_trail(loan_id);
CREATE INDEX manual_personal_loan_approval_trail_decided_by_index ON manual_personal_loan_approval_trail(decided_by);
