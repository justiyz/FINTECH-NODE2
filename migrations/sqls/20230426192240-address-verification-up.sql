ALTER TABLE user_admin_uploaded_documents DROP COLUMN IF EXISTS uploaded_by; 
ALTER TABLE user_admin_uploaded_documents ADD COLUMN IF NOT EXISTS uploaded_by VARCHAR REFERENCES admins(admin_id);  

UPDATE admin_env_values_settings SET value = '100' WHERE name = 'card_tokenization_charge';
DELETE FROM admin_env_values_settings WHERE name = 'maximum_loan_amount';

INSERT INTO admin_env_values_settings
    (name, value, description)
VALUES
    ('tier_one_minimum_loan_amount', '50000', 'minimum allowable loan amount for tier one user' ),
    ('tier_one_maximum_loan_amount', '1000000', 'maximum allowable loan amount for tier one user' ),
    ('tier_two_minimum_loan_amount', '50000', 'minimum allowable loan amount for tier two user' ),
    ('tier_two_maximum_loan_amount', '2000000', 'maximum allowable loan amount for tier two user' ),
    ('cluster_minimum_loan_amount', '50000', 'minimum allowable loan amount for a cluster' ),
    ('cluster_maximum_loan_amount', '1000000', 'maximum allowable loan amount for a cluster' ),
    ('employed_loan_amount_percentage_limit', '80', 'percentage maximum allowable loan amount for an employed user on first 2 loans based on tiers' ),
    ('self_employed_loan_amount_percentage_limit', '60', 'percentage maximum allowable loan amount for an employed user on first 2 loans based on tiers' ),
    ('unemployed_loan_amount_percentage_limit', '20', 'percentage maximum allowable loan amount for an employed user on first 2 loans based on tiers' ),
    ('retired_loan_amount_percentage_limit', '20', 'percentage maximum allowable loan amount for an employed user on first 2 loans based on tiers' ),
    ('student_loan_amount_percentage_limit', '20', 'percentage maximum allowable loan amount for an employed user on first 2 loans based on tiers' );

ALTER TABLE address_verification ADD COLUMN IF NOT EXISTS state VARCHAR;  
ALTER TABLE address_verification ADD COLUMN IF NOT EXISTS landmark VARCHAR;
ALTER TABLE address_verification ADD COLUMN IF NOT EXISTS house_number VARCHAR;
ALTER TABLE address_verification ADD COLUMN IF NOT EXISTS you_verify_candidate_id VARCHAR;
ALTER TABLE address_verification ADD COLUMN IF NOT EXISTS you_verify_request_id VARCHAR;
ALTER TABLE address_verification ADD COLUMN IF NOT EXISTS you_verify_address_id VARCHAR;
ALTER TABLE address_verification ADD COLUMN IF NOT EXISTS you_verify_address_verification_status VARCHAR;
ALTER TABLE address_verification ADD COLUMN IF NOT EXISTS is_verified_utility_bill BOOLEAN DEFAULT false;

ALTER TABLE users RENAME COLUMN is_uploaded_utility_bill TO is_verified_utility_bill;