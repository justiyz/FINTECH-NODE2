ALTER TABLE users ALTER COLUMN tier SET DEFAULT '1';

ALTER TABLE user_bank_accounts ADD COLUMN IF NOT EXISTS is_disbursement_account BOOLEAN DEFAULT 'false';

UPDATE tiers
SET description = 'Both BVN verification and valid Id verification has not been done'
WHERE tier = '1';

UPDATE users
SET tier = '1'
WHERE tier = '0';

DELETE FROM tiers
WHERE tier = '0';

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('STACTNMDS', 'set account number as disbursement account', 'user sets account number as disbursement accounte');
