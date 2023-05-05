ALTER TABLE blacklisted_bvns DROP COLUMN IF EXISTS date_of_birth; 
ALTER TABLE unblacklisted_bvns DROP COLUMN IF EXISTS date_of_birth; 

ALTER TABLE blacklisted_bvns DROP COLUMN IF EXISTS description; 
ALTER TABLE unblacklisted_bvns DROP COLUMN IF EXISTS description; 

ALTER TABLE blacklisted_bvns ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR;
ALTER TABLE unblacklisted_bvns ADD COLUMN IF NOT EXISTS date_of_birth VARCHAR;

ALTER TABLE users DROP COLUMN IF EXISTS is_verified_address; 
ALTER TABLE users DROP COLUMN IF EXISTS is_verified_utility_bill;

ALTER TABLE user_bank_accounts ADD COLUMN IF NOT EXISTS okra_account_id VARCHAR;

ALTER TABLE address_verification ADD COLUMN IF NOT EXISTS can_upload_utility_bill BOOLEAN DEFAULT TRUE;

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('UPTADDTLS', 'update address details', 'user update address details'),
    ('ADDTLSVRFL', 'address details verification failed', 'user"s address details verification failed'),
    ('ADDTLSVRSC', 'address details verification successful', 'user"s address details verification successful'),
    ('UPLUTBILL', 'upload utility bill', 'user uploads utility bill'),
    ('UTBILLDCLN', 'utility bill declined', 'user uploaded utility bill decline'),
    ('UTBILLAPRD', 'utility bill approved', 'user uploaded utility bill approved'),
    ('ADAPRUTBIL', 'admin approved utility bill', 'admin approves user uploaded utility bill'),
    ('ADDCLUTBIL', 'admin declines  utility bill', 'admin declines user uploaded utility bill'),
    ('UPTNOKDTLS', 'update next of kin details', 'user updates next of kin details'),
    ('UPDTEMPDTS', 'update employment type details', 'user updates employment type details'),
    ('ACTMXALLON', 'accept maximum allowable loan amount', 'user accepts system maximum allowable loan amount'),
    ('UPTMNACTID', 'update mono account id', 'user mono account id is updated'),
    ('UPTOKACTID', 'update okra account id', 'user okra account id is updated'),
    ('UPLBKBLBVN', 'upload bulk blacklisted bvns', 'admin uploads bulk blacklisted bvns'),
    ('UPTSGBLBVN', 'update single blacklisted bvn', 'admin updates single blacklisted bvn'),
    ('ADUPTENVAL', 'admin updates environment variables values in settings', 'admin updates environment variables values in settings');
