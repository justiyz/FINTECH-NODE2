DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS loan_disbursement_payment_type CASCADE;
DROP TYPE IF EXISTS loan_application_status CASCADE;

DROP INDEX IF EXISTS personal_loans_status_index;

ALTER TABLE personal_loans DROP COLUMN IF EXISTS offer_letter_url;

ALTER TABLE paystack_payment_histories DROP COLUMN IF EXISTS transaction_type;
ALTER TABLE paystack_payment_histories DROP COLUMN IF EXISTS payment_reason;
ALTER TABLE paystack_payment_histories DROP COLUMN IF EXISTS loan_id;

DROP INDEX IF EXISTS personal_loan_disbursements_disbursement_id_index;
DROP INDEX IF EXISTS personal_loan_disbursements_user_id_index;
DROP INDEX IF EXISTS personal_loan_disbursements_loan_id_index;
DROP INDEX IF EXISTS personal_loan_disbursements_status_index;

DROP TABLE IF EXISTS personal_loan_disbursements CASCADE;

ALTER INDEX IF EXISTS paystack_payment_histories_user_id_index RENAME TO card_payment_histories_user_id_index;
ALTER INDEX IF EXISTS paystack_payment_histories_is_refunded_index RENAME TO card_payment_histories_is_refunded_index;
ALTER INDEX IF EXISTS paystack_payment_histories_payment_status_index RENAME TO card_payment_histories_payment_status_index;
ALTER INDEX IF EXISTS paystack_payment_histories_transaction_id_index RENAME TO card_payment_histories_transaction_id_index;
ALTER INDEX IF EXISTS paystack_payment_histories_transaction_reference_index RENAME TO card_payment_histories_transaction_reference_index;

ALTER TABLE IF EXISTS paystack_payment_histories RENAME TO card_payment_histories;

DROP INDEX IF EXISTS personal_loan_payments_payment_id_index;
DROP INDEX IF EXISTS personal_loan_payments_user_id_index;
DROP INDEX IF EXISTS personal_loan_payments_loan_id_index;

DROP TABLE IF EXISTS personal_loan_payments CASCADE;
