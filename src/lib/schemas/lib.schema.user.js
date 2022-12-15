const Joi = require('joi').extend(require('@joi/date'));

const updateFcmToken = Joi.object().keys({
  fcm_token: Joi.string().required()
});

export default  {
  updateFcmToken
};   
