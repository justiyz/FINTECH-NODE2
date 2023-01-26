const Joi = require('joi').extend(require('@joi/date'));

const userIdParams = Joi.object().keys({
  user_id: Joi.string().required()
});

const editStatus = Joi.object().keys({
  status: Joi.string().valid('active', 'deactivated').required()
});

export default {
  userIdParams,
  editStatus
};
