import chai from 'chai';
import chaiHttp from 'chai-http';
import path from 'path';
import 'dotenv/config';
import app from '../../src/app';
import enums from '../../src/users/lib/enums';
import * as Helpers from '../../src/users/lib/utils/lib.util.helpers';
import * as Hash from '../../src/users/lib/utils/lib.util.hash';
import { receiveChargeSuccessWebHookOne, receiveChargeSuccessWebHookTwo, receiveChargeSuccessWebHookThree,
  receiveRefundSuccessWebHook, receiveRefundProcessingWebHook, receiveRefundPendingWebHook, receiveChargeSuccessWebHookOneUserTwo
} from '../payload/payload.payment';
import { receiveAddressVerificationWebhookResponse, receiveAddressVerificationWrongEventWebhookResponse, 
  receiveAddressVerificationNotVerifiedWebhookResponse } from '../payload/payload.user';

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
    it('should upload selfie for user SIX successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-selfie')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .send({
          image_url: 'https://seedfi.com'
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
          expect(res.body.data.tier).to.equal(0);
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
          expect(res.body.data.tier).to.equal(0);
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
    it('should throw error when bvn is more than 11 digits', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          bvn: '2349965439490'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('bvn length must be 11 characters long');
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
          expect(res.body.data.tier).to.equal(0);
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
    it('Should send a verify otp email', (done) => {
      chai.request(app)
        .post('/api/v1/user/request-email-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN}`
        })
        .send({
          email: process.env.SEEDFI_USER_FOUR_EMAIL
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_EMAIL_VERIFICATION);
          process.env.SEEDFI_USER_FOUR_VERIFY_EMAIL_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should send a verify otp email', (done) => {
      chai.request(app)
        .post('/api/v1/user/request-email-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN}`
        })
        .send({
          email: process.env.SEEDFI_USER_THREE_EMAIL
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_EMAIL_VERIFICATION);
          process.env.SEEDFI_USER_THREE_VERIFY_EMAIL_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should send a verify otp email', (done) => {
      chai.request(app)
        .post('/api/v1/user/request-email-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .send({
          email: process.env.SEEDFI_USER_SIX_EMAIL
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_EMAIL_VERIFICATION);
          process.env.SEEDFI_USER_SIX_VERIFY_EMAIL_OTP = res.body.data.otp;
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
    it('Should successfully verify user email', (done) => {
      chai.request(app)
        .get('/api/v1/user/verify-email')
        .query({
          verifyValue: process.env.SEEDFI_USER_FOUR_VERIFY_EMAIL_OTP
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
    it('Should successfully verify user email', (done) => {
      chai.request(app)
        .get('/api/v1/user/verify-email')
        .query({
          verifyValue: process.env.SEEDFI_USER_THREE_VERIFY_EMAIL_OTP
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
    it('Should successfully verify user email', (done) => {
      chai.request(app)
        .get('/api/v1/user/verify-email')
        .query({
          verifyValue: process.env.SEEDFI_USER_SIX_VERIFY_EMAIL_OTP
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
  describe('verify valid id upload', () => {
    it('should verify user two id successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/id-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          id_type: 'ninm',
          card_number: '3e344e5rtft7tfgfuuu87',
          image_url: 'https:local:3r45dfghjiuytfb.png',
          verification_url: 'https:local:3r45dfghjiuytfbshjks.com',
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
          expect(res.body.data.tier).to.equal(1);
          done();
        });
    });
    it('should verify user one id successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/id-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          id_type: 'ninm',
          card_number: '3e344e5rtft7tfgfuu',
          image_url: 'https:local:3r45dfghjiuytfbjkdl.png',
          verification_url: 'https:local:3r45dfghjiuytfb.com',
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
          expect(res.body.data.tier).to.equal(1);
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
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
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
  describe('fetch list of available banks', () => {
    it('should fetch list of banks successfully', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/list-banks')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          expect(res.body.message).to.equal('Banks retrieved');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/list-banks')
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
  });
  describe('get account name enquiry', () => {
    it('should resolve account number', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/resolve-account-number')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          account_number: '0030878578',
          bank_code: '058'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal('Account number resolved');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/resolve-account-number')
        .query({
          account_number: '0989002356',
          bank_code: '058'
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
    it('Should return error if account number not sent', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/resolve-account-number')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          bank_code: '058'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('account_number is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if bank code not sent', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/resolve-account-number')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          account_number: '0989002356'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('bank_code is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('save bank account details', () => {
    it('should save account details for user one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          bank_name: 'GT Bank',
          account_number: '0030878578',
          bank_code: '058'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_SAVED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('account_number');
          expect(res.body.data).to.have.property('is_default');
          expect(res.body.data.is_default).to.equal(false);
          process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_ONE = res.body.data.id;
          done();
        });
    });
    it('should save another account details for user one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          bank_name: 'Access Bank',
          account_number: '3009238900',
          bank_code: '044'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_SAVED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('account_number');
          expect(res.body.data).to.have.property('is_default');
          expect(res.body.data.is_default).to.equal(false);
          process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_TWO = res.body.data.id;
          done();
        });
    });
    it('should save another account details for user one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          bank_name: 'Kuda Bank',
          account_number: '4000894321',
          bank_code: '044'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_SAVED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('account_number');
          expect(res.body.data).to.have.property('is_default');
          expect(res.body.data.is_default).to.equal(false);
          process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_THREE = res.body.data.id;
          done();
        });
    });
    it('should save account details for user two successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          bank_name: 'GT Bank',
          account_number: '4030873978',
          bank_code: '058'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_SAVED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('account_number');
          expect(res.body.data).to.have.property('is_default');
          expect(res.body.data.is_default).to.equal(false);
          process.env.SEEDFI_USER_TWO_BANK_ACCOUNT_ID_ONE = res.body.data.id;
          done();
        });
    });
    it('should save another account details for user two successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          bank_name: 'Access Bank',
          account_number: '1909232000',
          bank_code: '044'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_SAVED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('account_number');
          expect(res.body.data).to.have.property('is_default');
          expect(res.body.data.is_default).to.equal(false);
          process.env.SEEDFI_USER_TWO_BANK_ACCOUNT_ID_TWO = res.body.data.id;
          done();
        });
    });
    it('Should return error if user one tries to save more than three account numbers', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          bank_name: 'Access Bank',
          account_number: '3000204333',
          bank_code: '058'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNTS_LIMITS_REACHED);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .send({
          bank_name: 'Access Bank',
          account_number: '0989002356',
          bank_code: '058'
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
    it('Should return error if account number not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          bank_name: 'Access Bank',
          bank_code: '058'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('account_number is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if bank code not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          bank_name: 'Access Bank',
          account_number: '0989002356'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('bank_code is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if bank name not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          account_number: '0989002356',
          bank_code: '058'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('bank_name is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if user has not completed profile', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .send({
          bank_name: 'GT Bank',
          account_number: '0030878578',
          bank_code: '058'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.KYC_NOT_PREVIOUSLY_COMPLETED);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if account is to be saved again', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          bank_name: 'GT Bank',
          account_number: '0030878578',
          bank_code: '058'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_DETAILS_PREVIOUSLY_SAVED);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('fetch list of users saved account details', () => {
    it('should fetch list of users saved account details successfully', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNTS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should fetch list of users saved account details successfully', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNTS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/account-details')
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
  });
  describe('update bank account details default and disbursement', () => {
    it('should set user one bank account one as default account', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_ONE}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'default'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_CHOICE_UPDATED_SUCCESSFULLY('default'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('account_number');
          expect(res.body.data).to.have.property('is_default');
          expect(res.body.data.is_default).to.equal(true);
          done();
        });
    });
    it('should set user one bank account two as disbursement account', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_TWO}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'disbursement'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_CHOICE_UPDATED_SUCCESSFULLY('disbursement'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('account_number');
          expect(res.body.data).to.have.property('is_disbursement_account');
          expect(res.body.data.is_disbursement_account).to.equal(true);
          done();
        });
    });
    it('Should return error if query type not sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_TWO}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
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
    it('Should return error if invalid query type is sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_TWO}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({ 
          type: 'moving'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('type must be one of [disbursement, default]');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should set user two bank account one as default account', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_TWO_BANK_ACCOUNT_ID_ONE}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          type: 'default'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_CHOICE_UPDATED_SUCCESSFULLY('default'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('account_number');
          expect(res.body.data).to.have.property('is_default');
          expect(res.body.data.is_default).to.equal(true);
          done();
        });
    });
    it('should set user two bank account two as disbursement account', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_TWO_BANK_ACCOUNT_ID_TWO}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          type: 'disbursement'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_CHOICE_UPDATED_SUCCESSFULLY('disbursement'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('account_number');
          expect(res.body.data).to.have.property('is_disbursement_account');
          expect(res.body.data.is_disbursement_account).to.equal(true);
          done();
        });
    });
    it('Should return error if user is not the owner of account', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_TWO}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .query({
          type: 'default'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_DETAILS_NOT_USERS);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid account id is sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_TWO}2/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'default'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_DETAILS_NOT_EXISTING);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if account is default and type sent is default', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_ONE}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'default'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_ALREADY_DEFAULT_ACCOUNT);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if account is disbursement account and type sent is disbursement', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_TWO}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'disbursement'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_ALREADY_DISBURSEMENT_ACCOUNT);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('delete bank account details default and disbursement', () => {
    it('should delete user one bank account three', (done) => {
      chai.request(app)
        .delete(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_THREE}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_DELETED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.equal(0);
          done();
        });
    });
    it('Should return error if user is not the owner of account', (done) => {
      chai.request(app)
        .delete(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_TWO}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .query({
          type: 'default'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_DETAILS_NOT_USERS);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid account id is sent', (done) => {
      chai.request(app)
        .delete(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_TWO}2/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'default'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_DETAILS_NOT_EXISTING);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Fetch user own profile', () => {
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
          expect(res.body.data).to.have.property('employmentDetails');
          expect(res.body.data).to.have.property('nextOfKin');
          expect(res.body.data).to.have.property('addressDetails');
          expect(res.body.data).to.have.property('userProfileDetails');
          expect(res.body.data.userProfileDetails.user_id).to.equal(process.env.SEEDFI_USER_ONE_USER_ID);
          expect(res.body.data.userProfileDetails.loan_status).to.equal('inactive');
          expect(res.body.data.userProfileDetails.email).to.equal('victory@enyata.com');
          done();
        });
    });
  });
  describe('initiate card tokenization', () => {
    it('should initiate card tokenization successfully', (done) => {
      chai.request(app)
        .get('/api/v1/payment/initiate-card-tokenization')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal('Authorization URL created');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_ONE_CARD_TOKENIZATION_PAYMENT_REFERENCE_ONE = res.body.data.reference;
          done();
        });
    });
    it('should initiate card tokenization successfully', (done) => {
      chai.request(app)
        .get('/api/v1/payment/initiate-card-tokenization')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal('Authorization URL created');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_ONE_CARD_TOKENIZATION_PAYMENT_REFERENCE_TWO = res.body.data.reference;
          done();
        });
    });
    it('should initiate card tokenization successfully', (done) => {
      chai.request(app)
        .get('/api/v1/payment/initiate-card-tokenization')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal('Authorization URL created');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_ONE_CARD_TOKENIZATION_PAYMENT_REFERENCE_THREE = res.body.data.reference;
          done();
        });
    });
    it('should initiate card tokenization successfully for user 2', (done) => {
      chai.request(app)
        .get('/api/v1/payment/initiate-card-tokenization')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal('Authorization URL created');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_TWO_CARD_TOKENIZATION_PAYMENT_REFERENCE_ONE = res.body.data.reference;
          done();
        });
    });
    it('should successfully process card payment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookOne(process.env.SEEDFI_USER_ONE_CARD_TOKENIZATION_PAYMENT_REFERENCE_ONE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should successfully process card payment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookOneUserTwo(process.env.SEEDFI_USER_TWO_CARD_TOKENIZATION_PAYMENT_REFERENCE_ONE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should successfully process card payment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookThree(process.env.SEEDFI_USER_ONE_CARD_TOKENIZATION_PAYMENT_REFERENCE_THREE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should successfully process card payment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookTwo(process.env.SEEDFI_USER_ONE_CARD_TOKENIZATION_PAYMENT_REFERENCE_TWO))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should throw error if user has two tokenization cards', (done) => {
      chai.request(app)
        .get('/api/v1/payment/initiate-card-tokenization')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.DEBIT_CARDS_LIMITS_REACHED);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get('/api/v1/payment/initiate-card-tokenization')
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
  });
  describe('process paystack webhook to record transaction status and refund', () => {
    it('should throw error if transaction status has been previously updated', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookOne(process.env.SEEDFI_USER_ONE_CARD_TOKENIZATION_PAYMENT_REFERENCE_ONE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.PAYMENT_EARLIER_RECORDED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if transaction is not found in the DB', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookOne('64i980-hjkhjnsgd-786934uj-yuiu'))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.PAYMENT_RECORD_NOT_FOUND);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('process paystack webhook to record refund', () => {
    it('should successfully process card payment refund successful for transaction one', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveRefundSuccessWebHook(process.env.SEEDFI_USER_ONE_CARD_TOKENIZATION_PAYMENT_REFERENCE_ONE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REFUND_STATUS_SAVED('processed'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should successfully process card payment refund pending for transaction two', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveRefundPendingWebHook(process.env.SEEDFI_USER_ONE_CARD_TOKENIZATION_PAYMENT_REFERENCE_TWO))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REFUND_STATUS_SAVED('pending'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should successfully process card payment refund processing for transaction two', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveRefundProcessingWebHook(process.env.SEEDFI_USER_ONE_CARD_TOKENIZATION_PAYMENT_REFERENCE_TWO))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REFUND_STATUS_SAVED('pending'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should successfully process card payment refund successful for transaction two', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveRefundSuccessWebHook(process.env.SEEDFI_USER_ONE_CARD_TOKENIZATION_PAYMENT_REFERENCE_TWO))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REFUND_STATUS_SAVED('processed'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should throw error for when refund initiated transaction not found', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveRefundSuccessWebHook('565786-yukiy-4567-ytyu67-tyu6'))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.PAYMENT_RECORD_NOT_FOUND);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('fetch list of users saved debit cards', () => {
    it('should fetch list of users saved debit cards successfully', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/debit-cards')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          expect(res.body.message).to.equal(enums.DEBIT_CARDS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_ONE_DEBIT_CARD_ONE_ID = res.body.data[0].id;
          process.env.SEEDFI_USER_ONE_DEBIT_CARD_TWO_ID = res.body.data[1].id;
          done();
        });
    });
    it('should fetch list of users saved debit cards successfully', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/debit-cards')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          expect(res.body.message).to.equal(enums.DEBIT_CARDS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_TWO_DEBIT_CARD_ONE_ID = res.body.data[0].id;
          done();
        });
    });
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get('/api/v1/user/settings/debit-cards')
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
  });
  describe('Add employment details', () => {
    it('Should successfully create user one employment details', (done) => {
      chai.request(app)
        .post('/api/v1/user/employment-details')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          employment_type: 'retired',
          monthly_income: '500000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EMPLOYMENT_DETAILS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should successfully create user two employment details', (done) => {
      chai.request(app)
        .post('/api/v1/user/employment-details')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          employment_type: 'employed',
          company_name: 'may ltd',
          monthly_income: '600000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EMPLOYMENT_DETAILS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });

    it('Should successfully create user four employment details', (done) => {
      chai.request(app)
        .post('/api/v1/user/employment-details')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN}`
        })
        .send({
          employment_type: 'employed',
          company_name: 'may ltd',
          monthly_income: '500000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EMPLOYMENT_DETAILS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should successfully create user five employment details', (done) => {
      chai.request(app)
        .post('/api/v1/user/employment-details')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .send({
          employment_type: 'unemployed',
          monthly_income: '500000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EMPLOYMENT_DETAILS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should flag if user five try creating employment details again', (done) => {
      chai.request(app)
        .post('/api/v1/user/employment-details')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .send({
          employment_type: 'unemployed',
          monthly_income: '500000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EMPLOYMENT_TYPE_ALREADY_EXIST);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should successfully create user six employment details', (done) => {
      chai.request(app)
        .post('/api/v1/user/employment-details')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .send({
          employment_type: 'employed',
          company_name: 'may ltd',
          monthly_income: '500000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EMPLOYMENT_DETAILS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('update user mono account id', () => {
    it('should update the fcm-token of user one successfully', (done) => {
      chai.request(app)
        .patch('/api/v1/user/mono-account-id')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          mono_account_code: Hash.generateRandomString(5)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('mono_account_id');
          expect(res.body.data.user_id).to.equal(process.env.SEEDFI_USER_ONE_USER_ID);
          expect(res.body.message).to.equal(enums.UPDATE_USER_MONO_ID);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.is_default).to.equal(true);
          done();
        });
    });
    it('should throw error when fcm token is not sent for user one', (done) => {
      chai.request(app)
        .patch('/api/v1/user/mono-account-id')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('mono_account_code is required');
          done();
        });
    });
    it('should update the fcm-token of user two successfully', (done) => {
      chai.request(app)
        .patch('/api/v1/user/mono-account-id')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          mono_account_code: Hash.generateRandomString(5)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('mono_account_id');
          expect(res.body.data.user_id).to.equal(process.env.SEEDFI_USER_TWO_USER_ID);
          expect(res.body.message).to.equal(enums.UPDATE_USER_MONO_ID);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.is_default).to.equal(true);
          done();
        });
    });
  });
  describe('Add address details for verification', () => {
    it('Should successfully create user one address details', (done) => {
      chai.request(app)
        .post('/api/v1/user/address-verification')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          house_number: '18',
          landmark: 'Bovas Filling station',
          street: 'Bombay Drive',
          city: 'Akure',
          state: 'Ondo' ,
          lga: 'Ose',
          resident_type: 'rented',
          rent_amount: '300000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_ADDRESS_UPDATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_verified_utility_bill');
          expect(res.body.data).to.have.property('you_verify_candidate_id');
          expect(res.body.data.is_editable).to.equal(false);
          process.env.SEEDFI_USER_ONE_YOU_VERIFY_CANDIDATE_ID = res.body.data.you_verify_candidate_id;
          done();
        });
    });
    it('Should successfully create user two address details', (done) => {
      chai.request(app)
        .post('/api/v1/user/address-verification')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          house_number: '2',
          landmark: 'Enyata avenue',
          street: 'Cannon road',
          city: 'Mushin',
          state: 'Lagos' ,
          lga: 'Mushin',
          resident_type: 'owned'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_ADDRESS_UPDATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_verified_utility_bill');
          expect(res.body.data).to.have.property('you_verify_candidate_id');
          expect(res.body.data.is_editable).to.equal(false);
          process.env.SEEDFI_USER_TWO_YOU_VERIFY_CANDIDATE_ID = res.body.data.you_verify_candidate_id;
          done();
        });
    });
    it('Should flag if user five try creating address information', (done) => {
      chai.request(app)
        .post('/api/v1/user/address-verification')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .send({
          house_number: '14',
          landmark: 'Microsoft lane',
          street: 'Google road',
          city: 'Apple',
          state: 'Ogun' ,
          lga: 'Abeokuta south',
          resident_type: 'company provided',
          rent_amount: '100000'
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
    it('Should flag if user four try creating address information', (done) => {
      chai.request(app)
        .post('/api/v1/user/address-verification')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN}`
        })
        .send({
          house_number: '14',
          landmark: 'Microsoft lane',
          street: 'Google road',
          city: 'Apple',
          state: 'Ogun' ,
          lga: 'Abeokuta south',
          resident_type: 'company provided',
          rent_amount: '100000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.SELFIE_IMAGE_NOT_PREVIOUSLY_UPLOADED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag if user three try creating address information', (done) => {
      chai.request(app)
        .post('/api/v1/user/address-verification')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          house_number: '14',
          landmark: 'Microsoft lane',
          street: 'Google road',
          city: 'Apple',
          state: 'Ogun' ,
          lga: 'Abeokuta south',
          resident_type: 'company provided',
          rent_amount: '100000'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_VALID_ID_NOT_UPLOADED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('process youVerify webhook to record address verification status', () => {
    it('should throw error if wrong webhook event sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/address-verification-webhook')
        .send(receiveAddressVerificationWrongEventWebhookResponse(process.env.SEEDFI_USER_ONE_YOU_VERIFY_CANDIDATE_ID))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.INVALID_YOU_VERIFY_WEBHOOK_EVENT);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if invalid candidate id is sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/address-verification-webhook')
        .send(receiveAddressVerificationWebhookResponse(`${process.env.SEEDFI_USER_TWO_YOU_VERIFY_CANDIDATE_ID}T7YT76`))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.NON_EXISTING_USER_CANDIDATE_ID_SENT);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should successfully verify user one address', (done) => {
      chai.request(app)
        .post('/api/v1/user/address-verification-webhook')
        .send(receiveAddressVerificationWebhookResponse(process.env.SEEDFI_USER_ONE_YOU_VERIFY_CANDIDATE_ID))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_ADDRESS_VERIFICATION_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if user address previously verified', (done) => {
      chai.request(app)
        .post('/api/v1/user/address-verification-webhook')
        .send(receiveAddressVerificationWebhookResponse(process.env.SEEDFI_USER_ONE_YOU_VERIFY_CANDIDATE_ID))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CONFLICT);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_ADDRESS_PREVIOUSLY_VERIFIED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should successfully un-verify user two address', (done) => {
      chai.request(app)
        .post('/api/v1/user/address-verification-webhook')
        .send(receiveAddressVerificationNotVerifiedWebhookResponse(process.env.SEEDFI_USER_TWO_YOU_VERIFY_CANDIDATE_ID))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_ADDRESS_VERIFICATION_FAILED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('Upload utility bill for user', () => {
    it('Should upload utility bill successfully for user one', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-utility-bill')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../files/signature.png'))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_UTILITY_BILL_UPDATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('Should upload utility bill successfully for user two', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-utility-bill')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../files/signature.png'))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_UTILITY_BILL_UPDATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('Should flag if user five try uploading utility bill', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-utility-bill')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../files/signature.png'))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.KYC_NOT_PREVIOUSLY_COMPLETED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag if user four try uploading utility bill', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-utility-bill')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../files/signature.png'))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.SELFIE_IMAGE_NOT_PREVIOUSLY_UPLOADED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag if user three try uploading utility bill', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-utility-bill')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../files/signature.png'))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_VALID_ID_NOT_UPLOADED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('update user profile', () => {
    it('should update user five profile successfully', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'Rashidat',
          last_name: 'sikiru',
          marital_status: 'married',
          number_of_children: '3'
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

    it('should update user two profile successfully', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          marital_status: 'single',
          number_of_children: '4'
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
    it('should update user four profile successfully', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN}`
        })
        .send({
          marital_status: 'married',
          number_of_children: '1'
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
    it('should update user six profile successfully', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .send({
          marital_status: 'married',
          number_of_children: '4'
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
    it('Should throw error if user tries to update marital status or number of children in less than 3 months', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'Oreoluwa',
          number_of_children: 7,
          marital_status: 'married'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_PROFILE_NEXT_UPDATE('profile'));
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if invalid token is set', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
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
        .put('/api/v1/user/profile')
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
        .put('/api/v1/user/profile')
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
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'Oreoluwa',
          number_of_children: 7,
          marital_status: 'single'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.DETAILS_CAN_NOT_BE_UPDATED);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('create pin', () => {
    it('Should create user two pin.', (done) => {
      chai.request(app)
        .post('/api/v1/auth/pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          pin: '0908'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CREATE_PIN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });

    it('Should create user six pin.', (done) => {
      chai.request(app)
        .post('/api/v1/auth/pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .send({
          pin: '0908'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CREATE_PIN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });

    it('Should flag if user two already created pin.', (done) => {
      chai.request(app)
        .post('/api/v1/auth/pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          pin: '0908'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ALREADY_CREATED('pin'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should create user one pin.', (done) => {
      chai.request(app)
        .post('/api/v1/auth/pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          pin: '0908'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CREATE_PIN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('Change pin', () => {
    it('Should flag if character is greater or less than four', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          oldPin: '0908',
          newPin: '09554'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('newPin length must be 4 characters long');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should successfully change pin', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          oldPin: '0908',
          newPin: '2020'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CHANGE_PIN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should flag if pin is invalid', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          oldPin: '0918',
          newPin: '2020'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.VALIDATE_PASSWORD_OR_PIN('pin'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag if user try changing pin to already existing pin.', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          oldPin: '2020',
          newPin: '2020'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.IS_VALID_CREDENTIALS('pin'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    describe('Confirm pin', () => {
      it('Should successfully confirm pin', (done) => {
        chai.request(app)
          .post('/api/v1/auth/confirm-pin')
          .set({
            Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
          })
          .send({
            pin: '2020'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal('User pin confirmed successfully.');
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should flag when set wrong pin', (done) => {
        chai.request(app)
          .post('/api/v1/auth/confirm-pin')
          .set({
            Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
          })
          .send({
            pin: '2090'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.INVALID_PIN);
            expect(res.body.status).to.equal(enums.ERROR_STATUS);
            done();
          });
      });
    });
  });
  describe('set user default card', () => {
    it('Should set user default card.', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_TWO_ID}/default-debit-card`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal('Successfully sets card as default');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.id).to.equal(3);
          expect(res.body.data.user_id).to.equal(process.env.SEEDFI_USER_ONE_USER_ID);
          expect(res.body.data.is_default).to.equal(true);
          done();
        });
    });
    it('Should throw error if invalid token is set.', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_TWO_ID}/default-debit-card`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}hgjhfjhf`
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
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_TWO_ID}/default-debit-card`)
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
    it('Should throw error if token is not sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_TWO_ID}/default-debit-card`)
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
    it('Should throw error if card does not exist', (done) => {
      chai.request(app)
        .patch('/api/v1/user/settings/5000/default-debit-card')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CARD_DOES_NOT_EXIST);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if card does not belong to user', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_TWO_ID}/default-debit-card`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CARD_DOES_NOT_BELONG_TO_USER);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  
  });
  describe('remove saved debit card', () => {
    it('Should remove a saved debit card.', (done) => {
      chai.request(app)
        .delete(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_TWO_ID}/debit-card`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal(enums.CARD_REMOVED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should throw error if invalid token is set.', (done) => {
      chai.request(app)
        .delete(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_TWO_ID}/debit-card`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}hgjhfjhf`
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
    it('Should throw error if card does not exist', (done) => {
      chai.request(app)
        .delete('/api/v1/user/settings/1000/debit-card')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CARD_DOES_NOT_EXIST);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if token is malformed', (done) => {
      chai.request(app)
        .delete(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_TWO_ID}/debit-card`)
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
    it('Should throw error if token is not sent', (done) => {
      chai.request(app)
        .delete(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_TWO_ID}/debit-card`)
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
    it('Should throw error if card does not belong to user', (done) => {
      chai.request(app)
        .delete(`/api/v1/user/settings/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_ONE_ID}/debit-card`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CARD_DOES_NOT_BELONG_TO_USER);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Forgot pin', () => {
    it('Should send a reset password sms', (done) => {
      chai.request(app)
        .post('/api/v1/auth/forgot-pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.FORGOT_PIN_TOKEN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_SIX_FORGOT_PIN_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should flag when user sent invalid signature', (done) => {
      chai.request(app)
        .post('/api/v1/auth/forgot-pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}0`
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
  });
  describe('Verify reset pin token', () => {
    it('Should return error if otp is wrong', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-reset-pin-token')
        .send({
          otp: '162611'
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
        .post('/api/v1/auth/verify-reset-pin-token')
        .send({
          otp: ''
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
    it('Should successfully verify and generate reset pin token', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-reset-pin-token')
        .send({
          otp: process.env.SEEDFI_USER_SIX_FORGOT_PIN_OTP
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.GENERATE_RESET_PASSWORD_TOKEN('pin'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_SIX_RESET_PIN_TOKEN = res.body.data.token;
          done();
        });
    });
  });
  describe('Reset pin', () => {
    it('Should throw error if any of the fields are empty', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/reset-pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_RESET_PIN_TOKEN}`
        })
        .send({})
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('pin is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if invalid otp is sent', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/reset-pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_RESET_PIN_TOKEN}0op`
        })
        .send({
          pin: '0986'
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
    it('Should throw error if token is malformed', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/reset-pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${'fghjkejcxdrtyujk,mnbvcfghjkghjjhgfdfghjkmn'}0op`
        })
        .send({
          pin: '0909'
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
    it('Should throw error if length of otp is less than six', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/reset-pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_RESET_PIN_TOKEN}`
        })
        .send({
          pin: '989'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('pin length must be 4 characters long');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if no token is sent.', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/reset-pin')
        .send({
          pin: '0987'
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
    it('Should successfully reset user pin', (done) => {
      chai.request(app)
        .patch('/api/v1/auth/reset-pin')
        .set({
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_RESET_PIN_TOKEN}`
        })
        .send({
          pin: '0909'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Pin reset successful');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('Update notification is read status', () => {
    it('Should throw error if invalid token is sent', (done) => {
      chai.request(app)
        .patch('/api/v1/user/1679127933280/notification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}thfsfydue`
        })
        .send({
          type: 'regular'
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
    it('Should throw error if type is not sent', (done) => {
      chai.request(app)
        .patch('/api/v1/user/1679127933280/notification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({})
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
    it('Should throw error if invalid type is sent', (done) => {
      chai.request(app)
        .patch('/api/v1/user/1679127933280/notification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          type: 'decision'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('type must be one of [regular, voting]');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if extra data is sent with type regular', (done) => {
      chai.request(app)
        .patch('/api/v1/user/1679127933280/notification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          type: 'regular',
          extra_data: {
            voting_ticket_id: 'cluster-ticket-7373d42ec56611edb79f670e01e43575',
            decision: 'yes'
          }
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('extra_data is not allowed');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if extra data is not sent with type voting', (done) => {
      chai.request(app)
        .patch('/api/v1/user/1679127933280/notification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          type: 'voting'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('extra_data is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should update regular notification is read', (done) => {
      chai.request(app)
        .patch('/api/v1/user/1679127933280/notification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          type: 'regular'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.NOTIFICATION_UPDATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should update voting notification is read', (done) => {
      chai.request(app)
        .patch('/api/v1/user/9379127956281/notification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          type: 'voting',
          extra_data: {
            voting_ticket_id: 'cluster-ticket-7373d42ec56611edb79f670e01e43575',
            decision: 'yes'
          }
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.NOTIFICATION_UPDATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('Create next of kin', () => {
    it('Should throw error if invalid token is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/next-of-kin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}thfsfydue`
        })
        .send({})
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
    it('Should throw error if first name is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/next-of-kin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({})
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('first_name is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if last name is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/next-of-kin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'sadiq'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('last_name is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if phone number is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/next-of-kin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'sadiq',
          last_name: 'ayoola'
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
    it('Should throw error if invalid phone number is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/next-of-kin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'sadiq',
          last_name: 'ayoola',
          phone_number: '0827364558498'
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
    it('Should throw error if email is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/next-of-kin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'sadiq',
          last_name: 'ayoola',
          phone_number: '+23465767947564'
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
    it('Should throw error if invalid email is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/next-of-kin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'sadiq',
          last_name: 'ayoola',
          phone_number: '+23465767947564',
          email: 'sadiq'
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
    it('Should throw error if kind of relationship is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/user/next-of-kin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'sadiq',
          last_name: 'ayoola',
          phone_number: '+23465767947564',
          email: 'sadiq@gmail.com'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('kind_of_relationship is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    
    it('Should create user one next of kin successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/next-of-kin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'sadiq',
          last_name: 'ayoade',
          phone_number: '+23467876544545',
          email: 'ayoade@gmail.com',
          kind_of_relationship: 'brother'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('id');
          expect(res.body.data).to.have.property('user_id');
          expect(res.body.message).to.equal('Next of kin created successfully');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should create user two next of kin successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/next-of-kin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'Abubakar',
          last_name: 'opeyemi',
          phone_number: '+23467876544565',
          email: 'opeyemi@gmail.com',
          kind_of_relationship: 'father'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('id');
          expect(res.body.data).to.have.property('user_id');
          expect(res.body.message).to.equal('Next of kin created successfully');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should throw error if user previously created next of kin', (done) => {
      chai.request(app)
        .post('/api/v1/user/next-of-kin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'sadiq',
          last_name: 'ayoola',
          phone_number: '+23465767947564',
          email: 'sadiq@gmail.com',
          kind_of_relationship: 'brother'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CANNOT_CHANGE_NEXT_OF_KIN);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Fetch user loan tier value', () => {
    it('Should throw error if no query is passed', (done) => {
      chai.request(app)
        .get('/api/v1/user/tiers')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('type is required');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if wrong type is passed', (done) => {
      chai.request(app)
        .get('/api/v1/user/tiers')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({ type: 'tier' })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('type must be one of [tier_one, tier_two]');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should fetch tier one loan value', (done) => {
      chai.request(app)
        .get('/api/v1/user/tiers')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({ type: 'tier_one' })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.FETCH_LOAN_VALUE);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch tier two loan value', (done) => {
      chai.request(app)
        .get('/api/v1/user/tiers')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({ type: 'tier_two' })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.FETCH_LOAN_VALUE);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
});
