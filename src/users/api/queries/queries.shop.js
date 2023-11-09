export default {
  shopCategories: `
    SELECT id, shop_category_id, category_name, status, category_description
    FROM shop_categories
    WHERE status = true`,

  getShopDetails: `
    SELECT id, shop_category_id, category_name, status, category_description
    FROM shop_categories
    WHERE shop_category_id = $1
  `,

  getTickets: `
    SELECT *
    FROM tickets
    WHERE ticket_status = $1
  `,

  getTicketCategories: `
    SELECT *
    FROM ticket_categories
    WHERE ticket_id =$1
  `,

  getUserTickets: `
    SELECT *
    FROM user_tickets
    WHERE user_id = $1
    AND status = $2
    ORDER BY id ASC
  `,

  getUserTicketsRefined: `
    SELECT *
    FROM user_tickets
    WHERE user_id = $1
    AND status = $2
    AND ticket_id = $3
  `,

  getUserTickectsMiniInformation: `
    SELECT
      user_ticket_id,
      user_id,
      ticket_category_id,
      units,
      insurance_coverage,
      payment_tenure,
      status
    FROM user_tickets
    WHERE user_id = $1
    AND status = $2
  `,

  getTicketSummary: `
    SELECT *
    FROM user_tickets
    WHERE ticket_id = $1
  `

};
