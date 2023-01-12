import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';

const { expect } = chai;
chai.use(chaiHttp);

describe('Admin roles', () => {  
  describe('Fetch all non-super admin roles', () => {
    it('Should fetch all non-super admin roles', (done) => {
      chai.request(app)
        .get('/api/v1/admin/role/regular-admins')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.NON_SUPER_ADMINS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
      
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/role/regular-admins')
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
      
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/role/regular-admins')
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
  });

  describe('Delete a particular role', () => {
    it('Should delete a role', (done) => {
      chai.request(app)
        .delete('/api/v1/admin/role/delete-role/JRPST')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ROLE_DELETED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });

    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .delete('/api/v1/admin/role/delete-role/JRPST')
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

    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .delete('/api/v1/admin/role/delete-role/JRPST')
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

    it('Should return error if role code is not sent', (done) => {
      chai.request(app)
        .delete('/api/v1/admin/role/delete-role')
        .end((err, res) => {
          console.log(res.body);
          expect(res.statusCode).to.equal(404);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Resource Not Found');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
});

