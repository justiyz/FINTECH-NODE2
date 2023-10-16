export default {
  fetchShopCategories: `
    SELECT id, shop_category_id, category_name, status, category_description
    FROM shop_categories
    `,

  createShopCategory_: `
    INSERT INTO shop_categories (category_name, category_description, status)
    VALUES ('tickets', 'Tickets description', true);
  `,

  createShopCategory: `
    INSERT INTO shop_categories (category_name, category_description, status)
    VALUES ($1, $2, $3)
    RETURNING *;
  `,

  getAllEvents2: `
      SELECT id,
      ticket_id,
      ticket_name,
      ticket_description,
      ticket_image_url,
      insurance_coverage,
      processing_fee,
      ticket_status,
      created_at,
      updated_at
    FROM tickets;
  `,

  getAllEvents: `
    SELECT tickets.id,
        tickets.ticket_id,
        tickets.ticket_name,
        tickets.ticket_description,
        tickets.ticket_image_url,
        tickets.insurance_coverage,
        tickets.processing_fee,
        tickets.ticket_status,
        tickets.event_date
    FROM tickets;

  `,
  createEventRecord: `
    INSERT INTO tickets(
        ticket_name,
        ticket_description,
        ticket_image_url,
        insurance_coverage,
        processing_fee,
        ticket_status,
        event_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
   RETURNING *;
  `,

  createTicketCategory: `
    INSERT INTO ticket_categories(
        ticket_id,
        ticket_category_type,
        ticket_price,
        units,
        ticket_category_status
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING id, ticket_category_id;
  `,

  getTicketCategories: `
    SELECT *
    FROM ticket_categories
    WHERE ticket_id = $1
  `,

  fetchUserTickets: `
    SELECT *
    FROM user_tickets
    WHERE user_id = $1
  `,

  createUserTicketRecord: `
    INSERT INTO user_tickets(
        user_id,
        ticket_id,
        ticket_category_id,
        units,
        insurance_coverage,
        payment_tenure,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `,

  fetchUserEventTicket: `
    SELECT *
    FROM user_tickets
    WHERE user_id = $1
  `,

  updateTicketUnitsAvailable: `
    UPDATE ticket_categories
    SET
        units = $2,
        updated_at = NOW()
    WHERE ticket_categories = $1
  `,

  getTicketUnitsAvailable: `
    SELECT units
    FROM ticket_categories
    WHERE ticket_category_id = $1
  `
};
