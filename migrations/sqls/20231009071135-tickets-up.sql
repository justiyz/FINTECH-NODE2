CREATE TYPE ticket_status AS ENUM('inactive', 'active', 'suspended', 'deactivated');
CREATE TYPE ticket_category_type as ENUM('regular', 'bronze', 'gold');
CREATE TYPE ticket_category_status AS ENUM('inactive', 'active');

CREATE TABLE IF NOT EXISTS tickets(
    id SERIAL,
    ticket_id VARCHAR PRIMARY KEY DEFAULT 'ticket-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(20))
            , '-',''
        )
    ),
    ticket_name VARCHAR UNIQUE NOT NULL,
    ticket_description VARCHAR NOT NULL,
    ticket_image_url VARCHAR NOT NULL,
    insurance_coverage NUMERIC NOT NULL,
    processing_fee NUMERIC NOT NULL,
    ticket_status ticket_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_categories(
  id SERIAL,
  ticket_category_id VARCHAR PRIMARY KEY DEFAULT 'ticket-category-' || LOWER(
          REPLACE(
              CAST(uuid_generate_v1mc() AS VARCHAR(20))
              , '-',''
          )
      ),
  ticket_id VARCHAR REFERENCES tickets(ticket_id),
  ticket_category_type ticket_category_type DEFAULT 'regular',
  ticket_price NUMERIC NOT NULL,
  ticket_category_status ticket_category_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_tickets(
  id SERIAL,
  user_ticket_id VARCHAR PRIMARY KEY DEFAULT 'user-ticket-' || LOWER(
    REPLACE(
      CAST(uuid_generate_v1mc() AS VARCHAR(20))
      , '-', ''
    )
  ),
  user_id VARCHAR REFERENCES users(user_id),
  ticket_id VARCHAR REFERENCES tickets(ticket_id),
  status ticket_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);



