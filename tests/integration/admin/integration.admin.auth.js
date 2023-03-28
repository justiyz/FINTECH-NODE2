import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';

const { expect } = chai;
chai.use(chaiHttp);

describe('Admin Auth', () => {
  describe('Super admin Login request', () => {
    it('Should log super admin in successfully for the first time', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'dayor@enyata.com',
          password: 'Akintunde@02'
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
          process.env.SEEDFI_SUPER_ADMIN_LOGIN_OTP_ONE = res.body.data.token;
          done();
        });
    });
    it('Should return error if non existing email is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'akinpelumi@enyata.com',
          password: 'Akinpelumi89%'
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
    it('Should return error if wrong password is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'dayor@enyata.com',
          password: 'Akinpelumi89%'
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
    it('Should return error if email field missing', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/login')
        .send({
          password: 'Akinpelumi89%'
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
        .post('/api/v1/admin/auth/login')
        .send({
          email: 'dayor@enyata.com'
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
  describe('Super admin Login request verification', () => {
    it('Should verify super admin login request in successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-login')
        .send({
          otp: process.env.SEEDFI_SUPER_ADMIN_LOGIN_OTP_ONE
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
          process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_SUPER_ADMIN_ID = res.body.data.admin_id;
          done();
        });
    });
    it('Should return error if invalid otp is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-login')
        .send({
          otp: '906712'
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
        .post('/api/v1/admin/auth/verify-login')
        .send({

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
    it('Should return error if otp field is empty', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-login')
        .send({
          otp: ''
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('otp is not allowed to be empty');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if otp field is less than or greater than 6', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-login')
        .send({
          otp: '6657'
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
  });
  describe('Set first password', () => {
    it('Should return error if admin has not set password and wants to do forgot password ', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/forgot-password')
        .send({
          email: 'dayor@enyata.com'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ADMIN_NOT_SET_NEW_PASSWORD);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if admin has not set password and wants to do complete profile', (done) => {
      chai.request(app)
        .post('/api/v1/admin/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          first_name: 'Samaila',
          last_name: 'Isa',
          phone_number: '+23490877777',
          gender: 'male'       
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ADMIN_NOT_SET_NEW_PASSWORD);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should set super admin first password successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/set-first-password')
        .send({
          password: 'seedfi@Admin2'
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.PASSWORD_SET_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_profile).to.equal(false);
          expect(res.body.data.is_created_password).to.equal(true);
          done();
        });
    });
    it('Should return error if password field missing', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/set-first-password')
        .send({

        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
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
    it('Should return error if password field is empty', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/set-first-password')
        .send({
          password: ''
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('password is not allowed to be empty');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if admin has set password and wants to set again', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/set-first-password')
        .send({
          password: 'admin89@w'
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ADMIN_ALREADY_SET_NEW_PASSWORD);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Admin complete profile', () => {
    it('Should complete super admin profile successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/complete-profile')
        .send({
          first_name: 'Samaila',
          last_name: 'Isa',
          phone_number: '+23490877777',
          gender: 'male'  
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_COMPLETE_PROFILE_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_profile).to.equal(true);
          expect(res.body.data.is_verified_email).to.equal(true);
          done();
        });
    });
    it('Should return error if first name field missing', (done) => {
      chai.request(app)
        .post('/api/v1/admin/complete-profile')
        .send({
          last_name: 'Isa',
          phone_number: '+23490877777',
          gender: 'male'  
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
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
    it('Should return error if not accepted gender option is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/complete-profile')
        .send({
          first_name: 'Samaila',
          last_name: 'Isa',
          phone_number: '+23490877777',
          gender: 'rather not tell'  
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('gender must be one of [male, female]');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid phone number format is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/complete-profile')
        .send({
          first_name: 'Samaila',
          last_name: 'Isa',
          phone_number: '09034900000',
          gender: 'female'  
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
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
    it('Should return error if admin has previously completed profile and wants to again', (done) => {
      chai.request(app)
        .post('/api/v1/admin/complete-profile')
        .send({
          first_name: 'Samaila',
          last_name: 'Isa',
          phone_number: '+23490877777',
          gender: 'male'  
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ADMIN_ALREADY_COMPLETED_PROFILE);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('admin forgot password', () => {
    it('Should do forgot password successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/forgot-password')
        .send({
          email: 'dayor@enyata.com'
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.PASSWORD_TOKEN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_SUPER_ADMIN_PASSWORD_RESET_OTP = res.body.data.token;
          done();
        });
    });
    it('Should return error if email field missing', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/forgot-password')
        .send({

        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
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
    it('Should return error if email field is empty', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/forgot-password')
        .send({
          email: ''
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
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
    it('Should return error if admin email does not exist', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/forgot-password')
        .send({
          email: 'admin89@mail.com'
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('Admin'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('admin verify password reset token', () => {
    it('Should return error if otp field missing', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-password-token')
        .send({

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
    it('Should return error if more than 6 digit otp is sent field is empty', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-password-token')
        .send({
          otp: '6578699987'
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
    it('Should return error if invalid toke is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-password-token')
        .send({
          otp: '000000'
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
    it('Should successfully verify password reset otp', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/verify-password-token')
        .send({
          otp: process.env.SEEDFI_SUPER_ADMIN_PASSWORD_RESET_OTP
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.GENERATE_ADMIN_RESET_PASSWORD_TOKEN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_SUPER_ADMIN_PASSWORD_RESET_TOKEN = res.body.data.passwordToken;
          done();
        });
    });
  });
  describe('admin reset password', () => {
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/reset-password')
        .send({
          password: '5678uiyy87879'
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
    it('Should return error if invalid token is not set', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/reset-password')
        .send({
          password: '5678uiyy87879'
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_PASSWORD_RESET_TOKEN}5879`
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
    it('Should successfully set new password for super admin', (done) => {
      chai.request(app)
        .post('/api/v1/admin/auth/reset-password')
        .send({
          password: 'Seedfi@Admin02'
        })
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_PASSWORD_RESET_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.PASSWORD_SET_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_profile).to.equal(true);
          expect(res.body.data.is_created_password).to.equal(true);
          done();
        });
    });
  });
  describe('Fetch admin permission resources', () => {
    it('Should return all admin permission resources', (done) => {
      chai.request(app)
        .get('/api/v1/admin/role/admin-resources')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_RESOURCES_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.equal(5);
          process.env.SEEDFI_ADMIN_USER_RESOURCE_ID = res.body.data[0].resource_id;
          process.env.SEEDFI_ADMIN_LOAN_APPLICATION_RESOURCE_ID = res.body.data[1].resource_id;
          process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID = res.body.data[2].resource_id;
          process.env.SEEDFI_ADMIN_ROLE_MANAGEMENT_RESOURCE_ID = res.body.data[3].resource_id;
          process.env.SEEDFI_ADMIN_CLUSTER_MANAGEMENT_RESOURCE_ID = res.body.data[4].resource_id;
          done();
        });
    });
  });
  describe('Super admin creates role', () => {
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .send({
          name: 'Head ops'
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
        .post('/api/v1/admin/role')
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
    it('Should return error if name is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          permissions: [
            {
              resource_id: process.env.SEEDFI_ADMIN_USER_RESOURCE_ID,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('name is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if permission is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head ops'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('permissions is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if empty array permission is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head ops',
          permissions: [ ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('permissions does not contain 1 required value(s)');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if resource id is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head ops',
          permissions: [ 
            {
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('permissions[0].resource_id is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if an invalid user permission option is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head ops',
          permissions: [ 
            {
              resource_id: process.env.SEEDFI_ADMIN_USER_RESOURCE_ID,
              user_permissions: [ 'create', 'view', 'edit', 'delete' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('permissions[0].user_permissions[1] must be one of [create, read, update, delete, approve, reject]');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS); 
          done();
        });
    });
    it('Should return error if an already existing admin name is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Super Admin',
          permissions: [ 
            {
              resource_id: process.env.SEEDFI_ADMIN_USER_RESOURCE_ID,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(409);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ADMIN_ROLE_NAME_EXISTS('Super Admin'));
          expect(res.body.error).to.equal('CONFLICT');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if an invalid resource_id is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head ops',
          permissions: [ 
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}78798i`,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.RESOURCE_ID_SENT_NOT_EXISTS(`${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}78798i`));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if an invalid a resource id is sent more than once', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head ops',
          permissions: [ 
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.RESOURCE_REPEATING_IN_PAYLOAD('users'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should create role for head ops successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head ops',
          permissions: [ 
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
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
          expect(res.body.message).to.equal(enums.ROLE_CREATION_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.name).to.equal('Head ops');
          process.env.SEEDFI_ADMIN_ROLE_HEAD_OPS = res.body.data.roleCode;
          done();
        });
    });
  });
});
