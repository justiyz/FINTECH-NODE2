const Joi = require('joi').extend(require('@joi/date'));

export const updateEnvValues = Joi.array().min(1).items(
  Joi.object({
    env_id: Joi.string().required(),
    value: Joi.number().required()
  })
);
