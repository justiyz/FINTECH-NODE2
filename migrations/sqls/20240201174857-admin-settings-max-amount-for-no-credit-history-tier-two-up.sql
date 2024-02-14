INSERT INTO admin_env_values_settings
    (name, value, description)
VALUES
    ('tier_two_max_amount_for_no_credit_history', '0', 'the maximum amount allowable when tier two user has no credit history');

DELETE FROM admin_env_values_settings WHERE name = 'tier_zero_max_amount_for_no_credit_history';

