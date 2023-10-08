INSERT INTO shop_categories (
    category_name,
    category_description,
    status
) VALUES (
    'events',
    'upcoming events all around the world',
    true
)
ON CONFLICT (category_name)
DO
UPDATE
SET
category_name = EXCLUDED.category_name,
category_description = EXCLUDED.category_description,
status = EXCLUDED.status;
