const Joi = require('joi').extend(require('@joi/date'));

const createRole = Joi.object().keys({
  name: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid role name input'
  }).required(),
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
  name: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid role name input'
  }).optional(),
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
  export: Joi.string().valid('true'),
  status: Joi.string().valid('active', 'deactivated'),
  search: Joi.string()
});

const fetchRoles = Joi.object().keys({
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('active', 'deactivated'),
  export: Joi.string().optional().valid('true'),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional()
});

const fetchAdminsPerRole = Joi.object().keys({
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('active', 'deactivated'),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional()
});

const roleType = Joi.object().keys({
  role_type: Joi.string().required()
});

const overviewPage = Joi.object().keys({
  type: Joi.string().required().valid('filter', 'all')
}).when(Joi.object({ type: Joi.string().valid('filter') }).unknown(), {
  then: Joi.object({
    from_date: Joi.date().required(),
    to_date: Joi.date().required()
  })
});

const fetchActivityLog = Joi.object().keys({
  search: Joi.string().optional(),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional(),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional()
});

const loanAndClusterAnalytics = Joi.object().keys({
  type: Joi.string().required().valid('filter', 'all')
}).when(Joi.object({ type: Joi.string().valid('filter') }).unknown(), {
  then: Joi.object({
    from_date: Joi.date().required(),
    to_date: Joi.date().required()
  })
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
  fetchAdminsPerRole,
  roleType,
  overviewPage,
  fetchActivityLog,
  loanAndClusterAnalytics
};
