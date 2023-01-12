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

const deleteRole = Joi.object().keys({
  role_code: Joi.string().required()
});

const inviteAdmin = Joi.object().keys({
  first_name: Joi.string().required(), 
  last_name: Joi.string().required(), 
  email: Joi.string().email().required(),
  role_type: Joi.string().required()
});

export default {
  createRole,
  deleteRole,
  inviteAdmin
};
