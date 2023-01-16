/* Replace with your SQL commands */

ALTER TABLE user_national_id_details DROP COLUMN IF EXISTS id_type;
DROP TABLE IF EXISTS national_id_types CASCADE;

ALTER TABLE user_national_id_details ADD COLUMN IF NOT EXISTS id_type VARCHAR NOT NULL;
ALTER TABLE user_national_id_details ADD COLUMN IF NOT EXISTS image_url VARCHAR;
ALTER TABLE user_national_id_details ADD COLUMN IF NOT EXISTS verification_url VARCHAR;