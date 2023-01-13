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
});
