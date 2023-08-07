ALTER TABLE clusters DROP CONSTRAINT IF EXISTS clusters_name_key;

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('RSTURWDPT', 'reset specified user rewards points', 'admin resets specified user rewards points'),
    ('RSTAURWDPT', 'reset all users rewards points', 'admin resets all users rewards points'),
    ('DELOWNACT', 'delete own account', 'user deletes own account');
