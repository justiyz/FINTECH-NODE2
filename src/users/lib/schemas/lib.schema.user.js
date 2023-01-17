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

const idVerification = Joi.object().keys({
  id_type:  Joi.string().required(),
  card_number:  Joi.string().required(),
  image_url:  Joi.string().required(),
  verification_url:  Joi.string().required(),
  issued_date:  Joi.string().optional() ,
  expiry_date:  Joi.string().optional()
});

export default  {
  updateFcmToken,
  updateRefreshToken,
  selfieUpload,
  bvnVerification,
  verifyEmail,
  verifyOtp,
  idVerification
};   
