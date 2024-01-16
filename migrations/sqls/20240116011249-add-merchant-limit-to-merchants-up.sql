ALTER TABLE merchants ADD COLUMN merchant_loan_limit NUMERIC(19,4);
ALTER TABLE merchants ALTER COLUMN customer_loan_max_amount TYPE NUMERIC(19,4);
ALTER TABLE merchants ALTER COLUMN processing_fee TYPE NUMERIC(19,4);
ALTER TABLE merchants ALTER COLUMN insurance_fee TYPE NUMERIC(19,4);
ALTER TABLE merchants ALTER COLUMN advisory_fee TYPE NUMERIC(19,4);