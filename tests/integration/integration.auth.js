import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../src/app';
import enums from '../../src/users/lib/enums';
import * as Hash from '../../src/users/lib/utils/lib.util.hash';
import { userOneProfile, userTwoProfile, userThreeProfile, userFourProfile, userSixProfile, userThreeInvalidEmailProfile, userThreeExistingEmailProfile,
  userThreeInvalidDateProfile, userSevenProfile
} from '../payload/payload.auth';

const { expect } = chai;
chai.use(chaiHttp);

const password = 'initialPassword1%';

describe('Auth', () => {
  describe('Signup', () => {
    it('Should create user one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2349058702551'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal('+2349058702551');
          process.env.SEEDFI_USER_ONE_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_ONE_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_ONE_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should create user two successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+23480290833'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal('+23480290833');
          process.env.SEEDFI_USER_TWO_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_TWO_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_TWO_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should create user three successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2349058702000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal('+2349058702000');
          process.env.SEEDFI_USER_THREE_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_THREE_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_THREE_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should create user four successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2349076354536'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal('+2349076354536');
          process.env.SEEDFI_USER_FOUR_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_FOUR_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_FOUR_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should create user five successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2347058703094'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal('+2347058703094');
          process.env.SEEDFI_USER_FIVE_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_FIVE_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_FIVE_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should create user six successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2347058703647'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal('+2347058703647');
          process.env.SEEDFI_USER_SIX_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_SIX_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_SIX_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should create user seven successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2347029703927'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal('+2347029703927');
          process.env.SEEDFI_USER_SEVEN_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_SEVEN_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_SEVEN_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should return error if invalid referral id is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2349058702000',
          referral_code: '567UJI9820'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.INVALID('referral code'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if required field missing', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          referral_code: '567UJI9820'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('phone_number is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid phone number field is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '09034562000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Phone number must contain +countryCode and extra required digits');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Resend Signup OTP', () => {
    it('Should resend signup OTP for user one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/resend-signup-otp')
        .send({
          phone_number: '+2349058702551'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.VERIFICATION_OTP_RESENT);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.user_id).to.equal(process.env.SEEDFI_USER_ONE_USER_ID);
          process.env.SEEDFI_USER_ONE_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should return error if invalid non existing phone number is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/resend-signup-otp')
        .send({
          phone_number: '+2349058702330'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('User'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if required field missing', (done) => {
      chai.request(app)
        .post('/api/v1/auth/resend-signup-otp')
        .send({
          
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('phone_number is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should signup user three again successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2349058702000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal('+2349058702000');
          process.env.SEEDFI_USER_THREE_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_THREE_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_THREE_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
  });
  describe('Verify Phone Number', () => {
    it('Should return error if user has not verified account and wants to verify new device', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-new-device')
        .send({
          otp: process.env.SEEDFI_USER_ONE_VERIFICATION_OTP,
          phone_number: process.env.SEEDFI_USER_ONE_PHONE_NUMBER,
          fcm_token: Hash.generateRandomString(20),
          device_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_PREVIOUSLY_VERIFIED);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should verify user one phone number successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: process.env.SEEDFI_USER_ONE_VERIFICATION_OTP,
          phone_number: process.env.SEEDFI_USER_ONE_PHONE_NUMBER,
          fcm_token: Hash.generateRandomString(20),
          device_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_VERIFIED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_phone_number).to.equal(true);
          expect(res.body.data.phone_number).to.equal(process.env.SEEDFI_USER_ONE_PHONE_NUMBER);
          process.env.SEEDFI_USER_ONE_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_ONE_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_ONE_REFERRAL_CODE = res.body.data.referral_code;
          process.env.SEEDFI_USER_ONE_DEVICE_TOKEN = res.body.data.device_token;
          done();
        });
    });
    it('Should verify user two phone number successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: process.env.SEEDFI_USER_TWO_VERIFICATION_OTP,
          phone_number: process.env.SEEDFI_USER_TWO_PHONE_NUMBER,
          fcm_token: Hash.generateRandomString(20),
          device_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_VERIFIED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_phone_number).to.equal(true);
          expect(res.body.data.phone_number).to.equal(process.env.SEEDFI_USER_TWO_PHONE_NUMBER);
          process.env.SEEDFI_USER_TWO_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_TWO_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_TWO_REFERRAL_CODE = res.body.data.referral_code;
          process.env.SEEDFI_USER_TWO_DEVICE_TOKEN = res.body.data.device_token;
          done();
        });
    });
    it('Should verify user three phone number successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: process.env.SEEDFI_USER_THREE_VERIFICATION_OTP,
          phone_number: process.env.SEEDFI_USER_THREE_PHONE_NUMBER,
          fcm_token: Hash.generateRandomString(20),
          device_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_VERIFIED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_phone_number).to.equal(true);
          expect(res.body.data.phone_number).to.equal(process.env.SEEDFI_USER_THREE_PHONE_NUMBER);
          process.env.SEEDFI_USER_THREE_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_THREE_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_THREE_REFERRAL_CODE = res.body.data.referral_code;
          process.env.SEEDFI_USER_THREE_DEVICE_TOKEN = res.body.data.device_token;
          done();
        });
    });
    it('Should verify user four phone number successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: process.env.SEEDFI_USER_FOUR_VERIFICATION_OTP,
          phone_number: process.env.SEEDFI_USER_FOUR_PHONE_NUMBER
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_VERIFIED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_phone_number).to.equal(true);
          expect(res.body.data.phone_number).to.equal(process.env.SEEDFI_USER_FOUR_PHONE_NUMBER);
          process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_FOUR_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_FOUR_REFERRAL_CODE = res.body.data.referral_code;
          process.env.SEEDFI_USER_FOUR_DEVICE_TOKEN = res.body.data.device_token;
          done();
        });
    });
    it('Should verify user five phone number successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: process.env.SEEDFI_USER_FIVE_VERIFICATION_OTP,
          phone_number: process.env.SEEDFI_USER_FIVE_PHONE_NUMBER,
          fcm_token: Hash.generateRandomString(20),
          device_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_VERIFIED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_phone_number).to.equal(true);
          expect(res.body.data.phone_number).to.equal(process.env.SEEDFI_USER_FIVE_PHONE_NUMBER);
          process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_FIVE_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_FIVE_REFERRAL_CODE = res.body.data.referral_code;
          process.env.SEEDFI_USER_FIVE_DEVICE_TOKEN = res.body.data.device_token;
          done();
        });
    });
    it('Should verify user six phone number successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: process.env.SEEDFI_USER_SIX_VERIFICATION_OTP,
          phone_number: process.env.SEEDFI_USER_SIX_PHONE_NUMBER,
          fcm_token: Hash.generateRandomString(20),
          device_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_VERIFIED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_phone_number).to.equal(true);
          expect(res.body.data.phone_number).to.equal(process.env.SEEDFI_USER_SIX_PHONE_NUMBER);
          process.env.SEEDFI_USER_SIX_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_SIX_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_SIX_REFERRAL_CODE = res.body.data.referral_code;
          process.env.SEEDFI_USER_SIX_DEVICE_TOKEN = res.body.data.device_token;
          done();
        });
    });
    it('Should verify user seven phone number successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: process.env.SEEDFI_USER_SEVEN_VERIFICATION_OTP,
          phone_number: process.env.SEEDFI_USER_SEVEN_PHONE_NUMBER
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_VERIFIED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_phone_number).to.equal(true);
          expect(res.body.data.phone_number).to.equal(process.env.SEEDFI_USER_SEVEN_PHONE_NUMBER);
          process.env.SEEDFI_USER_SEVEN_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_SEVEN_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_SEVEN_REFERRAL_CODE = res.body.data.referral_code;
          process.env.SEEDFI_USER_SEVEN_DEVICE_TOKEN = res.body.data.device_token;
          done();
        });
    });
    it('Should return error if invalid otp is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: '239012',
          phone_number: process.env.SEEDFI_USER_ONE_PHONE_NUMBER,
          fcm_token: Hash.generateRandomString(20),
          device_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.INVALID('OTP code'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if otp field missing', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          phone_number: process.env.SEEDFI_USER_ONE_PHONE_NUMBER,
          fcm_token: Hash.generateRandomString(20),
          device_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('otp is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if less than or more than six OTP digits is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: '2392',
          phone_number: process.env.SEEDFI_USER_ONE_PHONE_NUMBER,
          fcm_token: Hash.generateRandomString(20),
          device_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('otp length must be 6 characters long');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should signup user three again successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2349058702000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal('+2349058702000');
          process.env.SEEDFI_USER_THREE_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_THREE_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_THREE_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should resend signup OTP for user three again successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/resend-signup-otp')
        .send({
          phone_number: process.env.SEEDFI_USER_THREE_PHONE_NUMBER
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.VERIFICATION_OTP_RESENT);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.user_id).to.equal(process.env.SEEDFI_USER_THREE_USER_ID);
          process.env.SEEDFI_USER_THREE_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should verify user three phone number with resend otp successfully.', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: process.env.SEEDFI_USER_THREE_VERIFICATION_OTP,
          phone_number: process.env.SEEDFI_USER_THREE_PHONE_NUMBER,
          fcm_token: Hash.generateRandomString(20),
          device_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_VERIFIED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_phone_number).to.equal(true);
          expect(res.body.data.phone_number).to.equal(process.env.SEEDFI_USER_THREE_PHONE_NUMBER);
          process.env.SEEDFI_USER_THREE_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_THREE_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_THREE_REFERRAL_CODE = res.body.data.referral_code;
          process.env.SEEDFI_USER_THREE_DEVICE_TOKEN = res.body.data.device_token;
          done();
        });
    });
    it('Should signup user four using user one referral code successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2349076354536',
          referral_code: process.env.SEEDFI_USER_ONE_REFERRAL_CODE
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal('+2349076354536');
          process.env.SEEDFI_USER_FOUR_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_FOUR_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_FOUR_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
  });
  describe('Complete profile and create password', () => {
    it('Should complete user one profile successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          ...userOneProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_PROFILE_COMPLETED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.gender).to.equal('female');
          done();
        });
    });
    it('Should complete user two profile successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          ...userTwoProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_PROFILE_COMPLETED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.gender).to.equal('male');
          done();
        });
    });

    it('Should complete user four profile successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN}`
        })
        .send({
          ...userFourProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_PROFILE_COMPLETED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.gender).to.equal('female');
          done();
        });
    });
    it('Should complete user six profile successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .send({
          ...userSixProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_PROFILE_COMPLETED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.gender).to.equal('female');
          done();
        });
    });
    it('Should complete user seven profile successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SEVEN_ACCESS_TOKEN}`
        })
        .send({
          ...userSevenProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_PROFILE_COMPLETED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.gender).to.equal('male');
          done();
        });
    });
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .send({
          ...userThreeProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.NO_TOKEN);
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}6t7689`
        })
        .send({
          ...userThreeProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('invalid signature');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if password field is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          ...userThreeProfile
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('password is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid email field is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          ...userThreeInvalidEmailProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('email must be a valid email');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid date of birth format is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          ...userThreeInvalidDateProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('date_of_birth must be in YYYY-MM-DD format');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if existing email is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          ...userThreeExistingEmailProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(409);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_EMAIL_EXIST);
          expect(res.body.error).to.equal('CONFLICT');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should complete user three profile successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          ...userThreeProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_PROFILE_COMPLETED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.gender).to.equal('female');
          done();
        });
      it('Should return error if user already completed profile', (done) => {
        chai.request(app)
          .post('/api/v1/auth/complete-profile')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
          })
          .send({
            ...userThreeProfile,
            password
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(403);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.KYC_PREVIOUSLY_COMPLETED);
            expect(res.body.error).to.equal('FORBIDDEN');
            expect(res.body.status).to.equal(enums.ERROR_STATUS);
            done();
          });
      });
      it('Should return error if activated existing user account tries to signup again', (done) => {
        chai.request(app)
          .post('/api/v1/auth/signup')
          .send({
            phone_number: process.env.SEEDFI_USER_ONE_PHONE_NUMBER
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.ACCOUNT_EXIST);
            expect(res.body.error).to.equal('BAD_REQUEST');
            expect(res.body.status).to.equal(enums.ERROR_STATUS);
            done();
          });
      });
      it('Should return error if activated existing user account tries to request resend signup OTP', (done) => {
        chai.request(app)
          .post('/api/v1/auth/resend-signup-otp')
          .send({
            phone_number: process.env.SEEDFI_USER_ONE_PHONE_NUMBER
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(400);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.ACCOUNT_ALREADY_VERIFIED);
            expect(res.body.error).to.equal('BAD_REQUEST');
            expect(res.body.status).to.equal(enums.ERROR_STATUS);
            done();
          });
      });
    });
  });
  describe('Login', () => {
    it('Should log user one in successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userOneProfile.email,
          password,
          device_token: process.env.SEEDFI_USER_ONE_DEVICE_TOKEN
        })
        .query({
          type: 'mobile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_LOGIN_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_kyc).to.equal(true);
          process.env.SEEDFI_USER_ONE_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_ONE_REFRESH_TOKEN = res.body.data.refresh_token;
          done();
        });
    });
    it('Should log user two in successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userTwoProfile.email,
          password,
          device_token: process.env.SEEDFI_USER_TWO_DEVICE_TOKEN
        })
        .query({
          type: 'mobile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_LOGIN_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_kyc).to.equal(true);
          process.env.SEEDFI_USER_TWO_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_TWO_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_TWO_EMAIL = res.body.data.email;
          done();
        });
    });
    it('Should log user four in successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userFourProfile.email,
          password
        })
        .query({
          type: 'web'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_LOGIN_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_kyc).to.equal(true);
          process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_FOUR_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_FOUR_EMAIL = res.body.data.email;
          done();
        });
    });
    it('Should return otp for account verification when user six tries to log in on a different device', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userSixProfile.email,
          password,
          device_token: `${process.env.SEEDFI_USER_SIX_DEVICE_TOKEN}j67`
        })
        .query({
          type: 'mobile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.NEW_DEVICE_DETECTED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('otp');
          expect(res.body.data).to.have.property('expirationTime');
          process.env.SEEDFI_USER_SIX_NEW_DEVICE_LOGIN_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should verify account on new device', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-new-device')
        .send({
          otp: process.env.SEEDFI_USER_SIX_NEW_DEVICE_LOGIN_VERIFICATION_OTP,
          phone_number: process.env.SEEDFI_USER_SIX_PHONE_NUMBER,
          fcm_token: Hash.generateRandomString(20),
          device_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_VERIFIED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_phone_number).to.equal(true);
          expect(res.body.data.phone_number).to.equal(process.env.SEEDFI_USER_SIX_PHONE_NUMBER);
          process.env.SEEDFI_USER_SIX_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_SIX_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_SIX_REFERRAL_CODE = res.body.data.referral_code;
          process.env.SEEDFI_USER_SIX_DEVICE_TOKEN = res.body.data.device_token;
          done();
        });
    });
    it('Should log user six in successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userSixProfile.email,
          password,
          device_token: process.env.SEEDFI_USER_SIX_DEVICE_TOKEN
        })
        .query({
          type: 'mobile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_LOGIN_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_kyc).to.equal(true);
          process.env.SEEDFI_USER_SIX_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_SIX_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_SIX_EMAIL = res.body.data.email;
          done();
        });
    });
    it('Should log user three in successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userThreeProfile.email,
          password,
          device_token: process.env.SEEDFI_USER_THREE_DEVICE_TOKEN
        })
        .query({
          type: 'mobile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_LOGIN_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_kyc).to.equal(true);
          process.env.SEEDFI_USER_THREE_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_THREE_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_THREE_EMAIL = res.body.data.email;
          done();
        });
    });
    it('Should log user seven in successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userSevenProfile.email,
          password,
          device_token: process.env.SEEDFI_USER_SEVEN_DEVICE_TOKEN
        })
        .query({
          type: 'web'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_LOGIN_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_kyc).to.equal(true);
          process.env.SEEDFI_USER_SEVEN_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_SEVEN_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_SEVEN_EMAIL = res.body.data.email;
          done();
        });
    });
    it('Should return error if non existing email is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: `${userThreeProfile.email}.ng`,
          password
        })
        .query({
          type: 'web'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.INVALID_EMAIL_ADDRESS);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if wrong password is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userThreeProfile.email,
          password: `6748${password}`,
          device_token: process.env.SEEDFI_USER_ONE_DEVICE_TOKEN
        })
        .query({
          type: 'mobile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.INVALID_PASSWORD);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if device token is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userThreeProfile.email,
          password: password
        })
        .query({
          type: 'mobile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.DEVICE_TOKEN_REQUIRED);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if type is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userThreeProfile.email,
          password
        })
        .query({ })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('type is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid type is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userThreeProfile.email,
          password
        })
        .query({
          type: 'web interface'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('type must be one of [web, mobile]');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if email field missing', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          password: `6748${password}`
        })
        .query({
          type: 'mobile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('email is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if password field is missing', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userThreeProfile.email
        })
        .query({
          type: 'mobile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('password is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Forgot password', () => {
    it('Should send a reset password mail', (done) => {
      chai.request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: userOneProfile.email
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          process.env.SEEDFI_USER_ONE_FORGOT_PASSWORD_OTP = res.body.data.otp;
          done();
        });
    });
    it('should return error if invalid fields', done => {
      chai
        .request(app)
        .post('/api/v1/auth/forgot-password')
        .end((err, res) => {
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('code');
          expect(res.body).to.have.property('message');
          expect(res.body.message).to.equal('email is required');
          done();
        });
    });
    it('Should return error if email field is empty', (done) => {
      chai.request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: ''
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('email is not allowed to be empty');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if pass invalid email', (done) => {
      chai.request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: `${userOneProfile.email}0`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('email must be a valid email');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if email does not exist', (done) => {
      chai.request(app)
        .post('/api/v1/auth/forgot-password')
        .send({
          email: 'miracle@enyata.com'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('User'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Verify reset password token', () => {
    it('Should return error if otp is wrong', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-reset-token')
        .send({
          otp: '162611',
          email: userOneProfile.email
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Invalid OTP code');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if otp is wrong', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-reset-token')
        .send({
          otp: '',
          email: userOneProfile.email
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('otp is not allowed to be empty');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if user account does not exist', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-reset-token')
        .send({
          otp: process.env.SEEDFI_USER_ONE_FORGOT_PASSWORD_OTP,
          email: 'user@gmsil.com'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNAUTHORIZED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('User'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should successfully verify and generate reset password token', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-reset-token')
        .send({
          otp: process.env.SEEDFI_USER_ONE_FORGOT_PASSWORD_OTP,
          email: userOneProfile.email
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('password token Successfully generated');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_ONE_RESET_PASSWORD_TOKEN = res.body.data.token;
          done();
        });
    });
  });
  describe('Reset password', () => {
    it('Should throw error if any of the fields are empty', (done) => {
      chai.request(app)
        .post('/api/v1/auth/reset-password')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_RESET_PASSWORD_TOKEN}`
        })
        .send({})
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('password is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if invalid authorization is sent', (done) => {
      chai.request(app)
        .post('/api/v1/auth/reset-password')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_RESET_PASSWORD_TOKEN}0op`
        })
        .send({
          password: 'afterwardsPAssword@09'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('invalid signature');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if jwt is malformed', (done) => {
      chai.request(app)
        .post('/api/v1/auth/reset-password')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${'fghjkejcxdrtyujk,mnbvcfghjkghjjhgfdfghjkmn'}0op`
        })
        .send({
          password: 'afterwardsPAssword@0'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('jwt malformed');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if password combination does not pass', (done) => {
      chai.request(app)
        .post('/api/v1/auth/reset-password')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_RESET_PASSWORD_TOKEN}`
        })
        .send({
          password: 'ksj02'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Invalid password combination');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if no token is sent.', (done) => {
      chai.request(app)
        .post('/api/v1/auth/reset-password')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${''}`
        })
        .send({
          password: 'afterwardsPAssword@0'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Invalid/Expired Token');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should successfully reset user password', (done) => {
      chai.request(app)
        .post('/api/v1/auth/reset-password')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_RESET_PASSWORD_TOKEN}`
        })
        .send({
          password: 'userPassword1_'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Password reset successful');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('Change password', () => {
    it('Should return error if try sent with wrong field', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/password')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          password: password,
          newPassword: 'afterwardsPAssword@0'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('oldPassword is required');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if field is empty', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/password')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          oldPassword: 'afterwardsPAssword@0',
          newPassword: ''
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('newPassword is not allowed to be empty');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should successfully change password', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/password')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          oldPassword: password,
          newPassword: 'afterwardsPAssword@0'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CHANGE_PASSWORD);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should flag if password is invalid.', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/password')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          oldPassword: `${password}0`,
          newPassword: 'afterwardsPAssword@0'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.VALIDATE_PASSWORD_OR_PIN('password'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag if user try changing password to already existing password.', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/password')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          oldPassword: 'afterwardsPAssword@0',
          newPassword: 'afterwardsPAssword@0'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.IS_VALID_CREDENTIALS('password'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Confirm password', () => {
    it('Should successfully confirm password', (done) => {
      chai.request(app)
        .post('/api/v1/auth/confirm-password')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          password: 'afterwardsPAssword@0'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('User password confirmed successfully.');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should flag wrong password', (done) => {
      chai.request(app)
        .post('/api/v1/auth/confirm-password')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          password: password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Invalid email or password');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
});
