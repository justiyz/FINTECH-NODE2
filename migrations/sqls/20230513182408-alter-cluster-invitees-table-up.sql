ALTER TABLE cluster_invitees DROP COLUMN IF EXISTS inviter_id;

ALTER TABLE cluster_invitees ADD COLUMN IF NOT EXISTS inviter_id VARCHAR;

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('ANCECR', 'admin create cluster', 'admin create cluster'),
    ('ANAECR', 'admin activate cluster', 'admin activate cluster'),
    ('ANDECR', 'admin deactivate cluster', 'admin deactivate cluster'),
    ('ANDTCR', 'admin delete cluster', 'admin delete cluster'),
    ('ANRECRNR', 'admin remove cluster member', 'admin remove cluster member'),
    ('ANCRMRIR', 'admin cluster member invite', 'admin invite cluster member '),
    ('ANUTBN', 'admin unblacklist bvn', 'admin unblacklist bvn'),
    ('ANAECRMR', 'admin activate cluster member', 'admin activate cluster member'),
    ('ANDECRMR', 'admin deactivate cluster member', 'admin deactivate cluster member');

