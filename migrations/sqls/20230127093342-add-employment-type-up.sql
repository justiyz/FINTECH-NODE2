CREATE TYPE loan_status AS ENUM('inactive', 'active', 'over due');

ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_type VARCHAR;
ALTER TABLE users DROP COLUMN IF EXISTS loan_status;
ALTER TABLE users ADD COLUMN IF NOT EXISTS loan_status loan_status DEFAULT 'inactive';

ALTER TABLE users RENAME COLUMN number_of_dependants TO number_of_dependents;

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('ACTUSR', 'activateS user', 'admin activates user'),
    ('DCTUSR', 'deactivate user', 'admin deactivates user');
