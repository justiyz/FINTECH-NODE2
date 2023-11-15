CREATE TABLE IF NOT EXISTS ticket_recipients(
    id SERIAL,
    ticket_recipient_id VARCHAR PRIMARY KEY DEFAULT 'ticket-recipient-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(20))
            , '-',''
        )
    ),
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    phone_number VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    ticket_id VARCHAR REFERENCES tickets(ticket_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
