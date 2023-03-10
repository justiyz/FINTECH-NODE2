import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';

const { expect } = chai;
chai.use(chaiHttp);

describe('Admin Loan management', () => {
  describe('Fetch details of a loan', () => {
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/details`)
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNAUTHORIZED);
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
        .get(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNAUTHORIZED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('invalid signature');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if non existing loan id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}yr7u/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_NOT_EXISTING_IN_DB);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should fetch loan details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_DETAILS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('loan_applicant');
          expect(res.body.data).to.have.property('orr_break_down');
          expect(res.body.data).to.have.property('loan_repayments');
          expect(res.body.data.loan_repayments).to.be.an('array');
          done();
        });
    });
  });
  describe('approve loan application', () => {
    it('Should return error if non existing loan id is sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}yr7u/approve`)
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
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_NOT_EXISTING_IN_DB);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if decision field missing', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/approve`)
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
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid decision field is sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/approve`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          decision: 'decline'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('decision must be [approve]');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if admin without loan application module approve permission tries to perform approval action', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/approve`)
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
          expect(res.body.message).to.equal(enums.ADMIN_CANNOT_PERFORM_ACTION('approve', 'loan application'));
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if loan status is not in review', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/approve`)
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
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_STATUS('ongoing'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('decline loan application', () => {
    it('Should return error if non existing loan id is sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}yr7u/reject`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          decision: 'decline',
          rejection_reason: 'low score'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_NOT_EXISTING_IN_DB);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if rejection reason field missing', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/reject`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          decision: 'decline'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('rejection_reason is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid decision field is sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/reject`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({ 
          decision: 'approve',
          rejection_reason: 'low score'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('decision must be [decline]');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if admin without loan application module reject permission tries to perform approval action', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/reject`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .send({ 
          decision: 'decline',
          rejection_reason: 'low score'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ADMIN_CANNOT_PERFORM_ACTION('reject', 'loan application'));
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if loan status is not in review', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/reject`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          decision: 'decline',
          rejection_reason: 'low score'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_STATUS('ongoing'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
});
