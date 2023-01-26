const Joi = require('joi').extend(require('@joi/date'));

const userIdParams = Joi.object().keys({
  user_id: Joi.string().required()
});

const fetchUsers = Joi.object().keys({
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('active', 'inactive', 'suspended', 'deactivated'),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional()
});

const editStatus = Joi.object().keys({
  status: Joi.string().valid('active', 'deactivated').required()
});

export default {
  userIdParams,
  editStatus,
  fetchUsers
};
