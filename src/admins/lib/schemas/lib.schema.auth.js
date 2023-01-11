const Joi = require('joi').extend(require('@joi/date'));

const login = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verifyLogin = Joi.object().keys({
  otp: Joi.string().required().length(6)
});

const forgotPassword = Joi.object().keys({
  email: Joi.string().email().required()
});

const setPassword = Joi.object().keys({
  password: Joi.string().required()
});

export default {
  login,
  verifyLogin,
  setPassword,
  forgotPassword
};
