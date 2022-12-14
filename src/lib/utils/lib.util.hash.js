import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Crypto from 'crypto';
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

export const decodeToken = (token) => {
  try {
    return jwt.verify(token, SEEDFI_ENCODING_AUTHENTICATION_SECRET);
  } catch (error) {
    return error;
  }
};
