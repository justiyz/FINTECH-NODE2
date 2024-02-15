const Joi = require('joi').extend(require('@joi/date'));

const resetPassword = Joi.object().keys({
  password: Joi.string().regex(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$')).messages({
    'string.pattern.base': 'Invalid password combination'
  }).required().min(8),
  old_password: Joi.string().required(),
  email: Joi.string().email().required()
});

const login = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verifyLogin = Joi.object().keys({
  otp: Joi.string().required().length(6),
  email: Joi.string().email().required()
});

// ======================================




const forgotPassword = Joi.object().keys({
  email: Joi.string().email().required()
});

const setPassword = Joi.object().keys({
  password: Joi.string().required()
});

export default {
  resetPassword,
  login,
  verifyLogin,

  // ======================================
  setPassword,
  forgotPassword
};
