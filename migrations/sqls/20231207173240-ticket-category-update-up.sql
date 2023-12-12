ALTER TABLE ticket_categories ADD COLUMN ticket_category_type_new varchar;
UPDATE ticket_categories SET ticket_category_type_new = ticket_category_type::varchar;
ALTER TABLE ticket_categories DROP COLUMN ticket_category_type;
ALTER TABLE ticket_categories RENAME COLUMN ticket_category_type_new TO ticket_category_type;
