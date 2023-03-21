INSERT INTO admin_resources
    (name) 
VALUES
    ('cluster management');

INSERT INTO admin_env_values_settings
    (name, value, description)
VALUES
    ('npl_overdue_past', '7', 'the extra number of days after a repayment is past overdue for it to be tagged non performing loan' );

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('SUPUSR', 'suspend user', 'admin suspends user'),
    ('BLTUSR', 'blacklist user', 'admin blacklists user'),
    ('WLTUSR', 'watchlist user', 'admin watchlists user');
