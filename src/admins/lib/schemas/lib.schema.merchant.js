const Joi = require('joi')//.extend(require('@joi/date'));

const createMerchant = Joi.object().keys({
  business_name: Joi.string().required(),
  email: Joi.string()
    .required()
    .email()
    .messages({
      'string.pattern.base': 'Please enter a valid email.',
      'string.empty': 'Email is not allowed to be empty',
    }),
  phone_number: Joi.string()
    .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
    .messages({
      'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
      'string.empty': 'Phone Number is not allowed to be empty'
    }).required(),
  interest_rate: Joi.string().required().label('Interest Rate'),
  orr_score_threshold: Joi.string().required().label('ORR score'),
  address: Joi.string().required().label('Address'),
  secret_key: Joi.string().required().label('API Key'),
  // bank account details
  bank_name: Joi.string().optional().label('Bank Name'),
  bank_code: Joi.number().optional().label('Bank Code'),
  account_number: Joi.string().optional().label('Account number'),
});

const generateMerchantKey = Joi.object().keys({
  email: Joi.string()
    .required()
    .email()
    .messages({
      'string.pattern.base': 'Please enter a valid email.',
      'string.empty': 'Email is not allowed to be empty',
    }),
});

const fetchMerchants = Joi.object().keys({
  page: Joi.number().positive(),
  per_page: Joi.number().positive().max(200),
  status: Joi.string().valid('pending', 'active', 'deactivated'),
  search: Joi.string()
});

const updateMerchant = Joi.object().keys({
  business_name: Joi.string().optional(),
  status: Joi.string().optional().valid('pending', 'active', 'deactivated'),
  phone_number: Joi.string()
    .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
    .messages({
      'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
      'string.empty': 'Phone Number is not allowed to be empty'
    }).optional(),
  interest_rate: Joi.string().optional().label('Interest Rate'),
  address: Joi.string().optional().label('Address'),
});

const resolveAccountNumber = Joi.object().keys({
  account_number: Joi.string().required(),
  bank_code: Joi.string().required()
});

export default {
  createMerchant,
  generateMerchantKey,
  fetchMerchants,
  updateMerchant,
  resolveAccountNumber,
};
