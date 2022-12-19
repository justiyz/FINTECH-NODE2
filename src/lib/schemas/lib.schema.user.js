const Joi = require('joi').extend(require('@joi/date'));

const updateFcmToken = Joi.object().keys({
  fcm_token: Joi.string().required()
});

const updateRefreshToken = Joi.object().keys({
  refreshtoken: Joi.string().required()
});

export default  {
  updateFcmToken,
  updateRefreshToken
};   
