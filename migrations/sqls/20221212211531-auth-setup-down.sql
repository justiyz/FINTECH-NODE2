DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

DROP INDEX IF EXISTS users_user_id_index;
DROP INDEX IF EXISTS users_phone_number_index;
DROP INDEX IF EXISTS users_email_index;
DROP INDEX IF EXISTS users_verification_token_index;
DROP INDEX IF EXISTS users_status_index;
DROP INDEX IF EXISTS users_refresh_token_index;

DROP TYPE IF EXISTS account_status CASCADE;
DROP TYPE IF EXISTS activity_status CASCADE;

DROP TABLE IF EXISTS activity_types CASCADE;
DROP TABLE IF EXISTS national_id_types CASCADE;
DROP TABLE IF EXISTS tiers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_activity_logs CASCADE;
DROP TABLE IF EXISTS user_national_id_details CASCADE;
DROP TABLE IF EXISTS referral_trail CASCADE;
