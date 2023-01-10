CREATE TABLE IF NOT EXISTS admin_resources(
    id SERIAL,
    resource_id VARCHAR PRIMARY KEY DEFAULT 'resource-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    name VARCHAR UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION admins_resources_make_lower() RETURNS TRIGGER AS '
    BEGIN
        new.name := LOWER(TRIM(new.name));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER admins_resources_make_lower BEFORE INSERT OR UPDATE ON admin_resources FOR
EACH ROW EXECUTE PROCEDURE admins_resources_make_lower();

INSERT INTO admin_resources
    (name) 
VALUES
    ('users'),
    ('loan application'),
    ('administrators'),
    ('role management');

CREATE TABLE IF NOT EXISTS admin_role_permissions(
    id SERIAL PRIMARY KEY,
    role_type VARCHAR NOT NULL,
    resource_id VARCHAR NOT NULL,
    permissions TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION admin_role_permissions_make_lower() RETURNS TRIGGER AS '
    BEGIN
        new.permissions := LOWER(TRIM(new.permissions));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER admin_role_permissions_make_lower BEFORE INSERT OR UPDATE ON admin_role_permissions FOR
EACH ROW EXECUTE PROCEDURE admin_role_permissions_make_lower();

ALTER TABLE admin_role_permissions
ADD CONSTRAINT admin_role_permissions_role_fkey
    FOREIGN KEY (role_type)
    REFERENCES admin_roles(code)
    ON UPDATE CASCADE;

ALTER TABLE admin_role_permissions
ADD CONSTRAINT admin_role_permissions_resource_id_fkey
    FOREIGN KEY (resource_id)
    REFERENCES admin_resources(resource_id)
    ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS admin_user_permissions(
    id SERIAL PRIMARY KEY,
    admin_id VARCHAR NOT NULL,
    resource_id VARCHAR NOT NULL,
    permissions TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION admin_user_permissions_make_lower() RETURNS TRIGGER AS '
    BEGIN
        new.permissions := LOWER(TRIM(new.permissions));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER admin_user_permissions_make_lower BEFORE INSERT OR UPDATE ON admin_user_permissions FOR
EACH ROW EXECUTE PROCEDURE admin_user_permissions_make_lower();

ALTER TABLE admin_user_permissions
ADD CONSTRAINT admin_user_permissions_admin_id_fkey
    FOREIGN KEY (admin_id)
    REFERENCES admins(admin_id)
    ON UPDATE CASCADE;

ALTER TABLE admin_user_permissions
ADD CONSTRAINT admin_user_permissions_resource_id_fkey
    FOREIGN KEY (resource_id)
    REFERENCES admin_resources(resource_id)
    ON UPDATE CASCADE;


CREATE INDEX admin_resources_resource_id_index ON admin_resources(resource_id);

CREATE INDEX admin_role_permissions_role_type_index ON admin_role_permissions(role_type);
CREATE INDEX admin_role_permissions_resource_id_index ON admin_role_permissions(resource_id);

CREATE INDEX admin_user_permissions_admin_id_index ON admin_user_permissions(admin_id);
CREATE INDEX admin_user_permissions_resource_id_index ON admin_user_permissions(resource_id);

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('ADMLGR', 'admin login request', 'admin requests to login'),
    ('ADMLGA', 'admin login approved', 'admin login request allowed using verified otp'),
    ('ADMCRPD', 'admin creates new password', 'admin creates new password different from default password'),
    ('ACTRLE', 'activate role', 'admin role gets activated by admin with access'),
    ('DCTRLE', 'deactivate role', 'admin role gets deactivated by admin with access'),
    ('DELRLE', 'delete role', 'admin role gets deleted by admin with access'),
    ('EDTRLE', 'edit role', 'admin role is edited by admin with access'),
    ('ACTADM', 'activate admin', 'admin user gets activated by admin with access'),
    ('DACTADM', 'deactivate admin', 'admin user gets deactivated by admin with access'),
    ('EDTADMPM', 'edit admin permissions', 'admin user permissions is edited by admin with access');
