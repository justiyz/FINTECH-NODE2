const Joi = require('joi');// .extend(require('@joi/date'));

const createMerchant = Joi.object().keys({
  business_name: Joi.string().min(3).required(),
  email: Joi.string()
    .required()
    .email()
    .messages({
      'string.pattern.base': 'Please enter a valid email.',
      'string.empty': 'Email is not allowed to be empty'
    }),
  phone_number: Joi.string()
    .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
    .messages({
      'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
      'string.empty': 'Phone Number is not allowed to be empty'
    }).required(),
  interest_rate: Joi.number().min(0).required().label('Interest Rate'),
  orr_score_threshold: Joi.string().required().regex(/^\d+$/).messages({
    'string.pattern.base': 'ORR score must be a number'
  }).label('ORR score'),
  processing_fee: Joi.number().min(0).required().label('Processing fee'),
  insurance_fee: Joi.number().min(0).required().label('Insurance fee'),
  advisory_fee: Joi.number().min(0).required().label('Advisory fee'),
  customer_loan_max_amount: Joi.number().min(0).required().label('Limit per customer'),
  merchant_loan_limit: Joi.number().min(0).required().label('Merchant loan limit'),
  address: Joi.string().required().label('Address'),
  // bank account details
  bank_name: Joi.string().required().label('Bank Name'),
  bank_code: Joi.number().required().label('Bank Code'),
  account_number: Joi.string().required().label('Account number')
});

const createMerchantAdmin = Joi.object().keys({
  first_name: Joi.string().required().messages({'string.empty': 'First name is not allowed to be empty'}),
  last_name: Joi.string().required().messages({'string.empty': 'Last name is not allowed to be empty'}),
  email: Joi.string()
    .required()
    .email()
    .messages({
      'string.pattern.base': 'Please enter a valid email.',
      'string.empty': 'Email is not allowed to be empty'
    }),
  phone_number: Joi.string()
    .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
    .messages({
      'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
      'string.empty': 'Phone Number is not allowed to be empty'
    }).required(),
  gender: Joi.string().optional().valid('male', 'female')
  // ,
  // password: Joi.string().required()
});

const createMerchantAdminParams = Joi.object().keys({
  merchant_id: Joi.string().required().label('Merchant ID')
});

const fetchMerchants = Joi.object().keys({
  page: Joi.number().positive(),
  per_page: Joi.number().positive().max(200),
  status: Joi.string().valid('pending', 'active', 'deactivated'),
  search: Joi.string()
});

const fetchMerchantUsers = Joi.object().keys({
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('active', 'inactive', 'deactivated', 'suspended', 'watchlisted', 'blacklisted')
});

const fetchMerchantAdministrators = Joi.object().keys({
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('active', 'inactive', 'deactivated', 'suspended', 'watchlisted', 'blacklisted')
});

const fetchMerchantLoans = Joi.object().keys({
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('pending', 'declined', 'approved', 'ongoing', 'over due', 'completed')
});

const filterByUserId = Joi.object().keys({
  user_id: Joi.string().required()
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
  interest_rate: Joi.number().min(0).optional().label('Interest Rate'),
  orr_score_threshold: Joi.string().optional().regex(/^\d+$/).messages({
    'string.pattern.base': 'ORR score must be a number'
  }).label('ORR score'),
  processing_fee: Joi.number().min(0).optional().label('Processing fee'),
  insurance_fee: Joi.number().min(0).optional().label('Insurance fee'),
  advisory_fee: Joi.number().min(0).optional().label('Advisory fee'),
  customer_loan_max_amount: Joi.number().min(0).optional().label('Limit per customer'),
  merchant_loan_limit: Joi.number().min(0).optional().label('Merchant loan limit'),
  address: Joi.string().optional().label('Address'),
  // bank account details
  bank_name: Joi.string().optional().label('Bank Name'),
  bank_code: Joi.number().optional().label('Bank Code'),
  account_number: Joi.string().optional().label('Account number')
});

const updateMerchantUser = Joi.object().keys({
  user_id: Joi.string().required(),
  status: Joi.string().optional().valid('inactive', 'active', 'suspended', 'deactivated')
});

const resolveAccountNumber = Joi.object().keys({
  account_number: Joi.string().required(),
  bank_code: Joi.string().required()
});

const merchantPassword = Joi.object().keys({
  password: Joi.string().regex(new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{8,}$')).messages({
    'string.pattern.base': 'Invalid password combination'
  }).required().min(8),
  old_password: Joi.string().required()
});

const merchantAdminCredentials = Joi.object().keys({
  email: Joi.string()
    .required()
    .email()
    .messages({
      'string.pattern.base': 'Please enter a valid email.',
      'string.empty': 'Email is not allowed to be empty'
    }),
  password: Joi.string().required()
});

const forgotPassword = Joi.object().keys({
  email: Joi.string().email().required()
});

const verifyLogin = Joi.object().keys({
  otp: Joi.string().required().length(6),
  email: Joi.string().email().required()
});

export default {
  createMerchant,
  fetchMerchants,
  fetchMerchantUsers,
  fetchMerchantLoans,
  filterByUserId,
  updateMerchant,
  updateMerchantUser,
  resolveAccountNumber,
  createMerchantAdmin,
  merchantAdminCredentials,
  merchantPassword,
  forgotPassword,
  verifyLogin,
  createMerchantAdminParams,
  fetchMerchantAdministrators
};
