import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../src/app';
import enums from '../../src/lib/enums';
import * as Hash from '../../src/lib/utils/lib.util.hash';


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
  describe('verify bvn', () => {
    it('should verify bvn for user one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          bvn: Hash.generateRandomString(5)
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
          expect(res.body.data.tier).to.equal(2);
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
          bvn: Hash.generateRandomString(5)
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
          expect(res.body.data.tier).to.equal(2);
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
          bvn: Hash.generateRandomString(5)
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
          bvn: Hash.generateRandomString(5)
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
          bvn: Hash.generateRandomString(5)
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
    it('should verify bvn for user three successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          bvn: Hash.generateRandomString(5)
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
          expect(res.body.data.tier).to.equal(2);
          expect(res.body.data.is_verified_bvn).to.equal(true);
          done();
        });
    });
  });
});
