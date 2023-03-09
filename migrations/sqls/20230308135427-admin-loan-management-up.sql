DROP TRIGGER IF EXISTS make_cluster_name_lower_trim ON clusters;

CREATE OR REPLACE FUNCTION make_cluster_name_lower_trim() RETURNS TRIGGER AS '
    BEGIN
        new.name := LOWER(TRIM(new.name));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER make_cluster_name_lower_trim BEFORE INSERT OR UPDATE ON clusters FOR
EACH ROW EXECUTE PROCEDURE make_cluster_name_lower_trim();

CREATE TYPE user_account_status AS ENUM('inactive', 'active', 'suspended', 'deactivated', 'watchlisted', 'blacklisted');

ALTER TABLE users DROP COLUMN IF EXISTS status;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status user_account_status DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS address_image_url TEXT;

ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS user_tier INT REFERENCES tiers(tier);
ALTER TABLE personal_loans ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

ALTER TABLE cluster_decision_tickets ADD COLUMN IF NOT EXISTS suggested_cluster_admin VARCHAR REFERENCES users(user_id);

CREATE TABLE IF NOT EXISTS user_admin_uploaded_documents(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR NOT NULL REFERENCES users(user_id),
    uploaded_by VARCHAR NOT NULL REFERENCES admins(admin_id),
    document_title VARCHAR NOT NULL,
    image_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX user_admin_uploaded_documents_id_index ON user_admin_uploaded_documents(id);
CREATE INDEX user_admin_uploaded_documents_user_id_index ON user_admin_uploaded_documents(user_id);

CREATE TABLE IF NOT EXISTS cron_job_trail(
    id SERIAL PRIMARY KEY,
    user_id VARCHAR REFERENCES users(user_id),
    activity_type VARCHAR NOT NULL REFERENCES activity_types(code),
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX cron_job_trail_id_index ON cron_job_trail(id);
CREATE INDEX cron_job_trail_user_id_index ON cron_job_trail(user_id);

UPDATE activity_types SET code = 'LNOBGPTPPD', name = 'loan obligation part payment paid', description = 'users loan obligation part payment is paid' WHERE code = 'AUTPLONRP';
UPDATE activity_types SET code = 'LNOBGFLPPD', name = 'loan obligation full payment paid', description = 'users loan obligation full payment is paid' WHERE code = 'MANFLONRP';

DELETE FROM activity_types WHERE code = 'MANPLONRP';
DELETE FROM activity_types WHERE code = 'MANFLONRP';

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('IMNLNRPVCD', 'initiate manual loan repayment via card', 'user initiates manual loan repayment via card'),
    ('IMNLNRPVBA', 'initiate manual loan repayment via bank account', 'user initiates manual loan repayment via bank account'),
    ('SUMOTPVRTR', 'submit otp to verify initiated transaction', 'user submits submit otp to verify initiated transaction'),
    ('ODLNSETOD', 'over due loans set to over due owing to overdue repayment', 'system sets over due loans set to over due owing to overdue repayment'),
    ('LNRPTCDIN', 'loan repayment via tokenised card initiated', 'system invokes loan repayment via tokenised card initiated'),
    ('STCLIVNVPN', 'set new user cluster invite notification via phone number', 'set new user cluster invite notification via phone number'),
    ('STCLIVNVEM', 'set new user cluster invite notification via email', 'set new user cluster invite notification via email'),
    ('APLNAPMN', 'approve loan application manually', 'admin approves loan application manually'),
    ('DCLNAPMN', 'decline loan application manually', 'admin declines loan application manually'),
    ('UPDOCFUSR', 'upload document for user', 'admin uploads document for usery');
