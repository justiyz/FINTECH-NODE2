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
  status: Joi.string().optional().valid('active', 'deactivated', 'suspended', 'watchlisted', 'blacklisted'),
  export: Joi.string().optional().valid('true'),
  loan_status: Joi.string().optional().valid('active', 'inactive', 'over due'),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional()
});

const fileTitle = Joi.object().keys({
  type: Joi.string().required().valid('image', 'file'),
  title: Joi.string().required()
});

const editStatus = Joi.object().keys({
  status: Joi.string().valid('active', 'deactivated', 'suspended', 'watchlisted', 'blacklisted').required()
});

const approveUtilityBill = Joi.object().keys({
  decision: Joi.string().valid('approve').required()
});

const declineUtilityBill = Joi.object().keys({
  decision: Joi.string().valid('decline').required()
});

const clusterDetailsParams = Joi.object().keys({
  user_id: Joi.string().required(),
  cluster_id: Joi.string().required()
});
const fetchUserRewards = Joi.object().keys({
  page: Joi.number().optional(),
  per_page: Joi.number().optional()
});

export default {
  userIdParams,
  notificationTypeQuery,
  editStatus,
  fetchUsers,
  clusterDetailsParams,
  approveUtilityBill,
  declineUtilityBill,
  fileTitle,
  fetchUserRewards
};
