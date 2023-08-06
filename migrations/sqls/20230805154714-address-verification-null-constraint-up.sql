ALTER TABLE address_verification ALTER COLUMN street DROP NOT NULL;
ALTER TABLE address_verification ALTER COLUMN city DROP NOT NULL;
ALTER TABLE address_verification ALTER COLUMN house_number DROP NOT NULL;
ALTER TABLE address_verification ALTER COLUMN lga DROP NOT NULL;
ALTER TABLE address_verification ALTER COLUMN country DROP NOT NULL;
ALTER TABLE address_verification ALTER COLUMN type_of_residence DROP NOT NULL;

ALTER TABLE address_verification ADD CONSTRAINT address_verification_user_id_key UNIQUE (user_id);
