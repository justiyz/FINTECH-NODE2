import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../src/app';
import enums from '../../src/users/lib/enums';
import { receiveTransferSuccessWebHookOne, receiveTransferFailedWebHookOne, receiveTransferReversedWebHookOne, 
  receiveTransferSuccessWebHookTwo, receiveChargeSuccessWebHookTwo, receiveChargeSuccessWebHookOne 
} from '../payload/payload.payment';

const { expect } = chai;
chai.use(chaiHttp);

const pin = '0908';
const userOnePin = '2020';

describe('Individual loan', () => {
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
          expect(res.body.message).to.equal(enums.USER_ADVANCED_KYC_NOT_COMPLETED('number of children'));
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
          marital_status: 'single',
          number_of_children: '4'
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
          expect(res.body.message).to.equal('User selfie image is yet to be uploaded, kindly do this first');
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
    it('should throw error if user tries to apply for a loan greater than tier 1 user loan', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          amount: 1500000,
          duration_in_months: 6,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_REQUESTS_FOR_LOAN_AMOUNT_GREATER_THAN_EMPLOYMENT_LIMIT_ALLOWABLE(20));
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
          expect(res.body.message).to.equal(enums.USER_REQUESTS_FOR_LOAN_AMOUNT_GREATER_THAN_EMPLOYMENT_LIMIT_ALLOWABLE(80));
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
    it('should throw error if user applies for loan amount lesser than allowable amount', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          amount: 20000,
          duration_in_months: 5,
          loan_reason: 'camera fixing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_REQUESTS_FOR_LOAN_AMOUNT_LESSER_THAN_ALLOWABLE);
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
          amount: 200000,
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
    it('should apply for loan for user 2 successfully', (done) => {
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
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_APPROVED_DECISION);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_ONE_LOAN_ID = res.body.data.loan_id;
          done();
        });
    });
    it('should apply for loan for user 1 successfully', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          amount: 200000,
          duration_in_months: 2,
          loan_reason: 'holiday flexing loan'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_id');
          expect(res.body.data).to.have.property('fees');
          expect(res.body.data.loan_duration_in_months).to.equal('2');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_APPROVED_DECISION);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_LOAN_ID = res.body.data.loan_id;
          done();
        });
    });
  });
  describe('user tries to accept maximum value when it is not available', () => {
    it('should throw error when trying to accept system maximum allowable amount when it does not apply', (done) => {
      chai.request(app)
        .patch(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_ONE_LOAN_ID}/accept-allowable-amount`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.SYSTEM_MAXIMUM_ALLOWABLE_AMOUNT_HAS_NULL_VALUE);
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
    it('should apply for another loan for user 2 successfully', (done) => {
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
          expect(res.body.data.status).to.equal('processing');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_DISBURSEMENT_INITIATION_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_DISBURSEMENT_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should disburse loan for user one successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_LOAN_ID}/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          pin: userOnePin
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_decision');
          expect(res.body.data).to.have.property('status');
          expect(res.body.data.status).to.equal('processing');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_DISBURSEMENT_INITIATION_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_DISBURSEMENT_REFERENCE = res.body.data.reference;
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
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_FAILED_DUE_TO_EXISTING_ACTIVE_LOAN('a processing personal loan application'));
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
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_CANCELLING_FAILED_DUE_TO_CURRENT_STATUS('processing'));
          done();
        });
    });
  });
  describe('user tries to cancel an already processing loan application', () => {
    it('should throw error when trying to cancel a loan that is already being processed', (done) => {
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
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_CANCELLING_FAILED_DUE_TO_CURRENT_STATUS('processing'));
          done();
        });
    });
  });
  describe('simulate paystack webhook response for loan disbursement', () => {
    it('should receive user 2 loan 2 webhook transfer success response successfully', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveTransferSuccessWebHookTwo(process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_DISBURSEMENT_REFERENCE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_TRANSFER_SUCCESS_STATUS_RECORDED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should receive user 1 loan 1 webhook transfer failed response successfully', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveTransferFailedWebHookOne(process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_DISBURSEMENT_REFERENCE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_DISBURSEMENT_INITIATION_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('object');
          process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_RE_DISBURSEMENT_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should receive user 1 loan 1 webhook transfer reversed response successfully', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveTransferReversedWebHookOne(process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_DISBURSEMENT_REFERENCE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_TRANSFER_REVERSED_PAYMENT_RECORDED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should receive user 2 loan 2 webhook transfer success response successfully', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveTransferSuccessWebHookOne(process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_RE_DISBURSEMENT_REFERENCE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_TRANSFER_SUCCESS_STATUS_RECORDED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
  });
  describe('user homepage', () => {
    it('should fetch user two homepage details successfully', (done) => {
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
          expect(res.body.data).to.have.property('total_loan_obligation');
          expect(res.body.data).to.have.property('user_individual_loan');
          expect(res.body.data).to.have.property('user_loan_status');
          expect(res.body.data.user_loan_status).to.equal('active');
          expect(res.body.data.user_cluster_loan.total_outstanding_loan).to.equal(0);
          expect(res.body.message).to.equal(enums.HOMEPAGE_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('user current loans', () => {
    it('should fetch user two current loans successfully', (done) => {
      chai.request(app)
        .get('/api/v1/loan/current-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data.currentPersonalLoans.length).to.equal(1);
          expect(res.body.data.currentClusterLoans.length).to.equal(0);
          expect(res.body.message).to.equal(enums.USER_CURRENT_LOANS_FETCHED_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should fetch user one current loans successfully', (done) => {
      chai.request(app)
        .get('/api/v1/loan/current-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data.currentPersonalLoans.length).to.equal(1);
          expect(res.body.data.currentClusterLoans.length).to.equal(0);
          expect(res.body.message).to.equal(enums.USER_CURRENT_LOANS_FETCHED_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should fetch user three current loans successfully', (done) => {
      chai.request(app)
        .get('/api/v1/loan/current-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data.currentPersonalLoans.length).to.equal(0);
          expect(res.body.data.currentClusterLoans.length).to.equal(0);
          expect(res.body.message).to.equal(enums.USER_CURRENT_LOANS_FETCHED_SUCCESSFUL);
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
    it('should fetch loan details for user two loan two successfully', (done) => {
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
          expect(res.body.data).to.have.property('nextLoanRepaymentDetails');
          expect(res.body.data.loanDetails.status).to.equal('ongoing');
          expect(res.body.data.loanRepaymentDetails.length).to.equal(6);
          expect(res.body.message).to.equal(enums.USER_LOAN_DETAILS_FETCHED_SUCCESSFUL('personal'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should fetch loan details for user one loan one successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_LOAN_ID}/personal/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loanRepaymentDetails');
          expect(res.body.data).to.have.property('loanDetails');
          expect(res.body.data).to.have.property('nextLoanRepaymentDetails');
          expect(res.body.data.loanDetails.status).to.equal('ongoing');
          expect(res.body.data.loanRepaymentDetails.length).to.equal(2);
          expect(res.body.message).to.equal(enums.USER_LOAN_DETAILS_FETCHED_SUCCESSFUL('personal'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('user two initiates partial loan repayments for loan two and pays', () => {
    it('should throw error when invalid loan id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}uyiyreo/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'full'
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
    it('should throw error when invalid payment type  is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'all'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('payment_type must be one of [full, part]');
          done();
        });
    });
    it('should throw error when loan status is not ongoing or overdue', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_ONE_LOAN_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'full'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_STATUS_NOT_FOR_REPAYMENT('cancelled'));
          done();
        });
    });
    it('should initiate part loan repayment with another card successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'part'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('authorization_url');
          expect(res.body.data).to.have.property('access_code');
          expect(res.body.data).to.have.property('reference');
          expect(res.body.message).to.equal('Authorization URL created');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_PART_REPAYMENT_ONE_PAYMENT_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should successfully process card payment for loan repayment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookTwo(process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_PART_REPAYMENT_ONE_PAYMENT_REFERENCE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should throw error when invalid payment channel is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/${process.env.SEEDFI_USER_TWO_DEBIT_CARD_ONE_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'part',
          payment_channel: 'ussd'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('payment_channel must be one of [card, bank]');
          done();
        });
    });
    it('should throw error payment channel is not sent', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/${process.env.SEEDFI_USER_TWO_DEBIT_CARD_ONE_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'part'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('payment_channel is required');
          done();
        });
    });
    it('should throw error if debit card does not belong to user', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_ONE_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'full',
          payment_channel: 'card'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CARD_DOES_NOT_BELONG_TO_USER);
          done();
        });
    });
    it('should throw error if invalid debit card id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/9000/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'part',
          payment_channel: 'card'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CARD_DOES_NOT_EXIST);
          done();
        });
    });
    it('should initiate part loan repayment with an existing card successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/${process.env.SEEDFI_USER_TWO_DEBIT_CARD_ONE_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'part',
          payment_channel: 'card'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('payment_type');
          expect(res.body.data).to.have.property('payment_channel');
          expect(res.body.data).to.have.property('status');
          expect(res.body.message).to.equal('Charge attempted');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_PART_REPAYMENT_TWO_PAYMENT_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should successfully process card payment for loan repayment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookTwo(process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_PART_REPAYMENT_TWO_PAYMENT_REFERENCE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should throw error if saved account number does not belong to user', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_ONE}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'full',
          payment_channel: 'bank'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.ACCOUNT_DETAILS_NOT_USERS);
          done();
        });
    });
    it('should throw error if invalid account number id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/9000/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'part',
          payment_channel: 'bank'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.ACCOUNT_DETAILS_NOT_EXISTING);
          done();
        });
    });
    it('should throw error when invalid loan id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}euyi/${process.env.SEEDFI_USER_TWO_BANK_ACCOUNT_ID_ONE}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'full',
          payment_channel: 'bank'
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
    it('should initiate part loan repayment with an existing bank account successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_LOAN_ID}/${process.env.SEEDFI_USER_TWO_BANK_ACCOUNT_ID_ONE}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'part',
          payment_channel: 'bank'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('payment_type');
          expect(res.body.data).to.have.property('payment_channel');
          expect(res.body.data).to.have.property('status');
          expect(res.body.message).to.equal('Charge attempted');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_PART_REPAYMENT_THREE_PAYMENT_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should throw error when invalid reference id is sent for payment otp confirmation', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_PART_REPAYMENT_THREE_PAYMENT_REFERENCE}euyi/submit-otp`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          otp: '123456'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.PAYMENT_RECORD_NOT_FOUND);
          done();
        });
    });
    it('should throw error if otp is not sent', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_PART_REPAYMENT_THREE_PAYMENT_REFERENCE}/submit-otp`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({ })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('otp is required');
          done();
        });
    });
    it('should successfully verify payment by bank account otp', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_PART_REPAYMENT_THREE_PAYMENT_REFERENCE}/submit-otp`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          otp: '123456'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.PAYMENT_OTP_ACCEPTED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_PART_REPAYMENT_THREE_PAYMENT_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should successfully process card payment for loan repayment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookTwo(process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_PART_REPAYMENT_THREE_PAYMENT_REFERENCE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should throw error when payment has already been recorded previously', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookTwo(process.env.SEEDFI_USER_TWO_LOAN_APPLICATION_TWO_PART_REPAYMENT_THREE_PAYMENT_REFERENCE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('error');
          expect(res.body.message).to.equal(enums.PAYMENT_EARLIER_RECORDED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('user one initiates full loan repayments for loan one and pays', () => {
    it('should initiate full loan repayment with an existing tokenized debit card successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_LOAN_ID}/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_ONE_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'full',
          payment_channel: 'card'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('payment_type');
          expect(res.body.data).to.have.property('payment_channel');
          expect(res.body.data).to.have.property('status');
          expect(res.body.message).to.equal('Charge attempted');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_PART_REPAYMENT_ONE_PAYMENT_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should successfully process card payment for loan repayment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookOne(process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_PART_REPAYMENT_ONE_PAYMENT_REFERENCE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CARD_PAYMENT_SUCCESS_STATUS_RECORDED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should throw error when loan status is not ongoing or overdue', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_ONE_LOAN_APPLICATION_ONE_LOAN_ID}/${process.env.SEEDFI_USER_ONE_DEBIT_CARD_ONE_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'full',
          payment_channel: 'card'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_STATUS_NOT_FOR_REPAYMENT('completed'));
          done();
        });
    });
  });
  describe('user loan payments', () => {
    it('should throw error when invalid type is sent', (done) => {
      chai.request(app)
        .get('/api/v1/loan/loan-payments')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'group'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('type must be one of [personal, cluster]');
          done();
        });
    });
    it('should fetch user two personal loan payments successfully', (done) => {
      chai.request(app)
        .get('/api/v1/loan/loan-payments')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          type: 'personal'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.equal(4);
          expect(res.body.message).to.equal(enums.USER_LOAN_PAYMENTS_FETCHED_SUCCESSFUL('personal'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_TWO_LOAN_PAYMENT_ONE_PAYMENT_ID = res.body.data[0].payment_id;
          done();
        });
    });
    it('should fetch user two cluster loan payments successfully', (done) => {
      chai.request(app)
        .get('/api/v1/loan/loan-payments')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .query({
          type: 'cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.equal(0);
          expect(res.body.message).to.equal(enums.USER_LOAN_PAYMENTS_FETCHED_SUCCESSFUL('cluster'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should fetch user one personal loan payments successfully', (done) => {
      chai.request(app)
        .get('/api/v1/loan/loan-payments')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'personal'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.equal(2);
          expect(res.body.message).to.equal(enums.USER_LOAN_PAYMENTS_FETCHED_SUCCESSFUL('personal'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_ONE_LOAN_PAYMENT_ONE_PAYMENT_ID = res.body.data[0].payment_id;
          process.env.SEEDFI_USER_ONE_LOAN_PAYMENT_TWO_PAYMENT_ID = res.body.data[1].payment_id;
          done();
        });
    });
  });
  describe('user fetches details of one loan payment', () => {
    it('should throw error when invalid loan payment id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_PAYMENT_ONE_PAYMENT_ID}90ij/personal/payment-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_PAYMENT_NOT_EXISTING);
          done();
        });
    });
    it('should fetch loan details for user two loan payment one successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_USER_TWO_LOAN_PAYMENT_ONE_PAYMENT_ID}/personal/payment-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loanPaymentDetails');
          expect(res.body.data).to.have.property('loanDetails');
          expect(res.body.data).to.have.property('loanRepaymentDetails');
          expect(res.body.data.loanDetails.status).to.equal('ongoing');
          expect(res.body.data.loanRepaymentDetails.length).to.equal(6);
          expect(res.body.message).to.equal(enums.USER_LOAN_PAYMENT_DETAILS_FETCHED_SUCCESSFUL('personal'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should fetch loan details for user one loan payment one successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_USER_ONE_LOAN_PAYMENT_ONE_PAYMENT_ID}/personal/payment-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loanPaymentDetails');
          expect(res.body.data).to.have.property('loanDetails');
          expect(res.body.data).to.have.property('loanRepaymentDetails');
          expect(res.body.data.loanDetails.status).to.equal('completed');
          expect(res.body.data.loanRepaymentDetails.length).to.equal(2);
          expect(res.body.message).to.equal(enums.USER_LOAN_PAYMENT_DETAILS_FETCHED_SUCCESSFUL('personal'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
});
