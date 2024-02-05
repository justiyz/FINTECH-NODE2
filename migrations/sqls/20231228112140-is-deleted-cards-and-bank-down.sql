ALTER TABLE user_debit_cards
DROP COLUMN IF EXISTS is_deleted;

ALTER TABLE user_bank_accounts
DROP COLUMN IF EXISTS is_deleted;

