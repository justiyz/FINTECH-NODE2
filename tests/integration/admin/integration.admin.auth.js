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
          expect(res.body.data.length).to.equal(4);
          process.env.SEEDFI_ADMIN_USER_RESOURCE_ID = res.body.data[0].resource_id;
          process.env.SEEDFI_ADMIN_LOAN_APPLICATION_RESOURCE_ID = res.body.data[1].resource_id;
          process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID = res.body.data[2].resource_id;
          process.env.SEEDFI_ADMIN_ROLE_MANAGEMENT_RESOURCE_ID = res.body.data[3].resource_id;
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
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
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
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
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
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}`,
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
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
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_LOAN_APPLICATION_RESOURCE_ID}`,
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ROLE_MANAGEMENT_RESOURCE_ID}`,
              user_permissions:  [ 'read' ]
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
          done();
        });
    });
  });
});
