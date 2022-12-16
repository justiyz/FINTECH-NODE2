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
  middle_name: Joi.string().allow(''),
  last_name: Joi.string().required(),
  email: Joi.string().email().required(),
  date_of_birth: Joi.date().format('DD-MM-YYY').required(),
  gender: Joi.string().required().valid('male', 'female'),
  password: Joi.string().required().min(8)
});


export default {
  signup,
  resendPhoneNumberVerificationOTP,
  login,
  verifyPhoneNumber,
  completeProfile
};
