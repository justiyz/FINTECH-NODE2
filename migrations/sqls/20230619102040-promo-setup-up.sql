/* Replace with your SQL commands */
CREATE TYPE promo_status AS ENUM('inactive', 'active', 'cancelled', 'ended');

CREATE TABLE IF NOT EXISTS system_promos (
    id SERIAL,
    promo_id VARCHAR PRIMARY KEY DEFAULT 'promo-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    name VARCHAR NOT NULL,
    description TEXT NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status promo_status NOT NULL,
    image_url TEXT,
    percentage_discount NUMERIC(19,4),
    customer_segment TEXT,
    tier_category VARCHAR,
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    actual_end_date TIMESTAMPTZ,
    created_by VARCHAR NOT NULL REFERENCES admins(admin_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX system_promos_promo_id_index ON system_promos(promo_id);
CREATE INDEX system_promos_status_index ON system_promos(status);
CREATE INDEX system_promos_name_index ON system_promos(name);