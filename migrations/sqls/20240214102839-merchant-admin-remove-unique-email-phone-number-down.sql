ALTER TABLE merchant_admins ADD CONSTRAINT merchant_admins_email_key UNIQUE (email);
ALTER TABLE merchant_admins ADD CONSTRAINT merchant_admins_phone_number_key UNIQUE (phone_number);
