ALTER TABLE blacklisted_bvns DROP COLUMN IF EXISTS date_of_birth; 
ALTER TABLE unblacklisted_bvns DROP COLUMN IF EXISTS date_of_birth; 

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_address BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified_utility_bill BOOLEAN;

ALTER TABLE user_bank_accounts DROP COLUMN IF EXISTS okra_account_id;

ALTER TABLE address_verification DROP COLUMN IF EXISTS can_upload_utility_bill;
