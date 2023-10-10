INSERT INTO ticket_categories(
    ticket_category_type,
    ticket_category_price,
) VALUES ('silver',12000),
    ('diamond',13000),
    ('gold',10000);
ON CONFLICT (code)
DO
UPDATE
SET
code = EXCLUDED.ticket_category_type,
name = EXCLUDED.ticket_category_price;

