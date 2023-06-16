import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';

const { expect } = chai;
chai.use(chaiHttp);

describe('Admin Settings management', () => {
  describe('Fetch env values settings', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/env-settings')
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
    it('Should return error if token is not sent', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/env-settings')
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
    it('Should fetch env values successfully', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/env-settings')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data[0]).to.have.property('id');
          expect(res.body.data[0]).to.have.property('env_id');
          expect(res.body.data[0]).to.have.property('value');
          expect(res.body.message).to.equal(enums.FETCH_ENV_VALUES_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_ADMIN_SYSTEM_CARD_TOKENIZATION_ENV_VALUE = res.body.data[0].env_id;
          process.env.SEEDFI_ADMIN_SYSTEM_MAXIMUM_LOAN_TENOR_ENV_VALUE = res.body.data[1].env_id;
          process.env.SEEDFI_ADMIN_SYSTEM_MINIMUM_LOAN_TENOR_ENV_VALUE = res.body.data[2].env_id;
          done();
        });
    });
  });
  describe('Should update env values settings', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .put('/api/v1/admin/settings/env-settings')
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
    it('Should return error if token is not sent', (done) => {
      chai.request(app)
        .put('/api/v1/admin/settings/env-settings')
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
    it('Should return error if body is not an array of object', (done) => {
      chai.request(app)
        .put('/api/v1/admin/settings/env-settings')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('value must be an array');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if env id is not sent', (done) => {
      chai.request(app)
        .put('/api/v1/admin/settings/env-settings')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send( 
          [ {} ]
        )
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('[0].env_id is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if value is not sent', (done) => {
      chai.request(app)
        .put('/api/v1/admin/settings/env-settings')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send( 
          [ {
            env_id: 'admin-env-2f4c57f2e9a711edb'
          } ]
        )
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('[0].value is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if non super admin calls route', (done) => {
      chai.request(app)
        .put('/api/v1/admin/settings/env-settings')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_TWO_ACCESS_TOKEN}`
        })
        .send([
          {
            env_id: process.env.SEEDFI_ADMIN_SYSTEM_CARD_TOKENIZATION_ENV_VALUE,
            value: 300
          }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ACTION_NOT_ALLOWED_FOR_NONE_SUPER_ADMIN);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should update env value settings successfully', (done) => {
      chai.request(app)
        .put('/api/v1/admin/settings/env-settings')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send([
          {
            env_id: process.env.SEEDFI_ADMIN_SYSTEM_CARD_TOKENIZATION_ENV_VALUE,
            value: 300
          },
          {
            env_id: process.env.SEEDFI_ADMIN_SYSTEM_MAXIMUM_LOAN_TENOR_ENV_VALUE,
            value: 30
          },
          {
            env_id: process.env.SEEDFI_ADMIN_SYSTEM_MINIMUM_LOAN_TENOR_ENV_VALUE,
            value: 2
          }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.UPDATED_ENV_VALUES_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('Loan score card breakdown', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/loan-score-card')
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
    it('Should return error if token is not sent', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/loan-score-card')
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
    it('Should fetch loan score card breakdown successfully', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/loan-score-card')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('individualLoanScoreCardResult');
          expect(res.body.data).to.have.property('clusterLoanScoreCardResult');
          expect(res.body.data.individualLoanScoreCardResult).to.have.property('monthly_income_weight');
          expect(res.body.data.individualLoanScoreCardResult).to.have.property('employment_type_weight');
          expect(res.body.data.individualLoanScoreCardResult).to.have.property('dependant_weight');
          expect(res.body.data.individualLoanScoreCardResult.monthly_income_weight).to.equal(5);
          expect(res.body.data.individualLoanScoreCardResult.returned_cheques_from_cr_weight).to.equal(15);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
});
