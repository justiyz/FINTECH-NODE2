DELETE FROM admin_env_values_settings WHERE name = 'join_cluster_grace_in_days';

ALTER TABLE clusters DROP COLUMN IF EXISTS join_cluster_closes_at;

ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token_request_count INTEGER DEFAULT 0;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS verification_token_request_count INTEGER DEFAULT 0;
