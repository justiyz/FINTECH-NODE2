ALTER TABLE users ADD COLUMN IF NOT EXISTS invalid_verification_token_count INTEGER DEFAULT 0;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS invalid_verification_token_count INTEGER DEFAULT 0;
