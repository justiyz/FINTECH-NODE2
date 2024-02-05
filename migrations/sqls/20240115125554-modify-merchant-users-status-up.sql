ALTER TABLE merchant_users ALTER COLUMN status DROP DEFAULT;
ALTER TABLE merchant_users ALTER COLUMN status TYPE account_status USING status::text::account_status;