import Crypto from 'crypto';

export const generateOtp = () => Crypto.randomInt(0, 1000000).toString().padStart(6, '0');
export const generateReferralCode = (size) => {
  try {
    return Crypto.randomBytes(size).toString('hex').toUpperCase();
  } catch (error) {
    return error;
  }
};

export const generateElevenDigits = () => Crypto.randomInt(0, 10000000000).toString().padStart(11, '22');
