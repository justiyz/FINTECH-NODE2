INSERT INTO admin_env_values_settings
    (name, value, description)
VALUES
    ('max_amount_for_no_credit_history', '0', 'the maximum amount allowable when the user has no credit history');

DELETE FROM admin_env_values_settings WHERE name IN('tier_zero_max_amount_for_no_credit_history', 'tier_one_max_amount_for_no_credit_history');

