const Joi = require('joi').extend(require('@joi/date'));

export const fetchClusters = Joi.object().keys({
  search: Joi.string().optional(),
  status: Joi.string().optional().valid('active', 'inactive', 'deactivated', 'suspended'),
  loan_status: Joi.string().optional().valid('active', 'inactive'),
  type: Joi.string().optional().valid('public', 'private', 'admin_cluster'),
  page: Joi.number().positive().optional(),
  per_page: Joi.number().positive().optional()
});

export const clusterId = Joi.object().keys({
  cluster_id: Joi.string().optional()
});


export const createCluster = Joi.object().keys({
  name: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid cluster name input'
  }).required(), 
  description: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid cluster description input'
  }).required(),
  maximum_members: Joi.number().required(),
  loan_goal_target: Joi.number().required(),
  company_name: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid cluster company name input'
  }).required(),
  company_address: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid cluster company address input'
  }).required(),
  company_type: Joi.string().regex(new RegExp('^[a-zA-Z0-9 .-]+$')).messages({
    'string.pattern.base': 'Invalid cluster company type input'
  }).required(),
  company_contact_number: Joi.string()
    .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
    .messages({
      'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
      'string.empty': 'Phone Number is not allowed to be empty'
    }).required(),
  interest_type: Joi.string().required().valid('fixed', 'discount'),
  percentage_interest_type_value: Joi.number().required()
});
  
export const inviteCluster = Joi.object().keys({
  type: Joi.string().required().valid('email', 'phone_number')
}).when(Joi.object({ type: Joi.string().valid('email') }).unknown(), {
  then: Joi.object({
    email: Joi.string().email().required()
  })
}).when(Joi.object({ type: Joi.string().valid('phone_number') }).unknown(), {
  then: Joi.object({
    phone_number: Joi.string()
      .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
      .messages({
        'string.pattern.base': 'Phone number must contain +countryCode and extra required digits',
        'string.empty': 'Phone Number is not allowed to be empty'
      }).required()
  })
});

export const inviteClusterBulk = Joi.object().keys({
  type: Joi.string().required().valid('email', 'phone_number')
}).when(Joi.object({ type: Joi.string().valid('email') }).unknown(), {
  then: Joi.object({
    data: Joi.array().min(1).items(
      Joi.object({
        email: Joi.string().email().required()
      })
    )
  })
}).when(Joi.object({ type: Joi.string().valid('phone_number') }).unknown(), {
  then: Joi.object({
    data: Joi.array().min(1).items(
      Joi.object({
        phone_number: Joi.string()
          .regex(new RegExp('^(\\+[0-9]{2,}[0-9]{4,}[0-9]*)(x?[0-9]{1,})?$'))
          .messages({
            'string.pattern.base': 'Phone number should contain +countryCode and extra required digits',
            'string.empty': 'Phone Number is not allowed to be empty'
          }).required()
      })
    )
  })
});


export const editClusterStatus = Joi.object().keys({
  status: Joi.string().required().valid('active', 'deactivated')
});

export const editClusterInterestRate = Joi.object().keys({
  interest_type: Joi.string().optional().valid('fixed', 'discount'),
  percentage_interest_type_value: Joi.number().optional()
});
