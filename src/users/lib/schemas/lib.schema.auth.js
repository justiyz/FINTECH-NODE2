const Joi = require('joi').extend(require('@joi/date'));

const signup = Joi.object().keys({
  phone_number: Joi.string()
    .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
    .messages({
      'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
      'string.empty': 'Phone Number is not allowed to be empty'
    }).required(),
  referral_code: Joi.string().optional()
});

const resendPhoneNumberVerificationOTP = Joi.object().keys({
  phone_number: Joi.string()
    .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
    .messages({
      'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
      'string.empty': 'Phone Number is not allowed to be empty'
    }).required()
});

const login = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const verifyPhoneNumber = Joi.object().keys({
  otp: Joi.string().required().length(6),
  fcm_token: Joi.string().required()
});

const completeProfile = Joi.object().keys({
  first_name: Joi.string().required(),
  middle_name: Joi.string().optional(),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  date_of_birth: Joi.date().format('YYYY-MM-DD').required(),
  gender: Joi.string().required().valid('male', 'female'),
  password: Joi.string().required().min(8)
});

const forgotPassword = Joi.object().keys({
  email: Joi.string().email().required()
});

const verifyOtp = Joi.object().keys({
  otp: Joi.string().required().length(6)
});
 
const password = Joi.object().keys({
  password: Joi.string().required().min(8)
});

const changePassword = Joi.object().keys({
  oldPassword: Joi.string().required().min(8),
  newPassword: Joi.string().required().min(8)
});

const pin = Joi.object().keys({
  pin: Joi.number().integer().min(4).required()
});

const changePin = Joi.object().keys({
  oldPin: Joi.number().integer().min(4).required(),
  newPin: Joi.number().integer().min(4).required()
});
 
export default {
  signup,
  resendPhoneNumberVerificationOTP,
  login,
  verifyPhoneNumber,
  completeProfile,
  forgotPassword,
  verifyOtp,
  password,
  changePassword,
  pin,
  changePin
};
