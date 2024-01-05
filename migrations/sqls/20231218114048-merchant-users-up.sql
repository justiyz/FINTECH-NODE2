CREATE TYPE merchant_user_status AS ENUM('pending', 'active', 'deactivated');

CREATE TABLE IF NOT EXISTS merchant_users (
    id SERIAL,
    merchant_id VARCHAR(255) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    CONSTRAINT merchant_id FOREIGN KEY (merchant_id) REFERENCES merchants(merchant_id),
    CONSTRAINT user_id FOREIGN KEY (user_id) REFERENCES users(user_id),
    status merchant_user_status DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);