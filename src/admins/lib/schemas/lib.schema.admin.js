const Joi = require('joi').extend(require('@joi/date'));

const adminCompleteProfile = Joi.object().keys({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  phone_number: Joi.string()
    .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
    .messages({
      'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
      'string.empty': 'Phone Number is not allowed to be empty'
    }).required(),
  gender: Joi.string().required().valid('male', 'female')
});

const editAdminPermissions = Joi.object().keys({
  role_code: Joi.string().optional(),
  permissions: Joi.array().min(1).items(
    Joi.object().keys({
      resource_id: Joi.string().required(),
      user_permissions: Joi.array().items(Joi.string().valid('create', 'read', 'update', 'delete', 'approve', 'reject')).required()
    }).required()
  ).optional()
});

const fetchBlacklistedBvn = Joi.object().keys({
  search: Joi.string().optional(),
  bvn: Joi.string().optional(),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional(),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  export: Joi.string().optional().valid('true')
});

const adminIdParams = Joi.object().keys({
  admin_id: Joi.string().required()
});

const unblacklist_bvn = Joi.object().keys({
  id: Joi.string().required()
});

const singleBvn = Joi.object({
  type: Joi.string().required().valid('single'),
  first_name: Joi.string().required(),
  middle_name: Joi.string().required(),
  last_name: Joi.string().required(),
  date_of_birth: Joi.string().required(),
  bvn: Joi.string().length(11).required()
});

const bulkBvn = Joi.object({
  type: Joi.string().required().valid('bulk'),
  data: Joi.array().min(1).items(
    Joi.object({
      first_name: Joi.string().required(),
      middle_name: Joi.string().required(),
      last_name: Joi.string().required(),
      date_of_birth: Joi.string().required(),
      bvn: Joi.string().required()
    })
  )
});

const blacklistedBvn = Joi.alternatives().try(singleBvn, bulkBvn);

const adminNotificationIdParams = Joi.object().keys({
  adminNotificationId: Joi.string().required()
});

const sendNotification = Joi.object({
  type: Joi.string().valid('alert', 'push', 'system').required(),
  recipient: Joi.string().valid('all', 'select').required()
}).when(Joi.object({ type: Joi.string().valid('alert') }).unknown(), {
  then: Joi.object({
    end_at: Joi.date().required(),
    content: Joi.string().required()
  })
}).when(Joi.object({ type: Joi.string().valid('system') }).unknown(), {
  then: Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    sent_to: Joi.array().items(Joi.object({
      user_id: Joi.string().required(),
      name: Joi.string().required()
    })).min(1).required()
  })
});

const fetchNotification = Joi.object().keys({
  is_ended: Joi.boolean().optional(),
  title: Joi.string().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional()
});

export default {
  adminCompleteProfile,
  editAdminPermissions,
  adminIdParams,
  unblacklist_bvn,
  fetchBlacklistedBvn,
  blacklistedBvn,
  adminNotificationIdParams,
  sendNotification,
  fetchNotification
};
