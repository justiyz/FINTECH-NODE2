DROP TYPE IF EXISTS user_loan_status CASCADE;

ALTER TABLE users RENAME COLUMN address To home_address;

ALTER TABLE users DROP COLUMN IF EXISTS income_range;
ALTER TABLE users DROP COLUMN IF EXISTS number_of_dependants;
ALTER TABLE users DROP COLUMN IF EXISTS marital_status;
ALTER TABLE users DROP COLUMN IF EXISTS loan_status;

ALTER TABLE tiers ADD COLUMN IF NOT EXISTS max_loan_amount  NUMERIC(19,4);
ALTER TABLE tiers ADD COLUMN IF NOT EXISTS max_loan_tenor_in_months INT;

DROP INDEX IF EXISTS user_bank_accounts_user_id_index;
DROP INDEX IF EXISTS user_bank_accounts_is_default_index;
DROP INDEX IF EXISTS user_debit_cards_user_id_index;
DROP INDEX IF EXISTS user_debit_cards_is_default_index;
DROP INDEX IF EXISTS card_payment_histories_user_id_index;
DROP INDEX IF EXISTS card_payment_histories_is_refunded_index;
DROP INDEX IF EXISTS card_payment_histories_status_index;
DROP INDEX IF EXISTS card_payment_histories_transaction_id_index;
DROP INDEX IF EXISTS card_payment_histories_transaction_reference_index;

DROP TYPE IF EXISTS user_loan_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;

DROP TABLE IF EXISTS user_bank_accounts CASCADE;
DROP TABLE IF EXISTS user_debit_cards CASCADE;
DROP TABLE IF EXISTS card_payment_histories CASCADE;
