import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../src/app';
import enums from '../../src/users/lib/enums';
import * as Helpers from '../../src/users/lib/utils/lib.util.helpers';
import * as Hash from '../../src/users/lib/utils/lib.util.hash';

const { expect } = chai;
chai.use(chaiHttp);

describe('User', () => {
  describe('update fcm-token', () => {
    it('should update the fcm-token of user one successfully', (done) => {
      chai.request(app)
        .patch('/api/v1/user/fcm-token')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          fcm_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('fcm_token');
          expect(res.body.data.user_id).to.equal(process.env.SEEDFI_USER_ONE_USER_ID);
          expect(res.body.message).to.equal(enums.USER_FCM_TOKEN_UPDATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error when fcm token is not sent for user one', (done) => {
      chai.request(app)
        .patch('/api/v1/user/fcm-token')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should update the fcm-token of user two successfully', (done) => {
      chai.request(app)
        .patch('/api/v1/user/fcm-token')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          fcm_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('fcm_token');
          expect(res.body.data.user_id).to.equal(process.env.SEEDFI_USER_TWO_USER_ID);
          expect(res.body.message).to.equal(enums.USER_FCM_TOKEN_UPDATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error when fcm token is not sent for user two', (done) => {
      chai.request(app)
        .patch('/api/v1/user/fcm-token')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('update refresh token', () => {
    it('should update the refresh token of user one successfully', (done) => {
      chai.request(app)
        .get('/api/v1/user/refresh-token')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          refreshToken: process.env.SEEDFI_USER_ONE_REFRESH_TOKEN
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('refresh_token');
          expect(res.body.data).to.have.property('token');
          expect(res.body.data.user_id).to.equal(process.env.SEEDFI_USER_ONE_USER_ID);
          expect(res.body.message).to.equal(enums.USER_REFRESH_TOKEN_UPDATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should return error if refresh token is invalid', (done) => {
      chai.request(app)
        .get('/api/v1/user/refresh-token')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          refreshToken: `${process.env.SEEDFI_USER_ONE_REFRESH_TOKEN}jdjdshgdsggfdg`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.INVALID_USER_REFRESH_TOKEN);
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should return error if refreshToken is not sent', (done) => {
      chai.request(app)
        .get('/api/v1/user/refresh-token')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('refreshToken is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Upload selfie image', () => {
    it('should upload selfie for user one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-selfie')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          image_url: 'https://enyata.com'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_SELFIE_IMAGE_UPDATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_verified_bvn');
          expect(res.body.data).to.have.property('is_completed_kyc');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_bvn).to.equal(false);
          expect(res.body.data.is_uploaded_selfie_image).to.equal(true);
          done();
        });
    });
    it('should upload selfie for user one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-selfie')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          image_url: 'https://enyata.com'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_SELFIE_IMAGE_UPDATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_verified_bvn');
          expect(res.body.data).to.have.property('is_completed_kyc');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_bvn).to.equal(false);
          expect(res.body.data.is_uploaded_selfie_image).to.equal(true);
          done();
        });
    });
    it('should throw error when image url is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-selfie')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('image_url is required');
          done();
        });
    });
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-selfie')
        .send({
          image_url: 'https://tired.com'
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
    it('should throw error when user is yet to complete kyc', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-selfie')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .send({
          image_url: 'https://tired.com'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.KYC_NOT_PREVIOUSLY_COMPLETED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error when user has previously uploaded selfie image', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-selfie')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          image_url: 'https://example.com'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.SELFIE_IMAGE_PREVIOUSLY_UPLOADED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should verify bvn for user three successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-selfie') 
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          image_url: 'https://tired.com'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_SELFIE_IMAGE_UPDATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_verified_bvn');
          expect(res.body.data).to.have.property('is_completed_kyc');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_bvn).to.equal(false);
          expect(res.body.data.is_uploaded_selfie_image).to.equal(true);
          done();
        });
    });
  });
  describe('verify bvn', () => {
    it('should verify bvn for user one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          bvn: Helpers.generateElevenDigits()
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_BVN_VERIFIED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_verified_bvn');
          expect(res.body.data).to.have.property('is_completed_kyc');
          expect(res.body.data.tier).to.equal(1);
          expect(res.body.data.is_verified_bvn).to.equal(true);
          done();
        });
    });
    it('should verify bvn for user two successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          bvn: '23499654394'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_BVN_VERIFIED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_verified_bvn');
          expect(res.body.data).to.have.property('is_completed_kyc');
          expect(res.body.data.tier).to.equal(1);
          expect(res.body.data.is_verified_bvn).to.equal(true);
          done();
        });
    });
    it('should throw error when bvn is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('bvn is required');
          done();
        });
    });
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .send({
          bvn: Helpers.generateElevenDigits()
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
    it('should throw error when user is yet to complete kyc', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .send({
          bvn: Helpers.generateElevenDigits()
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.KYC_NOT_PREVIOUSLY_COMPLETED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error when user has previously verified bvn', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          bvn: Helpers.generateElevenDigits()
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.BVN_PREVIOUSLY_VERIFIED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error when user 3 tries to use user 2 bvn', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          bvn: '23499654394'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.BVN_USED_BY_ANOTHER_USER);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should verify bvn for user three successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          bvn: Helpers.generateElevenDigits()
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_BVN_VERIFIED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_verified_bvn');
          expect(res.body.data).to.have.property('is_completed_kyc');
          expect(res.body.data.tier).to.equal(1);
          expect(res.body.data.is_verified_bvn).to.equal(true);
          done();
        });
    });
    it('should verify bvn for user SIX successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .send({
          bvn: Helpers.generateElevenDigits()
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_BVN_VERIFIED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_verified_bvn');
          expect(res.body.data).to.have.property('is_completed_kyc');
          expect(res.body.data.tier).to.equal(1);
          expect(res.body.data.is_verified_bvn).to.equal(true);
          done();
        });
    });
  });
  describe('Request email verification', () => {
    it('Should send a verify otp email', (done) => {
      chai.request(app)
        .post('/api/v1/user/request-email-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          email: process.env.SEEDFI_USER_TWO_EMAIL
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_EMAIL_VERIFICATION);
          process.env.SEEDFI_USER_TWO_VERIFY_EMAIL_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should throw error if otp is malformed', (done) => {
      chai.request(app)
        .post('/api/v1/user/request-email-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${'fghjkejcxdrtyujk,mnbvcfghjkghjjhgfdfghjkmn'}`
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
    it('Should throw error if any of the field is empty', (done) => {
      chai.request(app)
        .post('/api/v1/user/request-email-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({})
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
  });
  describe('verify email', () => {
    it('Should successfully verify user email', (done) => {
      chai.request(app)
        .get('/api/v1/user/verify-email')
        .query({
          verifyValue: process.env.SEEDFI_USER_TWO_VERIFY_EMAIL_OTP
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Email verified successfully.');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should throw error if user is already verified.', (done) => {
      chai.request(app)
        .post('/api/v1/user/request-email-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          email: process.env.SEEDFI_USER_TWO_EMAIL
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.have.equal('User email already verified.');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if otp is wrong', (done) => {
      chai.request(app)
        .get('/api/v1/user/verify-email')
        .query({
          verifyValue: '162611'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EMAIL_EITHER_VERIFIED_OR_INVALID_TOKEN);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('verify email', () => {
    it('should verify user two id successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/id-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          id_type: 'ninm',
          card_number: '3e344e5rtft7tfgfuu',
          image_url: 'https:local:3r45dfghjiuytfb',
          verification_url: 'https:local:3r45dfghjiuytfb',
          issued_date: '2023-12-4',
          expiry_date: '2021-1-4'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ID_UPLOAD_VERIFICATION);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should flag if user id already verified.', (done) => {
      chai.request(app)
        .post('/api/v1/user/id-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          id_type: 'ninm',
          card_number: '3e344e5rtft7tfgfuu',
          image_url: 'https:local:3r45dfghjiuytfb',
          verification_url: 'https:local:3r45dfghjiuytfb',
          issued_date: '2023-12-4',
          expiry_date: '2021-1-4'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CHECK_USER_ID_VERIFICATION);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should flag when nothing is sent.', (done) => {
      chai.request(app)
        .post('/api/v1/user/id-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('id_type is required');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
});

describe('update user profile', () => {
  it('should update user one profile successfully', (done) => {
    chai.request(app)
      .put('/api/v1/user/update-profile')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
      })
      .send({
        first_name: 'Rashidat',
        last_name: 'sikiru'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(enums.HTTP_OK);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('data');
        expect(res.body.message).to.equal(enums.UPDATED_USER_PROFILE_SUCCESSFULLY);
        expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
        expect(res.body.data).to.have.property('first_name');
        expect(res.body.data).to.have.property('last_name');
        done();
      });
  });
  it('should throw error if invalid token is set', (done) => {
    chai.request(app)
      .put('/api/v1/user/update-profile')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}gdhhejey`
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(enums.HTTP_UNAUTHORIZED);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal('invalid signature');
        expect(res.body.status).to.equal(enums.ERROR_STATUS);
        done();
      });
  });
  it('Should throw error if token is malformed', (done) => {
    chai.request(app)
      .put('/api/v1/user/update-profile')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${'fghjkejcxdrtyujk,mnbvcfghjkghjjhgfdfghjkmn'}`
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
  it('Should throw error if token is not set', (done) => {
    chai.request(app)
      .put('/api/v1/user/update-profile')
      .set({
        'Content-Type': 'application/json'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal('Please provide a token');
        expect(res.body.error).to.equal('UNAUTHORIZED');
        expect(res.body.status).to.equal(enums.ERROR_STATUS);
        done();
      });
  });
  it('Should throw error if bvn has been verified and first name is inserted', (done) => {
    chai.request(app)
      .put('/api/v1/user/update-profile')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
      })
      .send({
        first_name: 'Oreoluwa'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(400);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal('Details can not be updated');
        expect(res.body.error).to.equal('BAD_REQUEST');
        expect(res.body.status).to.equal(enums.ERROR_STATUS);
        done();
      });
   }); 
   it('Should get user profile.', (done) => {
    chai.request(app)
      .get('/api/v1/user/profile')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(enums.HTTP_OK);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res).to.have.property('body');
        expect(res.body.message).to.equal(enums.FETCH_USER_PROFILE);
        expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
        done();
      });
  });
});


