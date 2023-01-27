DROP TYPE IF EXISTS loan_status CASCADE;

ALTER TABLE users DROP COLUMN IF EXISTS employment_type;
ALTER TABLE users DROP COLUMN IF EXISTS loan_status;

ALTER TABLE users RENAME COLUMN number_of_dependents TO number_of_dependants;
