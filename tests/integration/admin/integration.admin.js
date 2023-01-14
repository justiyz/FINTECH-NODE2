import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';
import { inviteAdmin } from '../../payload/payload.admin';

const { expect } = chai;
chai.use(chaiHttp);

describe('Admin', () => {
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
    it('Should invite admin successfully.', (done) => {
      chai.request(app)
        .post('/api/v1/admin/invite-admin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          ...inviteAdmin,
          role_code: process.env.SEEDFI_ADMIN_ROLE_Head_OPS
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res).to.have.property('body');
          expect(res.body.message).to.equal(enums.ADMIN_SUCCESSFULLY_INVITED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_ADMIN_TWO_ID = res.body.data.newAdmin.admin_id;
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
          role_code: process.env.SEEDFI_ADMIN_ROLE_Head_OPS
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
    it('Should flag when pass wrong admin id.', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/${process.env.SEEDFI_ADMIN_TWO_ID}0p`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          status: 'active'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_NOT_FOUND);
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
          expect(res.body.message).to.equal('status must be one of [active, suspended, inactive, deactivated]');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
});
