const Joi = require('joi').extend(require('@joi/date'));

const userIdParams = Joi.object().keys({
  user_id: Joi.string().required()
});

const notificationTypeQuery = Joi.object().keys({
  type: Joi.string().required().valid('incomplete-profile')
});

const fetchUsers = Joi.object().keys({
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('active', 'deactivated'),
  loan_status: Joi.string().optional().valid('active', 'inactive', 'over due'),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional()
});

const editStatus = Joi.object().keys({
  status: Joi.string().valid('active', 'deactivated').required()
});

export default {
  userIdParams,
  notificationTypeQuery,
  editStatus,
  fetchUsers
};
