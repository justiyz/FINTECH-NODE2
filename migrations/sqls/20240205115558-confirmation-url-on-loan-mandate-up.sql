ALTER TABLE loan_mandate
ADD COLUMN consent_confirmation_url TEXT,
DROP COLUMN consent_approval_url;
