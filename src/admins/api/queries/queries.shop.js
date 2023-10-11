export default {
  fetchShopCategories: `
    SELECT id, shop_category_id, category_name, status, category_description
    FROM shop_categories`,

  createShopCategory_: `
    INSERT INTO shop_categories (category_name, category_description, status)
    VALUES ('tickets', 'Tickets description', true);
  `,

  createShopCategory: `
    INSERT INTO shop_categories (category_name, category_description, status)
    VALUES ($1, $2, $3);
  `,

  getAllEvents: `
    SELECT * FROM tickets
    WHERE ticket_status=$1;
    ORDER BY created_at DESC
  `,
  createEventRecord: `
    INSERT INTO tickets(
    ticket_name, ticket_description, ticket_image_url, insurance_coverage, processing_fee, ticket_status
    ) VALUES ($1, $2, $3, $4, $5, $6)
  `
};
