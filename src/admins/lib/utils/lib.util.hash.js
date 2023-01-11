import jwt from 'jsonwebtoken';
import config from '../../../users/config/index';

const { SEEDFI_ENCODING_AUTHENTICATION_SECRET } = config;

export const generateAdminAuthToken = (admin, permissions) => {
  try {
    const { admin_id, role_type } = admin;
    return jwt.sign({ admin_id, role_type, ...permissions }, SEEDFI_ENCODING_AUTHENTICATION_SECRET, { expiresIn: '1h' });
  } catch (error) {
    return error;
  }
};
