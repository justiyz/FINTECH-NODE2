ALTER TABLE loan_mandate
DROP COLUMN consent_confirmation_url,
ADD COLUMN consent_approval_url TEXT;
