import chai from 'chai';
import chaiHttp from 'chai-http';
import dayjs from 'dayjs';
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
  describe('admin fetches loan applications on the platform', () => {
    it('Should fetch all loans', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/personal-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all in review loans without pagination if export is true and status is in review', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/personal-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          status: 'in review'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all loan applications without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/personal-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all loan applications without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/personal-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/personal-loans')
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
    it('Should fetch loan applications by the name of applicant', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/personal-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          search: 'victory babatunde'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch in review loan applications by the name of applicant if export is true ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/personal-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          status: 'in review',
          search: 'victory babatunde'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch loan applications by the name of applicant without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/personal-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          search: 'victory babatunde'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch loan applications by the name of applicant without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/personal-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          search: 'victory babatunde'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });

    it('Should throw error if export is not true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/personal-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'false',
          search: 'victory babatunde'
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
    
    it('Should filter loans by the loan status ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/personal-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          status: 'approved'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });

      it('Should filter loans by the loan status with pagination ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/personal-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            status: 'declined'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });

        it('Should throw error if status is not pending, cancelled, in review, processing, declined, approved, ongoing, over due, completed', (done) => {
          chai.request(app)
            .get('/api/v1/admin/loan/personal-loans')
            .set({
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
            })
            .query({
              export: 'true',
              status: 'laoan going'
            })
            .end((err, res) => {
              expect(res.statusCode).to.equal(422);
              expect(res.body).to.have.property('message');
              expect(res.body).to.have.property('status');
              expect(res.body.message).to.equal('status must be one of [pending, cancelled, in review, processing, declined, approved, ongoing, over due, completed]');
              expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
              expect(res.body.status).to.equal(enums.ERROR_STATUS);
              done();
            });
        });
      });
      it('Should filter loan applications by the loan status if export is true', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/personal-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            status: 'approved'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
  
      it('Should filter loans by the date they were created ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/personal-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            start_date: '2023-01-13 23:03:09.875717',
            end_date: '2023-01-14 23:03:09.875717'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should filter loans by the date they were created if export is true ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/personal-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            start_date: '2023-01-13 23:03:09.875717',
            end_date: '2023-01-14 23:03:09.875717'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should filter loans by the date they were created without pagination export is true', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/personal-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            start_date: '2023-01-13 23:03:09.875717',
            end_date: '2023-01-14 23:03:09.875717'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should filter loans by the date they were created without pagination if export is true', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/personal-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            start_date: '2023-01-13 23:03:09.875717',
            end_date: '2023-01-14 23:03:09.875717'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should throw error if in invalid loan application date is entered', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/personal-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            start_date: '2023-01',
            end_date: '2023-01-14'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(422);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal('start_date must be a valid date');
            expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
            expect(res.body.status).to.equal(enums.ERROR_STATUS);
            done();
          });
      });
      it('Should filter loans by the date they were created and status ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/personal-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            from_date: '2023-01-13 23:03:09.875717',
            to_date: '2023-01-14 23:03:09.875717',
            status: 'active'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should filter loans by the date they were created and status if export is true', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/personal-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            start_date: '2023-01-13 23:03:09.875717',
            end_date: '2023-01-14 23:03:09.875717',
            status: 'approved'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should filter loans by the date they were created and status if export is true', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/personal-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            start_date: '2023-01-13 23:03:09.875717',
            end_date: '2023-01-14 23:03:09.875717',
            status: 'approved'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
    });
  });
  describe('admin fetches repaid loans on the platform', () => {
    it('Should fetch all repaid loans with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/repaid-loans')
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
          expect(res.body.data).to.have.property('repaidLoans');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all repaid loans if query type is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/repaid-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('repaidLoans');
          expect(res.body.data.repaidLoans[0]).to.have.property('user_id');
          expect(res.body.data.repaidLoans[0]).to.have.property('name');
          expect(res.body.data.repaidLoans[0]).to.have.property('loan_id');
          expect(res.body.data.repaidLoans[0]).to.have.property('status');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/repaid-loans')
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
    it('Should fetch repaid loans by the name of the loan applicant', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/repaid-loans')
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
          expect(res.body.data).to.have.property('repaidLoans');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should throw error if export is not true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/repaid-loans')
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
    it('Should fetch repaid loans by the loan applicant name where the query type is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/repaid-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          search: 'adeleye blaise'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data.repaidLoans[0]).to.have.property('user_id');
          expect(res.body.data.repaidLoans[0]).to.have.property('name');
          expect(res.body.data.repaidLoans[0]).to.have.property('loan_id');
          expect(res.body.data.repaidLoans[0]).to.have.property('status');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch repaid loans by the loan applicant name with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/repaid-loans')
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
          expect(res.body.data).to.have.property('repaidLoans');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter repaid loans by the date they were paid ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/repaid-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          start_date: '2023-01-13',
          end_date: '2023-01-14'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('repaidLoans');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter repaid loans by the date they were paid if query is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/repaid-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          start_date: '2023-03-09',
          end_date: '2023-03-10'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('repaidLoans');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter repaid loans by the date they were paid with pages ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/repaid-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          start_date: '2023-01-13',
          end_date: '2023-01-14',
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
          expect(res.body.data).to.have.property('repaidLoans');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });  
  });
  describe('admin fetches platform overview details', () => {
    it('Should fetch platform overview page no date filter', (done) => {
      chai.request(app)
        .get('/api/v1/admin/overview')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          type: 'all'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('generalOverviewCount');
          expect(res.body.data).to.have.property('loanTransactions');
          expect(res.body.data).to.have.property('loanRepayment');
          expect(res.body.data).to.have.property('loanSchedule');
          expect(res.body.data).to.have.property('clusterGroup');
          expect(res.body.data).to.have.property('others');
          expect(res.body.data.others).to.have.property('borrowing_customers');
          expect(res.body.data.others).to.have.property('npl_ratio');
          expect(res.body.message).to.equal(enums.PLATFORM_OVERVIEW_PAGE_FETCHED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch platform overview page with date filter', (done) => {
      chai.request(app)
        .get('/api/v1/admin/overview')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          type: 'filter',
          from_date: `${dayjs().subtract('1', 'month').format('YYYY-MM-DD 00:00:00')}`,
          to_date: `${dayjs().format('YYYY-MM-DD 00:00:00')}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('generalOverviewCount');
          expect(res.body.data).to.have.property('loanTransactions');
          expect(res.body.data).to.have.property('loanRepayment');
          expect(res.body.data).to.have.property('loanSchedule');
          expect(res.body.data).to.have.property('clusterGroup');
          expect(res.body.data).to.have.property('others');
          expect(res.body.data.others).to.have.property('borrowing_customers');
          expect(res.body.data.others).to.have.property('npl_ratio');
          expect(res.body.message).to.equal(enums.PLATFORM_OVERVIEW_PAGE_FETCHED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/overview')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .query({
          type: 'all'
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
    it('Should throw error if invalid type is sent', (done) => {
      chai.request(app)
        .get('/api/v1/admin/overview')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          type: 'export',
          from_date: `${dayjs().subtract('1', 'month').format('YYYY-MM-DD 00:00:00')}`,
          to_date: `${dayjs().format('YYYY-MM-DD 00:00:00')}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('type must be one of [filter, all]');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    }); 
  });
  describe('admin fetches reschduled loans on the platform', () => {
    it('Should fetch all rescheduled loans with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/rescheduled-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          page: '1',
          per_page: '1'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('rescheduledLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/rescheduled-loans')
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
    it('Should fetch rescheduled loans by the name of the loan applicant', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/rescheduled-loans')
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
          expect(res.body.data).to.have.property('rescheduledLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch rescheduled loans by the loan applicant name with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/rescheduled-loans')
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
          expect(res.body.data).to.have.property('rescheduledLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter rescheduled loans by the status ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/rescheduled-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          status: 'ongoing'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('rescheduledLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    
    it('Should filter repaid loans by the status with pages ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/rescheduled-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          status: 'ongoing',
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
          expect(res.body.data).to.have.property('rescheduledLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });  
  });
  describe('admin fetches single user rescheduled loan details on the platform', () => {
    it('Should fetch single user rescheduled loan details', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/rescheduled-loans`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data.userRescheduleDetails).to.have.property('loan_id');
          expect(res.body.data.userRescheduleDetails).to.have.property('name');
          expect(res.body.data.userRescheduleDetails).to.have.property('user_id');
          expect(res.body.data.newRepayment[0]).to.have.property('repayment_amount');          
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOAN_DETAILS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/rescheduled-loans`)
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
    it('Should return error if invalid loan id is set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}ehfgr/rescheduled-loans`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('loan application does not exist');
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
});
