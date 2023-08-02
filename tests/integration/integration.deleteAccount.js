import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../src/app';
import enums from '../../src/users/lib/enums';

const { expect } = chai;
chai.use(chaiHttp);

const password = 'initialPassword1%';

describe('Delete User', () => {
  describe('User deletes own account', () => {
    it('Should throw error if token is malformed', (done) => {
      chai.request(app)
        .delete('/api/v1/user/account')
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
        .delete('/api/v1/user/account')
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
    it('Should throw error if user still have an active cluster loan', (done) => {
      chai.request(app)
        .delete('/api/v1/user/account')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CANNOT_DELETE_USER_ACCOUNT('kindly complete/cancel existing cluster loans'));
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if user still have an active individual loan', (done) => {
      chai.request(app)
        .delete('/api/v1/user/account')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CANNOT_DELETE_USER_ACCOUNT('kindly complete/cancel existing individual loans'));
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if user still have active cluster membership', (done) => {
      chai.request(app)
        .delete('/api/v1/user/account')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CANNOT_DELETE_USER_ACCOUNT('kindly exit all clusters'));
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should successfully delete user account', (done) => {
      chai.request(app)
        .delete('/api/v1/user/account')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SEVEN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('is_deleted');
          expect(res.body.data).to.have.property('status');
          expect(res.body.data.is_deleted).to.equal(true);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.message).to.equal(enums.DELETE_USER_OWN_ACCOUNT);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should throw error if deleted user tries to view own profile', (done) => {
      chai.request(app)
        .get('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SEVEN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNAUTHORIZED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_STATUS('deleted, kindly contact support team'));
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if user tries to signup again with same phone number', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: process.env.SEEDFI_USER_SEVEN_PHONE_NUMBER
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_EXIST);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if user tries to login again with same phone number', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: process.env.SEEDFI_USER_SEVEN_EMAIL,
          password,
          device_token: process.env.SEEDFI_USER_SEVEN_DEVICE_TOKEN
        })
        .query({
          type: 'web'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNAUTHORIZED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_STATUS('deleted, kindly contact support team'));
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
});
