const Joi = require('joi').extend(require('@joi/date'));

const shopCategory = Joi.object().keys({
  status: Joi.object().optional()
});

const shopCategoryIdParams = Joi.object().keys({
  shop_category_id: Joi.string().required()
});

const ticketList = Joi.object().keys({
  ticket_status: Joi.string().optional()
});

const userTickets = Joi.object().keys({
  user_id: Joi.string().optional()
});

const ticketId = Joi.object().keys({
  ticket_id: Joi.string().required()
});

const subscribeTicket = Joi.object().keys({
  units: Joi.string().required(),
  ticket_id: Joi.string().required(),
  insurance_type: Joi.string().required(),
  insurance_coverage: Joi.boolean().required(),
  payment_tenure: Joi.number().required(),
  ticket_start_date: Joi.string().required(),
  ticket_end_date: Joi.string().required(),
  event_location: Joi.string().required(),
  event_time: Joi.string().required()
});
export default  {
  shopCategory,
  shopCategoryIdParams,
  ticketList,
  userTickets,
  ticketId,
  subscribeTicket
};
