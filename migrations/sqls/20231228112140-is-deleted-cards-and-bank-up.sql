ALTER TABLE user_debit_cards
ADD COLUMN is_deleted BOOLEAN DEFAULT false;

UPDATE user_debit_cards
SET is_deleted = false
WHERE is_deleted IS NULL;

ALTER TABLE user_bank_accounts
ADD COLUMN is_deleted BOOLEAN DEFAULT false;

UPDATE user_bank_accounts
SET is_deleted = false
WHERE is_deleted IS NULL;
