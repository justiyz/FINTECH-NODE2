const Joi = require('joi').extend(require('@joi/date'));

const updateFcmToken = Joi.object().keys({
  fcm_token: Joi.string().required()
});

const updateRefreshToken = Joi.object().keys({
  refreshToken: Joi.string().required()
});

const selfieUpload = Joi.object().keys({
  image_url: Joi.string().required()
});

const selfieUploadNew = Joi.object().keys({
  metadata: Joi.object().required(),
  data: Joi.object().required(),
  message: Joi.string().required(),
  referenceId: Joi.string().required(),
  verificationMode: Joi.string().allow('').required(),
  verificationType: Joi.string().allow(null).required(),
  verificationValue: Joi.string().allow(null).required(),
  verificationUrl: Joi.string().uri().required(),
  selfieUrl: Joi.string().uri().required(),
  status: Joi.boolean().required(),
  aml: Joi.object({
      status: Joi.boolean().required()
    }).required(),
  verificationStatus: Joi.string().required(),
});

const resolveAccountNumber = Joi.object().keys({
  account_number: Joi.string().required(),
  bank_code: Joi.string().required()
});

const saveAccountDetails = Joi.object().keys({
  bank_name: Joi.string().required(),
  account_number: Joi.string().required(),
  bank_code: Joi.string().required()
});

const idParams = Joi.object().keys({
  id: Joi.string().required()
});

const accountChoiceType = Joi.object().keys({
  type: Joi.string().required().valid('disbursement', 'default')
});

const bvnVerification = Joi.object().keys({
  bvn: Joi.string().required().length(11)
});

const sendBvnOtp = Joi.object().keys({
  bvn: Joi.string().required().length(11),
  date_of_birth: Joi.string().required()
});

const verifyBvnOtp = Joi.object().keys({
  bvn: Joi.string().required().length(11),
  code: Joi.string().required()
});

const verifyBVNInformation = Joi.object().keys({
  bvn: Joi.string().required().length(11),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  date_of_birth: Joi.string().required(),
  gender: Joi.string().required()
});

const idDocumentVerification = Joi.object().keys({
  document_id: Joi.string().required(),
  document_type: Joi.string().required().valid('nin', 'voters_card', 'international_passport')
});

const verifyEmail = Joi.object().keys({
  email: Joi.string().email().required()
});

const verifyOtp = Joi.object().keys({
  verifyValue: Joi.string().required()
});

const idVerification = Joi.object().keys({
  id_type: Joi.string().required(),
  card_number: Joi.string().required(),
  image_url: Joi.string().required(),
  verification_url: Joi.string().required(),
  issued_date: Joi.string().optional() ,
  expiry_date: Joi.string().optional()
});

const addressVerification = Joi.object().keys({
  house_number: Joi.string().required(),
  landmark: Joi.string().required(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  lga: Joi.string().required(),
  resident_type: Joi.string().required(),
  rent_amount: Joi.number().positive().optional()
});

const updateUsersProfile = Joi.object().keys({
  first_name: Joi.string().regex(new RegExp('^[a-zA-Z0-9-]+$')).messages({
    'string.pattern.base': 'Invalid first name input'
  }).optional(),
  middle_name: Joi.string().regex(new RegExp('^[a-zA-Z0-9-]+$')).messages({
    'string.pattern.base': 'Invalid middle name input'
  }).optional(),
  last_name: Joi.string().regex(new RegExp('^[a-zA-Z0-9-]+$')).messages({
    'string.pattern.base': 'Invalid last name input'
  }).optional(),
  date_of_birth: Joi.date().optional(),
  gender: Joi.string().optional().valid('male', 'female'),
  number_of_children: Joi.number().required(),
  marital_status: Joi.string().required()
});

const updateNotificationIsRead = Joi.object().keys({
  type: Joi.string().required().valid('regular', 'voting')
}).when(Joi.object({ type: Joi.string().valid('voting') }).unknown(), {
  then: Joi.object({
    extra_data: Joi.object().required()
  })
});

const notificationIdParams = Joi.object().keys({
  notificationId: Joi.string().required()
});

const nextOfKin = Joi.object().keys({
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

const employmentDetails = Joi.object().keys({
  employment_type: Joi.string().required().valid('employed', 'self employed', 'unemployed', 'student', 'retired'),
  monthly_income: Joi.string().required()
}).when(Joi.object({ employment_type: Joi.string().valid('employed') }).unknown(), {
  then: Joi.object({
    company_name: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
      'string.pattern.base': 'Invalid company name input'
    }).required()
  })
}).when(Joi.object({ employment_type: Joi.string().valid('student') }).unknown(), {
  then: Joi.object({
    school_name: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
      'string.pattern.base': 'Invalid school name input'
    }).required(),
    date_started: Joi.string().required()
  })
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

const updateMonoId = Joi.object().keys({
  mono_account_code: Joi.string().required()
});

const tierLoanValue = Joi.object().keys({
  type: Joi.string().required().valid('tier_one', 'tier_two')
});


export default  {
  updateFcmToken,
  updateRefreshToken,
  selfieUpload,
  resolveAccountNumber,
  idParams,
  accountChoiceType,
  saveAccountDetails,
  bvnVerification,
  verifyEmail,
  verifyOtp,
  idVerification,
  addressVerification,
  updateUsersProfile,
  updateNotificationIsRead,
  notificationIdParams,
  nextOfKin,
  employmentDetails,
  updateEmploymentDetails,
  updateMonoId,
  tierLoanValue,
  idDocumentVerification,
  sendBvnOtp,
  verifyBvnOtp,
  verifyBVNInformation
};
