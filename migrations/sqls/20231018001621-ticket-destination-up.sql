ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ticket_end_date VARCHAR DEFAULT '00-00-00';
CREATE TABLE IF NOT EXISTS admin_uploaded_documents (
  id SERIAL,
  file_id VARCHAR PRIMARY KEY DEFAULT 'ticket-category-' || LOWER(
    REPLACE(
      CAST(uuid_generate_v1mc() AS VARCHAR(20))
       , '-',''
      )
    ),
  uploaded_by VARCHAR REFERENCES admins(admin_id),
  document_title VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
