DROP INDEX idx_merchant_admins_merchants;

DROP TABLE merchant_admins_merchants;

ALTER TABLE merchant_admins DROP CONSTRAINT merchant_admins_email_key;

ALTER TABLE merchants ADD COLUMN merchant_code TEXT;
