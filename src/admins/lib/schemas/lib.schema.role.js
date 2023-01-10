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

export default {
  createRole
};
