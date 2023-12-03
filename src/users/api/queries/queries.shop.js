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
    WHERE ticket_id = $1
  `,

  getBookedTicketCategory: `
    SELECT *
    FROM ticket_categories
    WHERE ticket_category_id = $1
  `,

  getTicketInformation: `
    SELECT *
    FROM tickets
    WHERE ticket_id = $1
  `,

  getUserTickets: `
    SELECT user_tickets.*, personal_loans.status as loan_status
    FROM user_tickets
    JOIN personal_loans ON personal_loans.loan_id = user_tickets.loan_id
    WHERE user_tickets.user_id = $1
    AND user_tickets.status = $2
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
