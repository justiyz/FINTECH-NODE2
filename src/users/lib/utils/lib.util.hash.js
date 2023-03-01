import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Crypto from 'crypto';
import CryptoJS from 'crypto-js';
import config from '../../config/index';

const { SEEDFI_ENCODING_AUTHENTICATION_SECRET, SEEDFI_BCRYPT_SALT_ROUND } = config;

export const generateAuthToken = (user) => {
  try {
    const { user_id } = user;
    return jwt.sign({ user_id }, SEEDFI_ENCODING_AUTHENTICATION_SECRET, { expiresIn: '1h' });
  } catch (error) {
    return error;
  }
};

export const generateResetToken = (user) => {
  try {
    const { email } = user;
    return jwt.sign({ email }, SEEDFI_ENCODING_AUTHENTICATION_SECRET, { expiresIn: '5m' });
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

export const compareData = (data, hash) => bcrypt.compareSync(data, hash);

export const decodeToken = (token) => {
  try {
    return jwt.verify(token, SEEDFI_ENCODING_AUTHENTICATION_SECRET);
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
