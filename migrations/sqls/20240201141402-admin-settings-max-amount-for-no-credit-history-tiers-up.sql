DELETE FROM admin_env_values_settings WHERE name = 'max_amount_for_no_credit_history';

INSERT INTO admin_env_values_settings
    (name, value, description)
VALUES
    ('tier_zero_max_amount_for_no_credit_history', '0', 'the maximum amount allowable when tier zero user has no credit history'),
    ('tier_one_max_amount_for_no_credit_history', '0', 'the maximum amount allowable when tier one user has no credit history');
