CREATE TYPE merchant_user_loan_status AS ENUM('pending', 'declined', 'approved', 'ongoing', 'over due', 'completed');

CREATE TABLE IF NOT EXISTS merchant_user_loans (
    id SERIAL,
    merchant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    loan_id VARCHAR(255) NOT NULL,
    CONSTRAINT merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id),
    CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT loan_id FOREIGN KEY (loan_id) REFERENCES personal_loans(loan_id),
    status merchant_user_loan_status DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);