import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../../../users/config/index';
import Crypto from 'crypto';
import CryptoJS from 'crypto-js';


const { SEEDFI_ENCODING_AUTHENTICATION_SECRET, SEEDFI_BCRYPT_SALT_ROUND } = config;

export const generateAdminAuthToken = (admin, permissions) => {
  try {
    const { admin_id, role_type } = admin;
    return jwt.sign({ admin_id, role_type, ...permissions }, SEEDFI_ENCODING_AUTHENTICATION_SECRET, { expiresIn: '1h' });
  } catch (error) {
    return error;
  }
};

export const generateMerchantAdminAuthToken = (merchant, permissions = null) => {
  try {
    const { merchant_admin_id, role_type } = merchant;
    return jwt.sign({ merchant_admin_id, role_type, ...permissions }, SEEDFI_ENCODING_AUTHENTICATION_SECRET, { expiresIn: '1h' });
  } catch (error) {
    return error;
  }
};

export const generateRandomString = (size) => {
  try {
    return Crypto.randomBytes(size).toString('hex');
  } catch (error) {
    return error;
  }
};

export const hashData = (data) => {
  const salt = bcrypt.genSaltSync(parseFloat(SEEDFI_BCRYPT_SALT_ROUND));
  const hash = bcrypt.hashSync(data, salt);
  if (hash) {
    return hash;
  }
  return false;
};

export const generateAdminResetPasswordToken = (admin) => {
  try {
    const { email } = admin;
    return jwt.sign({ email }, SEEDFI_ENCODING_AUTHENTICATION_SECRET, { expiresIn: '5m' });
  } catch (error) {
    return error;
  }
};

export const encrypt = async(data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SEEDFI_ENCODING_AUTHENTICATION_SECRET).toString();
  } catch (error) {
    return error;
  }
};

export const decrypt = async(ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext.toString(), SEEDFI_ENCODING_AUTHENTICATION_SECRET);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

