import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';
import { inviteAdmin, inviteAdminTwo } from '../../payload/payload.admin';

const { expect } = chai;
chai.use(chaiHttp);

describe('Admin', () => {
  describe('Create new admin role', () => {
    it('Should create role for underwriter successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Underwriter',
          permissions: [ 
            {
              resource_id: `${process.env.SEEDFI_ADMIN_LOAN_APPLICATION_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ROLE_CREATION_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.name).to.equal('Underwriter');
          process.env.SEEDFI_UNDERWRITER_ROLE_TYPE = res.body.data.roleCode;
          done();
        });
    });
  });
  describe('Invite admin', () => {
    it('Should throw error if an empty object is sent.', (done) => {
      chai.request(app)
        .post('/api/v1/admin/invite-admin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal('first_name is required');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error when empty string is passed.', (done) => {
      chai.request(app)
        .post('/api/v1/admin/invite-admin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          ...inviteAdmin,
          role_code: ''
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal('role_code is not allowed to be empty');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when role code dose not match', (done) => {
      chai.request(app)
        .post('/api/v1/admin/invite-admin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          ...inviteAdmin,
          role_code: 'WASH'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal(enums.VALIDATE_ROLE_CODE_NOT_EXIST);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.error).to.equal('BAD_REQUEST');
          done();
        });
    });
    it('Should flag when super admin role code is to be assigned', (done) => {
      chai.request(app)
        .post('/api/v1/admin/invite-admin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          ...inviteAdmin,
          role_code: 'SADM'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal(enums.SUPER_ADMIN_ROLE_NONASSIGNABLE);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.error).to.equal('FORBIDDEN');
          done();
        });
    });
    it('Should invite admin successfully.', (done) => {
      chai.request(app)
        .post('/api/v1/admin/invite-admin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          ...inviteAdmin,
          role_code: process.env.SEEDFI_ADMIN_ROLE_HEAD_OPS
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal(enums.ADMIN_SUCCESSFULLY_INVITED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_ADMIN_TWO_ID = res.body.data.newAdmin.admin_id;
          process.env.SEEDFI_ADMIN_TWO_EMAIL = res.body.data.newAdmin.email;
          process.env.SEEDFI_ADMIN_TWO_PASSWORD = res.body.data.password;
          done();
        });
    });
    it('Should flag if admin email already exist.', (done) => {
      chai.request(app)
        .post('/api/v1/admin/invite-admin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          ...inviteAdmin,
          role_code: process.env.SEEDFI_ADMIN_ROLE_HEAD_OPS
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CONFLICT);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal(enums.ADMIN_EMAIL_EXIST);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should log invited admin in successfully for the first time', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: process.env.SEEDFI_ADMIN_TWO_EMAIL,
          password: process.env.SEEDFI_ADMIN_TWO_PASSWORD
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOGIN_REQUEST_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('role_type');
          expect(res.body.data).to.have.property('first_name');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_profile).to.equal(false);
          process.env.SEEDFI_ADMIN_TWO_LOGIN_OTP = res.body.data.token;
          done();
        });
    });
    it('Should verify invited admin login request in successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-login')
        .send({
          otp: process.env.SEEDFI_ADMIN_TWO_LOGIN_OTP
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_LOGIN_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('role_type');
          expect(res.body.data).to.have.property('first_name');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_verified_email).to.equal(true);
          process.env.SEEDFI_ADMIN_TWO_ACCESS_TOKEN = res.body.data.token;
          done();
        });
    });
    it('Should invite admin with underwriting role code successfully.', (done) => {
      chai.request(app)
        .post('/api/v1/admin/invite-admin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          ...inviteAdminTwo,
          role_code: process.env.SEEDFI_UNDERWRITER_ROLE_TYPE
        })
        .end((err, res) => {
          process.env.SEEDFI_UNDERWRITER_ROLE_TYPE,
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal(enums.ADMIN_SUCCESSFULLY_INVITED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_ADMIN_THREE_ID = res.body.data.newAdmin.admin_id;
          process.env.SEEDFI_ADMIN_THREE_EMAIL = res.body.data.newAdmin.email;
          process.env.SEEDFI_ADMIN_THREE_PASSWORD = res.body.data.password;
          done();
        });
    });
    it('Should log invited admin with underwriting role code in successfully for the first time', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: process.env.SEEDFI_ADMIN_THREE_EMAIL,
          password: process.env.SEEDFI_ADMIN_THREE_PASSWORD
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOGIN_REQUEST_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('role_type');
          expect(res.body.data).to.have.property('first_name');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_profile).to.equal(false);
          process.env.SEEDFI_ADMIN_THREE_LOGIN_OTP = res.body.data.token;
          done();
        });
    });
    it('Should verify invited admin three login request in successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-login')
        .send({
          otp: process.env.SEEDFI_ADMIN_THREE_LOGIN_OTP
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_LOGIN_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('role_type');
          expect(res.body.data).to.have.property('first_name');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_verified_email).to.equal(true);
          process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_ADMIN_THREE_ID = res.body.data.admin_id;
          done();
        });
    });
    it('Should flag when trying to fetch admin resource with underwriter role code resources', (done) => {
      chai.request(app)
        .get('/api/v1/admin/role/admin-resources')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Admin dose not have resource action role management.');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should edit admin underwriter role permissions successfully', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/role/${process.env.SEEDFI_UNDERWRITER_ROLE_TYPE}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          permissions: [ 
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}`,
              user_permissions: [  ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions: [ 'read', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_LOAN_APPLICATION_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ROLE_MANAGEMENT_RESOURCE_ID}`,
              user_permissions: [  'approve', 'reject' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.EDIT_ROLE_DETAILS_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should log invited admin with underwriting role code again', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: process.env.SEEDFI_ADMIN_THREE_EMAIL,
          password: process.env.SEEDFI_ADMIN_THREE_PASSWORD
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOGIN_REQUEST_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('role_type');
          expect(res.body.data).to.have.property('first_name');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_profile).to.equal(false);
          process.env.SEEDFI_ADMIN_THREE_LOGIN_OTP = res.body.data.token;
          done();
        });
    });
    it('Should verify invited admin three login again successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-login')
        .send({
          otp: process.env.SEEDFI_ADMIN_THREE_LOGIN_OTP
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_LOGIN_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('role_type');
          expect(res.body.data).to.have.property('first_name');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_verified_email).to.equal(true);
          process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_ADMIN_THREE_ID = res.body.data.admin_id;
          done();
        });
    });
    it('Should flag when trying to fetch admin resource with underwriter role code resources', (done) => {
      chai.request(app)
        .get('/api/v1/admin/role/admin-resources')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Admin cannot perform "read" action on role management module');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('fetch filter and search admin', () => {
    it('should fetch all admins paginated', (done) => {
      chai.request(app)
        .get('/api/v1/admin/')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          page: 1,
          per_page: 3
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.SEARCH_FILTER_ADMINS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should fetch all admins unpaginated if query is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({ 
          export: 'true'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.SEARCH_FILTER_ADMINS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should filter admins by name if query is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({ 
          export: 'true',
          search: 'janet'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.SEARCH_FILTER_ADMINS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should filter admins by status if query is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({ 
          export: 'true',
          status: 'active'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.SEARCH_FILTER_ADMINS);
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
          export: 'false'
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
    it('Should fetch admin with the default filter value', (done) => {
      chai.request(app)
        .get('/api/v1/admin/')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.SEARCH_FILTER_ADMINS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch admin with the default filter value', (done) => {
      chai.request(app)
        .get('/api/v1/admin/')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}0p`
        })
        .send({ 
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
  describe('edit admin status', () => {
    it('Should edit admin status successfully.', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}`)
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
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.EDIT_ADMIN_STATUS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should flag if try edit updating status with the same status in the DB', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}`)
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
          expect(res.body.message).to.equal(enums.ADMIN_CURRENT_STATUS('deactivated'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when pass wrong admin id.', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}0p`)
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
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('admin'));
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when sent empty string', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}0p`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          status: ''
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('status must be one of [active, deactivated]');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should edit admin status successfully.', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}`)
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
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.EDIT_ADMIN_STATUS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('Fetch admin permissions', () => {
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}/permissions`)
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
        .get(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}/permissions`)
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
    it('Should return error if non existing admin id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}878yu76/permissions`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('admin'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if super admin code is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/${process.env.SEEDFI_SUPER_ADMIN_ID}/permissions`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACTION_NOT_ALLOWED_FOR_SUPER_ADMIN);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });

    it('Should fetch admin permissions successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}/permissions`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_PERMISSIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.role_name).to.equal('head ops');
          done();
        });
    });
  });
  describe('Edit admin permissions', () => {
    it('Should return error if non existing admin is sent', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}hfyi/permissions`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          permissions: [ 
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions: [ 'read', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_LOAN_APPLICATION_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ROLE_MANAGEMENT_RESOURCE_ID}`,
              user_permissions: [ 'read' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('admin'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if a resource id is sent more than once', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}/permissions`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          permissions: [ 
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions: [ 'read', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ROLE_MANAGEMENT_RESOURCE_ID}`,
              user_permissions: [ 'read' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('resource "administrators" is repeating more than once');
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if super admin id is sent', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/${process.env.SEEDFI_SUPER_ADMIN_ID}/permissions`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          permissions: [ 
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions: [ 'read', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_LOAN_APPLICATION_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ROLE_MANAGEMENT_RESOURCE_ID}`,
              user_permissions: [ 'read' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACTION_NOT_ALLOWED_FOR_SUPER_ADMIN);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if authenticated non super admin id is sent', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}/permissions`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_TWO_ACCESS_TOKEN}`
        })
        .send({
          permissions: [ 
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions: [ 'read', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_LOAN_APPLICATION_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ROLE_MANAGEMENT_RESOURCE_ID}`,
              user_permissions: [ 'read' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACTION_NOT_ALLOWED_FOR_SELF_ADMIN);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should edit admin role and permissions successfully', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}/permissions`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          role_code: process.env.SEEDFI_UNDERWRITER_ROLE_TYPE,
          permissions: [ 
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions: [ 'read', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_LOAN_APPLICATION_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ROLE_MANAGEMENT_RESOURCE_ID}`,
              user_permissions: [ 'read' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.EDIT_ADMIN_PERMISSIONS_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.admin_id).to.equal(process.env.SEEDFI_ADMIN_TWO_ID);
          done();
        });
    });
    it('Should throw error if invalid role_code is sent', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}/permissions`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          role_code: `${process.env.SEEDFI_ADMIN_ROLE_HEAD_OPS}UI`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.VALIDATE_ROLE_CODE_NOT_EXIST);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if super admin role_code is sent', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}/permissions`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          role_code: 'SADM'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.SUPER_ADMIN_ROLE_NONASSIGNABLE);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should edit admin role type successfully', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}/permissions`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          role_code: process.env.SEEDFI_ADMIN_ROLE_HEAD_OPS
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.EDIT_ADMIN_PERMISSIONS_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.admin_id).to.equal(process.env.SEEDFI_ADMIN_TWO_ID);
          done();
        });
    });
  });
  describe('Get Admin Profile', () => {
    it('Should get admin profile.', (done) => {
      chai.request(app)
        .get('/api/v1/admin/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal(enums.FETCH_ADMIN_PROFILE);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.role_type).to.equal('SADM');
          done();
        });
    });
    it('Should return error if to be deleted role has been assigned', (done) => {
      chai.request(app)
        .delete(`/api/v1/admin/role/${process.env.SEEDFI_ADMIN_ROLE_HEAD_OPS}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(403);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ROLE_HAS_BEEN_ASSIGNED_TO_AN_ADMIN);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should log invited admin with underwriting role code again', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: process.env.SEEDFI_ADMIN_THREE_EMAIL,
          password: process.env.SEEDFI_ADMIN_THREE_PASSWORD
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOGIN_REQUEST_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('role_type');
          expect(res.body.data).to.have.property('first_name');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_profile).to.equal(false);
          process.env.SEEDFI_ADMIN_THREE_LOGIN_OTP = res.body.data.token;
          done();
        });
    });
    it('Should verify invited admin three login again successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-login')
        .send({
          otp: process.env.SEEDFI_ADMIN_THREE_LOGIN_OTP
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_LOGIN_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('role_type');
          expect(res.body.data).to.have.property('first_name');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_verified_email).to.equal(true);
          process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_ADMIN_THREE_ID = res.body.data.admin_id;
          done();
        });
    });
  });
  describe('Blacklisted single and bulk Bvn', () => {
    it('should blacklist bulk bvn', (done) => {
      chai.request(app)
        .post('/api/v1/admin/bvn/blacklist')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          type: 'single'
        })
        .send({
          first_name: 'st',
          middle_name: 'ola',
          last_name: 'dence ',
          date_of_birth: '1954-12-08',
          bvn: '22330123231'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.BLACKLISTED_BVN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should insert bulk blacklisted bvn', (done) => {
      chai.request(app)
        .post('/api/v1/admin/bvn/blacklist')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send(
          [
            {
              first_name: 'st',
              middle_name: 'ola',
              last_name: 'dence ',
              date_of_birth: '1954-12-08',
              bvn: '22330121101'
            },
            {
              first_name: 'jacob',
              middle_name: 'michael ',
              last_name: 'tolu',
              date_of_birth: '1954-12-08',
              bvn: '2231222110'
            }
          ]
        )
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.BLACKLISTED_BVN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should remove already existing bvn for bulk upload', (done) => {
      chai.request(app)
        .post('/api/v1/admin/bvn/blacklist')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send(
          [
            {
              first_name: 'st',
              middle_name: 'ola',
              last_name: 'dence ',
              date_of_birth: '1954-12-08',
              bvn: '22330121101'
            },
            {
              first_name: 'janet',
              middle_name: 'michael ',
              last_name: 'tolu',
              date_of_birth: '1954-12-08',
              bvn: '22312110'
            }
          ]
        )
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.BLACKLISTED_BVN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data[0].first_name).to.equal('janet');
          done();
        });
    });
    it('should throw error inserting same bvn', (done) => {
      chai.request(app)
        .post('/api/v1/admin/bvn/blacklist')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send(
          [
            {
              first_name: 'st',
              middle_name: 'ola',
              last_name: 'dence ',
              date_of_birth: '1954-12-08',
              bvn: '22330121101'
            },
            {
              first_name: 'jacob',
              middle_name: 'michael ',
              last_name: 'tolu',
              date_of_birth: '1954-12-08',
              bvn: '2231222110'
            }
          ]
        )
        .end((err, res) => {
          expect(res.statusCode).to.equal(409);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.BLACKLIST_BVN_EXIST);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if try blacklisting single user bvn', (done) => {
      chai.request(app)
        .post('/api/v1/admin/bvn/blacklist')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          type: 'single'
        })
        .send({
          first_name: 'st',
          middle_name: 'ola',
          last_name: 'dence ',
          date_of_birth: '1954-12-08',
          bvn: '22330123231'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(409);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.BLACKLIST_BVN_EXIST);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });

  describe('Fetch Blacklisted Bvn', () => {
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/bvn/blacklist')
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
        .get('/api/v1/admin/bvn/blacklist')
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
    it('Should fetch blacklisted bvn', (done) => {
      chai.request(app)
        .get('/api/v1/admin/bvn/blacklist')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal(enums.BLACKLIST_BVN_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
});
 
