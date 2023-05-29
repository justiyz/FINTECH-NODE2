ALTER TABLE clusters DROP COLUMN IF EXISTS created_by; 
ALTER TABLE clusters DROP COLUMN IF EXISTS admin;

ALTER TABLE clusters ADD COLUMN IF NOT EXISTS created_by VARCHAR REFERENCES users(user_id); 
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS admin VARCHAR REFERENCES users(user_id);
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS loan_amount NUMERIC(19,4); 
ALTER TABLE clusters ADD COLUMN IF NOT EXISTS is_created_by_admin BOOLEAN DEFAULT false; 

ALTER TABLE admin_activity_logs ADD COLUMN IF NOT EXISTS description TEXT;

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('ANVWAS', 'admin view analysis', 'admin view analysis'),
    ('IEDTET', 'initiate document export', 'initiate document export');





