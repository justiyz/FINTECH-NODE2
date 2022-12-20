const Joi = require('joi').extend(require('@joi/date'));

const updateFcmToken = Joi.object().keys({
  fcm_token: Joi.string().required()
});

const updateRefreshToken = Joi.object().keys({
  refreshToken: Joi.string().required()
});

const bvnVerification = Joi.object().keys({
  bvn: Joi.string().required()
});

export default  {
  updateFcmToken,
  updateRefreshToken,
  bvnVerification
};   
