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
export default  {
  shopCategory,
  shopCategoryIdParams,
  ticketList,
  userTickets,
  ticketId
};
