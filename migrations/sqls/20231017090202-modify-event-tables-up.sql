CREATE TYPE insurance_types AS ENUM('nil', 'flat', 'percentage');
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_start_date VARCHAR DEFAULT '00-00-00';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_end_date VARCHAR DEFAULT '00-00-00';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS insurance_type insurance_types DEFAULT 'percentage';
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS event_location VARCHAR;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS event_time VARCHAR;
