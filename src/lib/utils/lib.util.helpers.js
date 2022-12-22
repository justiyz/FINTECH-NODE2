import Crypto from 'crypto';

export const generateOtp = () => Crypto.randomInt(0, 1000000).toString();
export const generateReferralCode = (size) => {
  try {
    return Crypto.randomBytes(size).toString('hex').toUpperCase();
  } catch (error) {
    return error;
  }
};
