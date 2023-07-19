
const Joi = require('joi').extend(require('@joi/date'));

export const updateEnvValues = Joi.array().min(1).items(
  Joi.object({
    env_id: Joi.string().required(),
    value: Joi.number().required()
  })
);

export const createPromo = Joi.object().keys({
  name: Joi.string().required(),
  description: Joi.string().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  image_url: Joi.string().optional(),
  percentage_discount: Joi.number().optional(),
  customer_segment: Joi.string().optional().valid('student', 'employed', 'self employed', 'unemployed','retired'),
  tier_category: Joi.string().optional().valid('1', '2')
});

export const promoId = Joi.object().keys({
  promo_id: Joi.string().required()
});

export const promoIds = Joi.array().min(1).items(
  Joi.object({
    promo_id: Joi.string().required()
  })
);

export const editPromo = Joi.object().keys({
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().optional(),
  image_url: Joi.string().optional(),
  percentage_discount: Joi.number().optional(),
  customer_segment: Joi.string().optional(),
  tier_category: Joi.string().optional().valid('1', '2')
});

export const rewardsType = Joi.object().keys({
  type: Joi.string().required().valid('general', 'cluster')
});

export const clusterRewardIds = Joi.array().min(1).items(
  Joi.object({
    reward_id: Joi.string().required(),
    point: Joi.number().required()
  })
);

export const generalRewardIds = Joi.object({
  reward_id: Joi.string().required(),
  point: Joi.number().required()
});

export const generalRewardRangeIds = Joi.array().min(1).items(
  Joi.object({
    range_id: Joi.string().required(),
    lower_bound: Joi.number().required(),
    upper_bound: Joi.number().required(),
    point: Joi.number().required()
  })
);

