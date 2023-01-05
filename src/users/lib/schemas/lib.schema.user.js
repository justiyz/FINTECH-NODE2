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

const bvnVerification = Joi.object().keys({
  bvn: Joi.string().required()
});

const verifyEmail = Joi.object().keys({
  email: Joi.string().email().required()
});

const verifyOtp = Joi.object().keys({
  verifyValue: Joi.string().required()
});

export default  {
  updateFcmToken,
  updateRefreshToken,
  selfieUpload,
  bvnVerification,
  verifyEmail,
  verifyOtp
};   
