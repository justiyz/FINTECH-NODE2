import dayjs from 'dayjs';
import chai from 'chai';
import path from 'path';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';

const { expect } = chai;
chai.use(chaiHttp);

describe('Admin Users management', () => {
  describe('Fetch user profile details', () => {
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/profile`)
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
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/profile`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .send({
          name: 'Head ops'
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
    it('Should return error if non existing user id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}687yiu/profile`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('user'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if admin without users module read permission tries to access information', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/profile`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ADMIN_CANNOT_PERFORM_ACTION('read', 'users'));
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should fetch user profile successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/profile`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_DETAILS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('personalInformation');
          done();
        });
    });
  });
  describe('Fetch user account information details', () => {
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/account-information`)
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
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/account-information`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .send({
          name: 'Head ops'
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
    it('Should return error if non existing user id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}687yiu/account-information`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('user'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if admin without users module read permission tries to access information', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/account-information`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ADMIN_CANNOT_PERFORM_ACTION('read', 'users'));
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should fetch user account information details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/account-information`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_INFORMATION_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('userDebitCards');
          expect(res.body.data).to.have.property('userBankAccount');
          expect(res.body.data.userDebitCards).to.be.an('array');
          done();
        });
    });
  });
  describe('Activate, deactivate, suspend, blacklist and watchlist user', () => {
    it('Should flag when user id dose not exist ', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('status is required');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when user id dose not exist ', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}0`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'deactivated'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('user'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag if admin dose not have user role update permission', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .send({
          status: 'deactivated'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Admin cannot perform "update" action on users module');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag an error if user is already on an active loan', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_TWO_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'deactivated'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('User is on an active loan, action cannot be performed');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should deactivate user successfully', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_FOUR_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'deactivated'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EDIT_USER_STATUS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('Should suspend user successfully', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_FOUR_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'suspended'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EDIT_USER_STATUS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('Should blacklist user successfully', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_TWO_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'blacklisted'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EDIT_USER_STATUS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('Should blacklist user successfully', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'blacklisted'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EDIT_USER_STATUS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('Should watchlist user successfully', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_FOUR_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'watchlisted'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EDIT_USER_STATUS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('Should flag when user to be watchlisted is already watchlisted', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_FOUR_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'watchlisted'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_CURRENT_STATUS('watchlisted'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should activate user successfully', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_TWO_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'active'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.EDIT_USER_STATUS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });
  describe('Fetch users', () => {
    it('Should fetch all users', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('users');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all users with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          page: '1',
          per_page: '2'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('users');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
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
    it('Should fetch users by the user name', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          search: 'rashidat sikiru'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('users');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should throw error if export is not true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'false',
          search: 'rashidat sikiru'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('export must be [true]');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should fetch users by the user name where the query type is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          search: 'yemisi ojo'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data.users[0]).to.have.property('user_id');
          expect(res.body.data.users[0]).to.have.property('name');
          expect(res.body.data.users[0]).to.have.property('loan_status');
          expect(res.body.data.users[0]).to.have.property('status');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch users by the user name with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          search: 'rashidat sikiru',
          page: '1',
          per_page: '2'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('users');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .query({
          search: 'rashidat sikiru'
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
    it('Should filter users by the user status', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          status: 'active'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('users');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter users by the user status if query is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          status: 'active'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data.users[0]).to.have.property('user_id');
          expect(res.body.data.users[0]).to.have.property('name');
          expect(res.body.data.users[0]).to.have.property('loan_status');
          expect(res.body.data.users[0]).to.have.property('status');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter users by the user status with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          status: 'active',
          page: '1',
          per_page: '2'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .query({
          status: 'active'
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
    it('Should filter users by the loan status', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          loan_status: 'active'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('users');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter users by the user loan status if query is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          loan_status: 'active'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data.users[0]).to.have.property('user_id');
          expect(res.body.data.users[0]).to.have.property('name');
          expect(res.body.data.users[0]).to.have.property('loan_status');
          expect(res.body.data.users[0]).to.have.property('status');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter users by the loan status with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          loan_status: 'active',
          page: '1',
          per_page: '2'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .query({
          loan_status: 'active'
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
    it('Should filter users by the date they were created ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          from_date: '2023-01-13',
          to_date: '2023-01-14'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('users');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter users by the date they were created if query is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          from_date: dayjs().subtract('2', 'minutes').format('YYYY-MM-DD'),
          to_date: dayjs().format('YYYY-MM-DD')
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('users');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter users by the date they were created with pages ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          from_date: '2023-01-13',
          to_date: '2023-01-14',
          page: '1',
          per_page: '2'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('users');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .query({
          from_date: '2023-01-13',
          to_date: '2023-01-14'
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
    it('Should filter users by the date they were created and status ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          from_date: '2023-01-13',
          to_date: '2023-01-14',
          status: 'active'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('users');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .query({
          from_date: '2023-01-13',
          to_date: '2023-01-14',
          status: 'active'
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
    it('Should filter users by the date they were created and status in pages ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          from_date: '2023-01-13',
          to_date: '2023-01-14',
          status: 'active',
          page: '1',
          per_page: '2'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('users');
          expect(res.body.message).to.equal(enums.USERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if admin without users module read permission tries to access information', (done) => {
      chai.request(app)
        .get('/api/v1/admin/user/all')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ADMIN_CANNOT_PERFORM_ACTION('read', 'users'));
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Fetch user kyc detail', () => {
    it('Should flag if no id found successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}po/kyc`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(('user account does not exist'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag if admin dose not have read permission', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/kyc`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Admin cannot perform "read" action on users module');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when token is invalid', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/kyc`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}op`
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
    it('Should fetch user kyc details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/kyc`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.FETCH_USER_KYC_DETAILS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body).to.have.property('data');
          done();
        });
    });
  });
  describe('Approve/Decline User Uploaded utility bill', () => {
    it('Should flag if no id found successfully', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}po/approve-utility-bill`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          decision: 'approve'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(('user account does not exist'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag if admin dose not have update permission', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/approve-utility-bill`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'approve'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Admin cannot perform "approve" action on users module');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when decision is not sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/approve-utility-bill`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('decision is required');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when invalid decision is sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/decline-utility-bill`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          decision: 'approve'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('decision must be [decline]');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should approve user one uploaded utility bill', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/approve-utility-bill`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          decision: 'approve'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_UTILITY_BILL_DECIDED_SUCCESSFULLY('approved'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('address_image_url');
          expect(res.body.data).to.have.property('is_verified_utility_bill');
          expect(res.body.data.is_verified_utility_bill).to.equal(true);
          expect(res.body.data.can_upload_utility_bill).to.equal(false);
          done();
        });
    });
    it('Should decline user two uploaded utility bill', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_TWO_USER_ID}/decline-utility-bill`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          decision: 'decline'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_UTILITY_BILL_DECIDED_SUCCESSFULLY('declined'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('address_image_url');
          expect(res.body.data).to.have.property('is_verified_utility_bill');
          expect(res.body.data.is_verified_utility_bill).to.equal(false);
          expect(res.body.data.can_upload_utility_bill).to.equal(true);
          done();
        });
    });
    it('Should throw error coz user has not uploaded any utility bill', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_THREE_USER_ID}/decline-utility-bill`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          decision: 'decline'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_HAS_NOT_UPLOADED_UTILITY_BILL);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Admin upload file for user', () => {
    it('Should flag if no id found successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}po/upload-document`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/signature.png'))
        .field('type', 'image')
        .field('title', 'Property ownership')
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(('user account does not exist'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when document is not sent', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/upload-document`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .field('type', 'file')
        .field('title', 'Property ownership')
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.UPLOAD_DOCUMENT_VALIDATION);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when title is not sent', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/upload-document`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/signature.png'))
        .field('type', 'image')
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('title is required');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when invalid type is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/upload-document`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/signature.png'))
        .field('type', 'docs')
        .field('title', 'Property ownership')
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('type must be one of [image, file]');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when not accepted file type is sent for image upload', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/upload-document`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/BRD.pdf'))
        .field('type', 'image')
        .field('title', 'Property ownership')
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.UPLOAD_AN_IMAGE_DOCUMENT_VALIDATION);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when not accepted file type is sent for document upload', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/upload-document`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/signature.png'))
        .field('type', 'file')
        .field('title', 'Property ownership')
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.UPLOAD_PDF_DOCUMENT_VALIDATION);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should upload file for user successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/upload-document`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/signature.png'))
        .field('type', 'image')
        .field('title', 'Property ownership')
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.DOCUMENT_UPLOADED_AND_SAVED_SUCCESSFULLY_FOR_USER);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('uploaded_by');
          expect(res.body.data).to.have.property('document_title');
          done();
        });
    });
    it('Should upload another file for user successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/upload-document`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/BRD.pdf'))
        .field('type', 'file')
        .field('title', 'Proof of loan indemnity')
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.DOCUMENT_UPLOADED_AND_SAVED_SUCCESSFULLY_FOR_USER);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('uploaded_by');
          expect(res.body.data).to.have.property('document_title');
          done();
        });
    });
  });
  describe('Fetch user admin uploaded documents', () => {
    it('Should flag if no id found successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}hgiu/uploaded-documents`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(('user account does not exist'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag if admin dose not have read permission', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/uploaded-documents`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Admin cannot perform "read" action on users module');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when token is invalid', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/uploaded-documents`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}op`
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
    it('Should fetch user admin uploaded documents successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/uploaded-documents`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_USER_UPLOADED_DOCUMENTS_FETCHED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.equal(4);
          expect(res.body.data[0]).to.have.property('uploaded_by');
          expect(res.body.data[0]).to.have.property('document_url');
          expect(res.body.data[0].document_extension).to.equal('.png');
          done();
        });
    });
  });
  describe('Fetch user orr score breakdown', () => {
    it('Should flag if no id found successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}hgiu/orr-breakdown`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(('user account does not exist'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag if admin dose not have read permission', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/orr-breakdown`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Admin cannot perform "read" action on users module');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when token is invalid', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/orr-breakdown`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}op`
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
    it('Should fetch user orr score breakdown successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/orr-breakdown`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.FETCH_USER_ORR_BREAKDOWN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('object');
          expect(res.body.data).to.have.property('customer_id');
          expect(res.body.data).to.have.property('breakdown');
          expect(res.body.data).to.have.property('decision_reasons');
          expect(res.body.data.decision_reasons).to.be.an('array');
          done();
        });
    });
  });
  describe('Send user incomplete profile notification', () => {
    it('Should throw error if non existing user id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}po/notification`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          type: 'incomplete-profile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('user'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if admin dose not have create permission', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/notification`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .query({
          type: 'incomplete-profile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Admin cannot perform "create" action on users module');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if type is not sent', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/notification`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          
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
    it('Should throw error if invalid type is not sent', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/notification`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          type: 'debt'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('type must be [incomplete-profile]');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });

    it('Should send complete profile notification to user successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_FIVE_USER_ID}/notification`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          type: 'incomplete-profile'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.NOTIFICATION_SENT_TO_USER_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body).to.have.property('data');
          done();
        });
    });
  });
  describe('should fetch user cluster and cluster member details', () => {
    it('Should fetch user cluster details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/clusters`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_FETCH_CLUSTER_DETAILS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body).to.have.property('data');
          done();
        });
    });
    it('Should throw error if user dose not exist', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}0/clusters`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('user'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw when token is invalid', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/clusters`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}0p`
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
    it('Should fetch user cluster details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/cluster-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_FETCH_MEMBER_CLUSTER_DETAILS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body).to.have.property('data');
          done();
        });
    });
    it('Should throw error if user does not belong to cluster', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/cluster-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_NOT_CLUSTER_MEMBER);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if cluster dose not exist', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}p/cluster-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ADMIN_CHECK_IF_CLUSTER_EXIST);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should successfully unblack an existing user bvn', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/bvn/unblacklist-bvn/6')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal(enums.UNBLACKLIST_BVN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
});

