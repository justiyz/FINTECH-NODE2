ALTER TABLE pre_disbursement_loan_payment_schedules ADD COLUMN IF NOT EXISTS pre_reschedule_proposed_payment_date TIMESTAMPTZ;
ALTER TABLE pre_disbursement_loan_payment_schedules ADD COLUMN amount_paid NUMERIC(19,4) NULL DEFAULT 0;
