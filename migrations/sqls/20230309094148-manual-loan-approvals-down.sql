DROP TYPE IF EXISTS admin_manual_decision CASCADE;

DROP INDEX IF EXISTS manual_personal_loan_approval_trail_id_index;
DROP INDEX IF EXISTS manual_personal_loan_approval_trail_loan_id_index;
DROP INDEX IF EXISTS manual_personal_loan_approval_trail_decided_by_index;

DROP TABLE IF EXISTS manual_personal_loan_approval_trail CASCADE;
