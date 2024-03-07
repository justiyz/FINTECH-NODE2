const Joi = require('joi').extend(require('@joi/date'));

const userIdParams = Joi.object().keys({
  user_id: Joi.string().required()
});

const notificationTypeQuery = Joi.object().keys({
  type: Joi.string().required().valid('incomplete-profile')
});

const fetchUsers = Joi.object().keys({
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional(),
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('active', 'inactive', 'deactivated', 'suspended', 'watchlisted', 'blacklisted'),
  export: Joi.string().optional().valid('true'),
  loan_status: Joi.string().optional().valid('active', 'inactive', 'over due'),
  from_date: Joi.date().optional(),
  to_date: Joi.date().optional()
});

const fileTitle = Joi.object().keys({
  type: Joi.string().required().valid('image', 'file'),
  title: Joi.string().required()
});

const editStatus = Joi.object().keys({
  status: Joi.string().valid('active', 'deactivated', 'suspended', 'watchlisted', 'blacklisted').required()
});

const approveUtilityBill = Joi.object().keys({
  decision: Joi.string().valid('approve').required()
});

const declineUtilityBill = Joi.object().keys({
  decision: Joi.string().valid('decline').required()
});

const clusterDetailsParams = Joi.object().keys({
  user_id: Joi.string().required(),
  cluster_id: Joi.string().required()
});
const fetchUserRewards = Joi.object().keys({
  page: Joi.number().optional(),
  per_page: Joi.number().optional()
});

const updateUsersProfile = Joi.object().keys({
  email: Joi.string().email({ tlds: { allow: false } }).optional(),
  phone_number: Joi.string().optional(),
  date_of_birth: Joi.date().optional(),
  gender: Joi.string().optional().valid('male', 'female'),
  number_of_children: Joi.number().optional(),
  marital_status: Joi.string().optional(),
  first_name: Joi.string().optional(),
  middle_name: Joi.string().allow('').optional(),
  last_name: Joi.string().optional(),
  tier: Joi.number().optional()
});

const updateEmploymentDetails = Joi.object().keys({
  employment_type: Joi.string().required().valid('employed', 'self employed', 'unemployed', 'student', 'retired'),
  monthly_income: Joi.string().optional()
}).when(Joi.object({ employment_type: Joi.string().valid('employed') }).unknown(), {
  then: Joi.object({
    company_name: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
      'string.pattern.base': 'Invalid company name input'
    }).optional()
  })
}).when(Joi.object({ employment_type: Joi.string().valid('student') }).unknown(), {
  then: Joi.object({
    school_name: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
      'string.pattern.base': 'Invalid school name input'
    }).optional(),
    date_started: Joi.string().optional()
  })
});

const updateUserResidentialAddress = Joi.object().keys({
  house_number: Joi.string().required(),
  landmark: Joi.string().required(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  country: Joi.string().required(),
  state: Joi.string().required(),
  lga: Joi.string().required(),
  type_of_residence: Joi.string().required(),
  rent_amount: Joi.number().positive().optional()
});

const updateNextOfKin = Joi.object().keys({
  first_name: Joi.string().regex(new RegExp('^[a-zA-Z0-9-]+$')).messages({
    'string.pattern.base': 'Invalid first name input'
  }).required(),
  last_name: Joi.string().regex(new RegExp('^[a-zA-Z0-9-]+$')).messages({
    'string.pattern.base': 'Invalid last name input'
  }).required(),
  phone_number: Joi.string()
    .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
    .messages({
      'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
      'string.empty': 'Phone Number is not allowed to be empty'
    }).required(),
  email: Joi.string().email().required(),
  kind_of_relationship: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid relations type input'
  }).required()
});


export default {
  userIdParams,
  notificationTypeQuery,
  editStatus,
  fetchUsers,
  clusterDetailsParams,
  approveUtilityBill,
  declineUtilityBill,
  fileTitle,
  fetchUserRewards,
  updateUsersProfile,
  updateEmploymentDetails,
  updateUserResidentialAddress,
  updateNextOfKin
};
