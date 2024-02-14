ALTER TABLE merchant_admins ADD CONSTRAINT merchant_admins_email_key UNIQUE (email);
ALTER TABLE merchants DROP COLUMN merchant_code;

CREATE TABLE merchant_admins_merchants (
  id SERIAL,
  merchant_id TEXT REFERENCES merchants(merchant_id),
  merchant_admin_id TEXT REFERENCES merchant_admins(merchant_admin_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE merchant_admins_merchants ADD PRIMARY KEY (merchant_id, merchant_admin_id);
CREATE INDEX idx_merchant_admins_merchants ON merchant_admins_merchants (merchant_id, merchant_admin_id);

