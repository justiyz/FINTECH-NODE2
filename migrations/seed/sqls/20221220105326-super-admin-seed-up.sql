INSERT INTO admin_roles(
    code,
    name
) VALUES (
    'SADM', 
    'super admin'
) ON CONFLICT (code)
DO
UPDATE
SET
code = EXCLUDED.code,
name = EXCLUDED.name;

INSERT INTO admins (
    role_type,
    email,
    password,
    is_created_password,
    is_verified_email,
    status
) VALUES (
    'SADM',
    'dayor@enyata.com',
    '$2b$10$QFJnosYyoCGiLM43T1OK.uq81faIHle/4AJfr8diyRI/tik5MmrCC',
    false,
    true,
    'active'
)
ON CONFLICT (email)
DO
UPDATE
SET
role_type = EXCLUDED.role_type,
is_created_password = EXCLUDED.is_created_password,
is_verified_email = EXCLUDED.is_verified_email,
status = EXCLUDED.status;
