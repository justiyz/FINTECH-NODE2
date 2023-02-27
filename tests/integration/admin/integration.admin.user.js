import chai from 'chai';
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
            expect(res.body.data.referralCount).to.equal(1);
            expect(res.body.data).to.have.property('personalInformation');
            expect(res.body.data).to.have.property('referrals');
            expect(res.body.data.referrals).to.be.an('array');
            done();
          });
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
  describe('Activate and deactivate user', () => {
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
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_ONE_USER_ID}`)
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
    it('Should flag when user to be deactivated is already deactivated', (done) => {
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
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_CURRENT_STATUS('deactivated'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should activate user successfully', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/user/${process.env.SEEDFI_USER_FOUR_USER_ID}`)
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
    it('Should throw error if user already completed profile', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/user/${process.env.SEEDFI_USER_TWO_USER_ID}/notification`)
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
          expect(res.body.message).to.equal(enums.USER_PROFILE_PREVIOUSLY_COMPLETED);
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
});

