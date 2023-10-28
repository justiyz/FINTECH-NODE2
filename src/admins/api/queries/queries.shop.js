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
        tickets.event_date,
        tickets.event_location,
        tickets.event_time,
        tickets.ticket_status
    FROM tickets
  `,
  // ,
  //   LEFT JOIN
  //   ticket_categories

  // ticket_categories.ticket_category_id,
  //   ticket_categories.ticket_category_type,
  //   ticket_categories.ticket_price,
  //   ticket_categories.units
  getLeastValueTicket: `
    SELECT *
    FROM ticket_categories
    WHERE ticket_id = $1
    AND ticket_category_type = 'regular'
  `,

  createEventRecord: `
    INSERT INTO tickets(
        ticket_name,
        ticket_description,
        ticket_image_url,
        insurance_coverage,
        processing_fee,
        ticket_status,
        event_date,
        ticket_start_date,
        ticket_end_date,
        event_location,
        event_time
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
   RETURNING *;
  `,

  updateEventRecord: `
    UPDATE tickets
    SET
      ticket_name = $1,
      ticket_description = $2,
      ticket_image_url = $3,
      insurance_coverage = $4,
      processing_fee = $5,
      ticket_status = $6,
      event_date = $7,
      ticket_start_date = $8,
      ticket_end_date = $9,
      event_location = $10,
      event_time = $11,
      updated_at = NOW()
    WHERE
      ticket_id = $12
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

  checkIfEventExist: `
    SELECT *
    FROM tickets
    WHERE ticket_name = $1
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
        status,
        ticket_qr_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `,

  storeTicketQR: `
    UPDATE user_tickets
    SET
        ticket_qr_code = $2
    WHERE user_ticket_id = $1
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
    WHERE ticket_category_id = $1
    RETURNING units;
  `,

  getTicketUnitsAvailable: `
    SELECT units, ticket_price
    FROM ticket_categories
    WHERE ticket_category_id = $1
  `
};
