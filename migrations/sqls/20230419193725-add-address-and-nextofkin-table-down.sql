ALTER TABLE users RENAME COLUMN number_of_children TO number_of_dependents;

DROP TABLE IF EXISTS address_verification CASCADE;
DROP TABLE IF EXISTS next_of_kin CASCADE;
DROP TABLE IF EXISTS employment_type CASCADE;

DROP INDEX IF EXISTS address_verification_user_id_index;
DROP INDEX IF EXISTS next_of_kin_user_id_index;
DROP INDEX IF EXISTS employment_type_user_id_index;
