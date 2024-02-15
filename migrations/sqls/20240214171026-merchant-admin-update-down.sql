ALTER TABLE merchant_admins ADD COLUMN merchant_id VARCHAR(255) REFERENCES merchants(merchant_id);
