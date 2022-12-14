import Crypto from 'crypto';

export const generateOtp = () => Crypto.randomInt(0, 10000).toString().padStart(6, '41');

export const generateReferralCode = (size) => {
  try {
    return Crypto.randomBytes(size).toString('hex').toUpperCase();
  } catch (error) {
    return error;
  }
};
