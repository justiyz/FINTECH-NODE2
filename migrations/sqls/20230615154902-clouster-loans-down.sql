DROP INDEX IF EXISTS cluster_loans_loan_id_index;
DROP INDEX IF EXISTS cluster_loans_status_index;
DROP INDEX IF EXISTS cluster_loans_cluster_id_index;
DROP INDEX IF EXISTS cluster_member_loans_loan_id_index;
DROP INDEX IF EXISTS cluster_member_loans_status_index;
DROP INDEX IF EXISTS cluster_member_loans_cluster_id_index;
DROP INDEX IF EXISTS cluster_member_loans_member_loan_id_index;
DROP INDEX IF EXISTS cluster_member_loans_user_id_index;
DROP INDEX IF EXISTS cluster_member_loan_disbursements_loan_id_index;
DROP INDEX IF EXISTS cluster_member_loan_disbursements_user_id_index;
DROP INDEX IF EXISTS cluster_member_loan_disbursements_member_loan_id_index;
DROP INDEX IF EXISTS cluster_member_loan_disbursements_cluster_id_index;
DROP INDEX IF EXISTS cluster_member_loan_payment_schedules_loan_id_index;
DROP INDEX IF EXISTS cluster_member_loan_payment_schedules_user_id_index;
DROP INDEX IF EXISTS cluster_member_loan_payment_schedules_member_loan_id_index;
DROP INDEX IF EXISTS cluster_member_loan_payment_schedules_cluster_id_index;
DROP INDEX IF EXISTS cluster_member_loan_payment_schedules_status_index;
DROP INDEX IF EXISTS cluster_member_loan_payments_loan_id_index;
DROP INDEX IF EXISTS cluster_member_loan_payments_user_id_index;
DROP INDEX IF EXISTS cluster_member_loan_payments_member_loan_id_index;
DROP INDEX IF EXISTS cluster_member_loan_payments_cluster_id_index;
DROP INDEX IF EXISTS cluster_member_loan_payments_transaction_type_index;
DROP INDEX IF EXISTS cluster_member_renegotiated_loan_loan_id_index;
DROP INDEX IF EXISTS cluster_member_renegotiated_loan_user_id_index;
DROP INDEX IF EXISTS cluster_member_renegotiated_loan_member_loan_id_index;
DROP INDEX IF EXISTS cluster_member_renegotiated_loan_cluster_id_index;
DROP INDEX IF EXISTS cluster_member_rescheduled_loan_loan_id_index;
DROP INDEX IF EXISTS cluster_member_rescheduled_loan_user_id_index;
DROP INDEX IF EXISTS cluster_member_rescheduled_loan_member_loan_id_index;
DROP INDEX IF EXISTS cluster_member_rescheduled_loan_cluster_id_index;

DROP TYPE IF EXISTS promo_status CASCADE;
DROP TYPE IF EXISTS cluster_loan_sharing_type CASCADE;

ALTER TABLE personal_loans RENAME COLUMN is_renegotiated TO is_renegotatied;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS completed_at;
ALTER TABLE personal_loans DROP COLUMN IF EXISTS used_previous_eligibility_details;

DROP TABLE IF EXISTS cluster_loans CASCADE;
DROP TABLE IF EXISTS cluster_member_loans CASCADE;
DROP TABLE IF EXISTS cluster_member_loan_disbursements CASCADE;
DROP TABLE IF EXISTS cluster_member_loan_payment_schedules CASCADE;
DROP TABLE IF EXISTS cluster_member_loan_payments CASCADE;
DROP TABLE IF EXISTS cluster_member_renegotiated_loan CASCADE;
DROP TABLE IF EXISTS cluster_member_rescheduled_loan CASCADE;

DELETE FROM admin_resources WHERE name = 'notifications';
DELETE FROM admin_env_values_settings WHERE name = 'private_cluster_fixed_interest_rate';
