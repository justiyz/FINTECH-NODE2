/* Replace with your SQL commands */
CREATE TYPE admin_notification_types AS ENUM('push', 'system', 'alert');
CREATE TABLE admin_sent_notifications (
    id SERIAL,
    notification_id VARCHAR PRIMARY KEY DEFAULT 'notify-' || LOWER(
        REPLACE(
            CAST(uuid_generate_v1mc() AS VARCHAR(50))
            , '-',''
        )
    ),
    sent_by VARCHAR NOT NULL REFERENCES admins(admin_id),
    type admin_notification_types NOT NULL,
    title VARCHAR,
    content TEXT NOT NULL,
    sent_to TEXT [],
    end_at TIMESTAMPTZ,
    is_ended BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);





