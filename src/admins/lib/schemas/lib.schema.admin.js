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
  permissions: Joi.array().min(1).items(
    Joi.object().keys({
      resource_id: Joi.string().required(),
      user_permissions: Joi.array().items(Joi.string().valid('create', 'read', 'update', 'delete', 'approve', 'reject')).required()
    }).required()
  ).required()
});

const adminIdParams = Joi.object().keys({
  admin_id: Joi.string().required()
});

export default {
  adminCompleteProfile,
  editAdminPermissions,
  adminIdParams
};
