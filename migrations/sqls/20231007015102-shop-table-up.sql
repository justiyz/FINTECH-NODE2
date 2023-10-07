CREATE TABLE IF NOT EXISTS shop_categories(
    id SERIAL,
    env_id VARCHAR PRIMARY KEY DEFAULT 'shop-category-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(20))
            , '-',''
        )
    ),
    category_name VARCHAR UNIQUE NOT NULL,
    category_description VARCHAR NOT NULL,
    status BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
