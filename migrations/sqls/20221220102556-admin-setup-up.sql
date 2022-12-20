CREATE TYPE admin_role_status AS ENUM('active', 'deactivated');

CREATE TABLE IF NOT EXISTS admin_roles(
    id SERIAL,
    code VARCHAR(10) PRIMARY KEY NOT NULL,
    name VARCHAR NOT NULL,
    status admin_role_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION admins_roles_make_lower_trim() RETURNS TRIGGER AS '
    BEGIN
        new.name := LOWER(TRIM(new.name));
        new.code := UPPER(TRIM(new.code));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER admins_roles_make_lower_trim BEFORE INSERT OR UPDATE ON admin_roles FOR
EACH ROW EXECUTE PROCEDURE admins_roles_make_lower_trim();

CREATE INDEX admin_roles_code_index ON admin_roles(code);
CREATE INDEX admin_roles_status_index ON admin_roles(status);

CREATE TABLE IF NOT EXISTS admins(
    id SERIAL,
    admin_id VARCHAR PRIMARY KEY DEFAULT 'admin-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    role_type VARCHAR NOT NULL,
    first_name VARCHAR,
    middle_name VARCHAR,
    last_name VARCHAR,
    phone_number VARCHAR UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    gender VARCHAR,
    date_of_birth VARCHAR,
    image_url TEXT,
    verification_token TEXT,
    verification_token_expires TIMESTAMPTZ,
    password TEXT,
    is_verified_email BOOLEAN DEFAULT false,
    is_created_password BOOLEAN DEFAULT false,
    is_completed_profile BOOLEAN DEFAULT false,
    status account_status DEFAULT 'inactive',
    refresh_token TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION admins_make_lower_trim() RETURNS TRIGGER AS '
    BEGIN
        new.first_name := LOWER(TRIM(new.first_name));
        new.middle_name := LOWER(TRIM(new.middle_name));
        new.last_name := LOWER(TRIM(new.last_name));
        new.email := LOWER(TRIM(new.email));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER admins_make_lower_trim BEFORE INSERT OR UPDATE ON admins FOR
EACH ROW EXECUTE PROCEDURE admins_make_lower_trim();

ALTER TABLE admins
ADD CONSTRAINT admins_role_fkey
    FOREIGN KEY (role_type)
    REFERENCES admin_roles(code)
    ON UPDATE CASCADE;

CREATE INDEX admins_admin_id_index ON admins(admin_id);
CREATE INDEX admins_email_index ON admins(email);
CREATE INDEX admins_verification_token_index ON admins(verification_token);
CREATE INDEX admins_status_index ON admins(status);
CREATE INDEX admins_refresh_token_index ON admins(refresh_token);
CREATE INDEX admins_role_type_index ON admins(role_type);

CREATE TABLE IF NOT EXISTS admin_activity_logs(
    id SERIAL PRIMARY KEY,
    admin_id VARCHAR NOT NULL,
    activity_type VARCHAR NOT NULL,
    activity_status activity_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX admin_activity_logs_admin_id_index ON admin_activity_logs(admin_id);
CREATE INDEX admin_activity_logs_activity_type_index ON admin_activity_logs(activity_type);

ALTER TABLE admin_activity_logs
ADD CONSTRAINT admin_activity_logs_admin_id_fkey
    FOREIGN KEY (admin_id)
    REFERENCES admins(admin_id)
    ON UPDATE CASCADE;

ALTER TABLE admin_activity_logs
ADD CONSTRAINT admin_activity_logs_activity_type_fkey
    FOREIGN KEY (activity_type)
    REFERENCES activity_types(code)
    ON UPDATE CASCADE;

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('VRYRPDOP', 'verify reset password otp', 'user verify reset password otp'),
    ('CRTARLE', 'create admin role type', 'admin creates admin role type'),
    ('EDTARLE', 'edit admin role type', 'admin edits admin role type'),
    ('IVTADM', 'invite admin', 'admin invites another admin'),
    ('ADMCPPR', 'admin completes profile', 'admin completes profile');
