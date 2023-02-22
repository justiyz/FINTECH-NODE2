import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../src/app';
import enums from '../../src/users/lib/enums';


const { expect } = chai;
chai.use(chaiHttp);

const pin = '0908';

describe('User', () => {
  describe('user apply for loan', () => {
    it('should throw error when loan duration is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          amount: 200000,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('duration_in_months is required');
          done();
        });
    });
    it('should throw error if invalid loan amount is sent', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          amount: 'kunle',
          duration_in_months: 3,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('amount must be a number');
          done();
        });
    });
    it('should throw error if user has not completed advanced profile', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          amount: 200000,
          duration_in_months: 3,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_ADVANCED_KYC_NOT_COMPLETED('address'));
          done();
        });
    });
    it('should update user one profile successfully', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          address: 'Lagos Mushin',
          number_of_dependents: '4'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.UPDATED_USER_PROFILE_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('first_name');
          expect(res.body.data).to.have.property('last_name');
          done();
        });
    });
    it('should throw error if user has not completed advanced profile', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          amount: 200000,
          duration_in_months: 3,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_ADVANCED_KYC_NOT_COMPLETED('employment type'));
          done();
        });
    });
    it('should update user one profile successfully', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          employment_type: 'employed',
          number_of_dependents: '2'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.UPDATED_USER_PROFILE_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('first_name');
          expect(res.body.data).to.have.property('last_name');
          done();
        });
    });
    it('should throw error if user has not verified email', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .send({
          amount: 200000,
          duration_in_months: 3,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.EMAIL_NOT_VERIFIED);
          done();
        });
    });
    it('should throw error if user has not verified and uploaded selfie image', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN}`
        })
        .send({
          amount: 200000,
          duration_in_months: 3,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.SELFIE_IMAGE_NOT_PREVIOUSLY_UPLOADED);
          done();
        });
    });
    it('should throw error if user has not verified bvn', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .send({
          amount: 200000,
          duration_in_months: 3,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.BVN_NOT_PREVIOUSLY_VERIFIED);
          done();
        });
    });
    it('should throw error if user has not uploaded valid id', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          amount: 200000,
          duration_in_months: 3,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_VALID_ID_NOT_UPLOADED);
          done();
        });
    });
    it('should throw error if user applies for loan amount greater than allowable amount', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          amount: 2000000000,
          duration_in_months: 6,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_REQUESTS_FOR_LOAN_AMOUNT_GREATER_THAN_ALLOWABLE);
          done();
        });
    });
    it('should throw error if user applies for loan for a tenor lesser than allowable minimum tenor', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          amount: 50000,
          duration_in_months: 0.5,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_REQUESTS_FOR_LOAN_TENOR_LESSER_THAN_ALLOWABLE);
          done();
        });
    });
    it('should throw error if user applies for loan for a tenor greater than allowable maximum tenor', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          amount: 20000,
          duration_in_months: 15,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_REQUESTS_FOR_LOAN_TENOR_GREATER_THAN_ALLOWABLE);
          done();
        });
    });
    it('should apply for loan successfully', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          amount: 50000,
          duration_in_months: 3,
          loan_reason: 'car loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_id');
          expect(res.body.data).to.have.property('fees');
          expect(res.body.data.loan_duration_in_months).to.equal('3');
          expect(res.body.message).to.equal(res.body.data.loan_decision === 'MANUAL' ? enums.LOAN_APPLICATION_MANUAL_DECISION : enums.LOAN_APPLICATION_APPROVED_DECISION);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_ONE_LOAN_ID = res.body.data.loan_id;
          done();
        });
    });
  });
  describe('user cancels loan application process', () => {
    it('should throw error when invalid loan id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_ONE_LOAN_ID}90ij/cancel-application`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_NOT_EXISTING);
          done();
        });
    });
    it('should cancel loan application for user two successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_ONE_LOAN_ID}/cancel-application`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_decision');
          expect(res.body.data).to.have.property('status');
          expect(res.body.data.status).to.equal('cancelled');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_CANCELLING_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('user request for disbursement of loan', () => {
    it('should throw error when invalid loan id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_ONE_LOAN_ID}90ij/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          pin
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_NOT_EXISTING);
          done();
        });
    });
    it('should throw error if invalid pin is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_ONE_LOAN_ID}/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          pin: '1234'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.INVALID_PIN);
          done();
        });
    });
    it('should throw error if user tries to process disbursement for a cancelled loan application', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_ONE_LOAN_ID}/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          pin
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_PREVIOUSLY_DISBURSED('cancelled'));
          done();
        });
    });
    it('should apply for loan successfully', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          amount: 100000,
          duration_in_months: 6,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_id');
          expect(res.body.data).to.have.property('fees');
          expect(res.body.data.loan_duration_in_months).to.equal('6');
          expect(res.body.message).to.equal(res.body.data.loan_decision === 'MANUAL' ? enums.LOAN_APPLICATION_MANUAL_DECISION : enums.LOAN_APPLICATION_APPROVED_DECISION);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID = res.body.data.loan_id;
          done();
        });
    });
    it('should disburse loan for user two successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          pin
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_decision');
          expect(res.body.data).to.have.property('status');
          expect(res.body.data.status).to.equal('ongoing');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_DISBURSEMENT_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if user tries to apply for another loan with a current active loan', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          amount: 200000,
          duration_in_months: 3,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_FAILED_DUE_TO_EXISTING_ACTIVE_LOAN('an ongoing personal loan'));
          done();
        });
    });
    it('should throw error when loan application is no longer pending or approved', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/cancel-application`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_CANCELLING_FAILED_DUE_TO_CURRENT_STATUS('ongoing'));
          done();
        });
    });
  });
  describe('user homepage', () => {
    it('should cancel loan application for user two successfully', (done) => {
      chai.request(app)
        .get('/api/v1/user/homepage')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('personal_loan_transaction_history');
          expect(res.body.data).to.have.property('cluster_loan_transaction_history');
          expect(res.body.data).to.have.property('user_loan_status');
          expect(res.body.data.user_loan_status).to.equal('active');
          expect(res.body.data.loan_amounts.total_cluster_loan_outstanding_loan).to.equal(0);
          expect(res.body.message).to.equal(enums.HOMEPAGE_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('user fetches details of one loan', () => {
    it('should throw error when invalid loan id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_ONE_LOAN_ID}90ij/personal/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_NOT_EXISTING);
          done();
        });
    });
    it('should cancel loan application for user two successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/personal/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loanRepaymentDetails');
          expect(res.body.data).to.have.property('loanDetails');
          expect(res.body.data.loanDetails.status).to.equal('ongoing');
          expect(res.body.data.loanRepaymentDetails.length).to.equal(6);
          expect(res.body.message).to.equal(enums.USER_LOAN_DETAILS_FETCHED_SUCCESSFUL('personal'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
});
