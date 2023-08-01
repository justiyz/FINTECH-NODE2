ALTER TABLE user_admin_uploaded_documents DROP COLUMN IF EXISTS uploaded_by; 

ALTER TABLE address_verification DROP COLUMN IF EXISTS state; 
ALTER TABLE address_verification DROP COLUMN IF EXISTS landmark;
ALTER TABLE address_verification DROP COLUMN IF EXISTS house_number;
ALTER TABLE address_verification DROP COLUMN IF EXISTS you_verify_candidate_id;
ALTER TABLE address_verification DROP COLUMN IF EXISTS you_verify_request_id;
ALTER TABLE address_verification DROP COLUMN IF EXISTS you_verify_address_id;
ALTER TABLE address_verification DROP COLUMN IF EXISTS you_verify_address_verification_status;
ALTER TABLE address_verification DROP COLUMN IF EXISTS is_editable;
ALTER TABLE address_verification DROP COLUMN IF EXISTS is_verified_utility_bill;

ALTER TABLE users RENAME COLUMN is_verified_utility_bill TO is_uploaded_utility_bill;


ALTER TABLE user_bank_accounts DROP COLUMN IF EXISTS mono_account_id;

ALTER TABLE users ADD COLUMN IF NOT EXISTS employment_type VARCHAR;
ALTER TABLE users ADD COLUMN IF NOT EXISTS income_range VARCHAR;

ALTER TABLE employment_type RENAME COLUMN monthly_income TO income_range;

DROP INDEX IF EXISTS blacklisted_bvns_id_index;
DROP INDEX IF EXISTS nunblacklisted_bvns_id_index;

DROP TABLE IF EXISTS blacklisted_bvns CASCADE;
DROP TABLE IF EXISTS unblacklisted_bvns CASCADE;
