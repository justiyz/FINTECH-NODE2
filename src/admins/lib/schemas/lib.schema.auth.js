const Joi = require('joi').extend(require('@joi/date'));

const login = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

export default {
  login
};
