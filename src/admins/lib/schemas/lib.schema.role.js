const Joi = require('joi').extend(require('@joi/date'));

const createRole = Joi.object().keys({
  name: Joi.string().required(),
  permissions: Joi.array().min(1).items(
    Joi.object().keys({
      resource_id: Joi.string().required(),
      user_permissions: Joi.array().min(1).items(Joi.string().valid('create', 'read', 'update', 'delete', 'approve', 'reject')).required()
    }).required()
  ).required()
});

const roleCodeParams = Joi.object().keys({
  role_code: Joi.string().required()
});

const editRole = Joi.object().keys({
  name: Joi.string().optional(),
  permissions: Joi.array().min(1).items(
    Joi.object().keys({
      resource_id: Joi.string().required(),
      user_permissions: Joi.array().items(Joi.string().valid('create', 'read', 'update', 'delete', 'approve', 'reject')).required()
    }).required()
  ).optional()
});

const activateDeactivateRole = Joi.object().keys({
  action: Joi.string().required().valid('activate', 'deactivate')
});

const inviteAdmin = Joi.object().keys({
  first_name: Joi.string().required(), 
  last_name: Joi.string().required(), 
  email: Joi.string().email().required(),
  role_code: Joi.string().required()
});

const editAdminStatus = Joi.object().keys({
  status: Joi.string().valid('active', 'deactivated').required()
});

const fetchAdmins = Joi.object().keys({
  page: Joi.number().positive(),
  per_page: Joi.number().positive(),
  start_date: Joi.string(),
  end_date: Joi.string(),
  status: Joi.string().valid('active', 'deactivated'),
  search: Joi.string()
});

const fetchRoles = Joi.object().keys({
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('active', 'deactivated'),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional()
});

const fetchAdminsPerRole = Joi.object().keys({
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('active', 'deactivated'),
  role_type: Joi.string().optional(),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional()
});

export default {
  createRole,
  inviteAdmin,
  editAdminStatus,
  fetchAdmins,
  fetchRoles,
  roleCodeParams,
  editRole,
  activateDeactivateRole,
  fetchAdminsPerRole
};
