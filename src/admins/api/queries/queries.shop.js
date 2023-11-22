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
        tickets.created_at,
        tickets.updated_at,
        tickets.ticket_status
    FROM
        tickets
    ORDER BY
        tickets.event_date ASC;
  `,

  getCustomerTicketInformation: `
    SELECT
        tickets.ticket_name,
        tickets.event_location,
        tickets.event_time,
        tickets.ticket_image_url,
        tickets.event_date
    FROM tickets
    WHERE
        ticket_id = $1
  `,

  getEventAmountByEventIdAndEventCategoryId: `
    SELECT *
    FROM
        ticket_categories
    WHERE
        ticket_id = $1
    AND
        ticket_category_id = $2;
  `,
  getEventById: `
    SELECT *
    FROM
        tickets
    WHERE
        ticket_id = $1
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

  getTicketCategoryTypeById: `
    SELECT ticket_category_type
    FROM ticket_categories
    WHERE ticket_id = $1
    AND ticket_category_id = $2
  `,
  getPriceOfLeastValueTicket: `
    SELECT ticket_price
    FROM ticket_categories
    WHERE ticket_id = $1
    AND ticket_category_type = 'regular'
  `,

  deleteTicketInformationRecord: `
    DELETE FROM user_tickets
    WHERE
        user_id = $2
    AND
        ticket_id = $1
    AND
        status = 'inactive'
  `,

  deleteTicketRecord: `
    DELETE FROM user_tickets
    WHERE
        ticket_id = $1
    AND
        user_id = $2
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
        event_time,
        event_start_date,
        event_end_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
      updated_at = NOW(),
      event_start_date = $12,
      event_end_date = $13
    WHERE
      ticket_id = $14
    RETURNING
        ticket_name,
        ticket_description,
        ticket_image_url,
        insurance_coverage,
        processing_fee,
        ticket_image_url,
        event_date,
        ticket_start_date,
        ticket_end_date,
        event_location,
        event_time,
        updated_at,
        event_start_date,
        event_end_date
        ;
  `,

  getEventRecordByTicketId: `
    SELECT *
    FROM ticket_categories
    WHERE ticket_category_id = $1
  `,

  getTicketCategoriesByTicketId: `
    SELECT *
    FROM tickets
    WHERE ticket_id = $1
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

  updateEventTicketCategory: `
    UPDATE ticket_categories
    SET
        ticket_price = $1,
        units = $2,
        ticket_category_status = $3,
        updated_at = NOW()
    WHERE
        ticket_category_id = $4
    RETURNING
        ticket_category_id,
        ticket_id,
        ticket_category_type,
        ticket_price,
        units,
        ticket_category_status
  `,

  getTicketByReference: `
    SELECT user_tickets.loan_id, user_tickets.principal_payment
    FROM user_tickets
    LEFT JOIN tickets ON tickets.ticket_id = user_tickets.ticket_id
    WHERE
        user_tickets.transaction_reference = $1
    AND
        user_tickets.user_id = $2
    AND
        user_tickets.ticket_id = $3
  `,

  updateEventStatus: `
    UPDATE user_tickets
    SET
        status = 'active',
        updated_at = NOW()
    WHERE
        user_id = $1
    AND
        ticket_id = $2
    AND
        transaction_reference = $3
   RETURNING user_ticket_id, ticket_id, status
  `,

  updateUserTicketsByReference: `
    UPDATE user_tickets
    SET
        status = 'active',
        transaction_reference = $3
        updated_at = NOW()
    WHERE
        ticket_id = $2
        AND user_id = $1
  `,

  updateEventTicketCategory2: `
    UPDATE ticket_categories
    SET
        ticket_price = $1,
        units = $2,
        ticket_category_status = $3,
        updated_at = NOW()
    WHERE
        ticket_category_id = $4
    AND
        ticket_id = $5
    RETURNING
        ticket_category_id,
        ticket_id,
        ticket_category_type,
        ticket_price,
        units,
        ticket_category_status
  `,

  getTicketCategories: `
    SELECT
        id,
        ticket_category_id,
        ticket_category_type,
        ticket_price,
        units,
        ticket_category_status
    FROM ticket_categories
    WHERE ticket_id = $1
  `,

  getTicketCategoryByID: `
    SELECT *
    FROM ticket_categories
    WHERE ticket_category_id = $1
  `,

  getTicketUnitsAvailable: `
    SELECT units, ticket_price
    FROM ticket_categories
    WHERE ticket_category_id = $1
  `,

  updateTicketUnitsAvailable: `
    UPDATE ticket_categories
    SET
        units = $2,
        updated_at = NOW()
    WHERE ticket_category_id = $1
    RETURNING units;
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
        ticket_qr_code,
        transaction_reference,
        loan_id,
        ticket_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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

  savedRecipientInformation: `
    INSERT INTO ticket_recipients(
        first_name,
        last_name,
        phone_number,
        email,
        ticket_id
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING ticket_recipient_id, first_name, last_name, email;
  `
};
