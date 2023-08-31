ALTER TABLE users DROP COLUMN IF EXISTS verification_token_request_count;
ALTER TABLE admins DROP COLUMN IF EXISTS verification_token_request_count;
