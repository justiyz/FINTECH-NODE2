/* Replace with your SQL commands */
CREATE TABLE IF NOT EXISTS merchant_admin_activity_logs(
    id SERIAL PRIMARY KEY,
    merchant_admin_id VARCHAR NOT NULL,
    activity_type VARCHAR NOT NULL,
    activity_status activity_status NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX merchant_admin_activity_logs_merchant_admin_id_index ON merchant_admin_activity_logs(merchant_admin_id);
CREATE INDEX merchant_admin_activity_logs_activity_type_index ON merchant_admin_activity_logs(activity_type);

ALTER TABLE merchant_admin_activity_logs
ADD CONSTRAINT merchant_admin_activity_logs_merchant_admin_id_fkey
    FOREIGN KEY (merchant_admin_id)
    REFERENCES merchant_admins(merchant_admin_id)
    ON UPDATE CASCADE;

ALTER TABLE merchant_admin_activity_logs
ADD CONSTRAINT merchant_admin_activity_logs_activity_type_fkey
    FOREIGN KEY (activity_type)
    REFERENCES activity_types(code)
    ON UPDATE CASCADE;

INSERT INTO activity_types
    (code, name, description) 
VALUES
    ('MERINVADM', 'merchant invite admin', 'merchant invites admin');

    CREATE TABLE IF NOT EXISTS merchant_admin_resources(
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

CREATE OR REPLACE FUNCTION merchant_admin_resources_make_lower() RETURNS TRIGGER AS '
    BEGIN
        new.name := LOWER(TRIM(new.name));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER merchant_admin_resources_make_lower BEFORE INSERT OR UPDATE ON merchant_admin_resources FOR
EACH ROW EXECUTE PROCEDURE merchant_admin_resources_make_lower();

INSERT INTO merchant_admin_resources
    (name) 
VALUES
    ('dashboard'),
    ('customers'),
    ('administrators'),
    ('loan management'),
    ('activity logs'),
    ('settings');

CREATE TABLE IF NOT EXISTS merchant_admin_permissions(
    id SERIAL PRIMARY KEY,
    merchant_admin_id VARCHAR NOT NULL,
    resource_id VARCHAR NOT NULL,
    permissions TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION merchant_admin_permissions_make_lower() RETURNS TRIGGER AS '
    BEGIN
        new.permissions := LOWER(TRIM(new.permissions));
        RETURN NEW;
    END;
    ' LANGUAGE plpgsql;

CREATE TRIGGER merchant_admin_permissions_make_lower BEFORE INSERT OR UPDATE ON merchant_admin_permissions FOR
EACH ROW EXECUTE PROCEDURE merchant_admin_permissions_make_lower();

ALTER TABLE merchant_admin_permissions
ADD CONSTRAINT merchant_admin_permissions_merchant_admin_id_fkey
    FOREIGN KEY (merchant_admin_id)
    REFERENCES merchant_admins(merchant_admin_id)
    ON UPDATE CASCADE;

ALTER TABLE merchant_admin_permissions
ADD CONSTRAINT merchant_admin_permissions_resource_id_fkey
    FOREIGN KEY (resource_id)
    REFERENCES merchant_admin_resources(resource_id)
    ON UPDATE CASCADE;

CREATE INDEX merchant_admin_resources_resource_id_index ON merchant_admin_resources(resource_id);
CREATE INDEX merchant_admin_permissions_merchant_admin_id_index ON merchant_admin_permissions(merchant_admin_id);
CREATE INDEX merchant_admin_permissions_resource_id_index ON merchant_admin_permissions(resource_id);

ALTER TABLE merchant_admins ADD COLUMN IF NOT EXISTS role_name TEXT;
ALTER TABLE merchant_admins ADD COLUMN IF NOT EXISTS is_created_by_seedfi BOOLEAN DEFAULT true;
