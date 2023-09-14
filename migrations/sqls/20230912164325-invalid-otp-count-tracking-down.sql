ALTER TABLE users DROP COLUMN IF EXISTS invalid_verification_token_count;
ALTER TABLE admins DROP COLUMN IF EXISTS invalid_verification_token_count;
