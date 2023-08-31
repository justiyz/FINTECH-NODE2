import chai from 'chai';
import path from 'path';
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
  describe('Create promos', () => {
    it('Should flag when not accepted file type is sent for image upload', (done) => {
      chai.request(app)
        .post('/api/v1/admin/settings/create-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/BRD.pdf'))
        .field('name', 'borrow for lifestyle')
        .field('description', 'borrow and get 20 percent discount')
        .field('start_date', '2023-10-02')
        .field('end_date', '2023-11-30')
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.UPLOAD_AN_IMAGE_DOCUMENT_VALIDATION);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/settings/create-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}64hreteg`
        })
        .attach('document', path.resolve(__dirname, '../../files/BRD.pdf'))
        .field('name', 'borrow for lifestyle')
        .field('description', 'borrow and get 20 percent discount')
        .field('start_date', '2023-06-24')
        .field('end_date', '2023-06-30')
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
    it('Should flag when name is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/settings/create-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/BRD.pdf'))
        .field('description', 'borrow and get 20 percent discount')
        .field('start_date', '2023-06-24')
        .field('end_date', '2023-06-30')
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
    it('Should flag when description is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/settings/create-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/BRD.pdf'))
        .field('name', 'borrow for lifestyle')
        .field('start_date', '2023-06-24')
        .field('end_date', '2023-06-30')
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('description is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when start_date is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/settings/create-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/BRD.pdf'))
        .field('name', 'borrow for lifestyle')
        .field('description', 'borrow and get 20 percent discount')
        .field('end_date', '2023-06-30')
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('start_date is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should flag when end_date is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/settings/create-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname, '../../files/BRD.pdf'))
        .field('name', 'borrow for lifestyle')
        .field('description', 'borrow and get 20 percent discount')
        .field('start_date', '2023-06-24')
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('end_date is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should create promo', (done) => {
      chai.request(app)
        .post('/api/v1/admin/settings/create-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname,  '../../files/signature.png'))
        .field('name', 'borrow for lifestyle')
        .field('description', 'borrow and get 20 percent discount')
        .field('start_date', '2023-10-02')
        .field('end_date', '2023-11-30')
        .field('percentage_discount', '20')
        .field('customer_segment', 'unemployed')
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('name');
          expect(res.body.data).to.have.property('description');
          expect(res.body.data).to.have.property('start_date');
          expect(res.body.data).to.have.property('end_date');
          expect(res.body.data).to.have.property('start_date');
          process.env.SEEDFI_SYSTEM_PROMO_ONE_ID = res.body.data.promo_id;
          expect(res.body.message).to.equal(enums.PROMO_CREATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should throw error if promo already exists', (done) => {
      chai.request(app)
        .post('/api/v1/admin/settings/create-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname,  '../../files/signature.png'))
        .field('name', 'borrow for lifestyle')
        .field('description', 'borrow and get 20 percent discount')
        .field('start_date', '2023-06-24')
        .field('end_date', '2023-06-30')
        .field('percentage_discount', '20')
        .field('customer_segment', 'unemployed')
        .end((err, res) => {
          expect(res.statusCode).to.equal(409);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Promo name already exist');
          expect(res.body.error).to.equal('CONFLICT');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if start has passed', (done) => {
      chai.request(app)
        .post('/api/v1/admin/settings/create-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .field('name', 'borrow for entertainment')
        .field('description', 'borrow and get 10 percent discount')
        .field('start_date', '2023-06-17')
        .field('end_date', '2023-06-30')
        .field('percentage_discount', '20')
        .field('customer_segment', 'unemployed')
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Please input a date that has not passed');
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if start has passed', (done) => {
      chai.request(app)
        .post('/api/v1/admin/settings/create-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .field('name', 'borrow for entertainment')
        .field('description', 'borrow and get 10 percent discount')
        .field('start_date', '2023-06-17')
        .field('end_date', '2023-06-30')
        .field('percentage_discount', '20')
        .field('customer_segment', 'unemployed')
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Please input a date that has not passed');
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should create another promo without image url', (done) => {
      chai.request(app)
        .post('/api/v1/admin/settings/create-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .field('name', 'borrow for loving')
        .field('description', 'borrow and get 10 percent discount')
        .field('start_date', '2023-10-02')
        .field('end_date', '2023-11-30')
        .field('percentage_discount', '20')
        .field('customer_segment', 'unemployed')
        .end((err, res) => {
          expect(res.statusCode).to.equal(201);
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('name');
          expect(res.body.data).to.have.property('description');
          expect(res.body.data).to.have.property('start_date');
          expect(res.body.data).to.have.property('end_date');
          expect(res.body.data).to.have.property('start_date');
          process.env.SEEDFI_SYSTEM_PROMO_TWO_ID = res.body.data.promo_id;
          expect(res.body.message).to.equal(enums.PROMO_CREATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('fetch all promos', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/promos')
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
        .get('/api/v1/admin/settings/promos')
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
    it('Should fetch all promos successfully', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/promos')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data[0]).to.have.property('id');
          expect(res.body.data[0]).to.have.property('promo_id');
          expect(res.body.data[0]).to.have.property('name');
          expect(res.body.message).to.equal(enums.PROMOS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('fetch single promo details', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/settings/${process.env.SEEDFI_SYSTEM_PROMO_ONE_ID}/promo`)
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
        .get(`/api/v1/admin/settings/${process.env.SEEDFI_SYSTEM_PROMO_ONE_ID}/promo`)
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
    it('Should return error if promo does not exist', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/settings/${process.env.SEEDFI_SYSTEM_PROMO_ONE_ID}hgtgfdf/promo`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send([
          {
            promo_id: process.env.SEEDFI_SYSTEM_PROMO_ONE_IDjdhdiej
          }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Promo does not exist');
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should fetch all promo details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/settings/${process.env.SEEDFI_SYSTEM_PROMO_ONE_ID}/promo`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('id');
          expect(res.body.data).to.have.property('promo_id');
          expect(res.body.data).to.have.property('name');
          expect(res.body.message).to.equal(enums.PROMO_DETAILS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('edit promo details', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/settings/${process.env.SEEDFI_SYSTEM_PROMO_ONE_ID}/promo`)
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
        .put(`/api/v1/admin/settings/${process.env.SEEDFI_SYSTEM_PROMO_ONE_ID}/promo`)
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
    it('Should return error if promo does not exist', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/settings/${process.env.SEEDFI_SYSTEM_PROMO_ONE_ID}dfdfde/promo`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Promo does not exist');
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    
    it('Should throw error if promo already exists', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/settings/${process.env.SEEDFI_SYSTEM_PROMO_ONE_ID}/promo`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname,  '../../files/signature.png'))
        .field('name', 'borrow for lifestyle')
        .field('description', 'borrow and get 20 percent discount')
        .field('start_date', '2023-06-24')
        .field('end_date', '2023-06-30')
        .field('percentage_discount', '20')
        .field('customer_segment', 'unemployed')
        .end((err, res) => {
          expect(res.statusCode).to.equal(409);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Promo name already exist');
          expect(res.body.error).to.equal('CONFLICT');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should throw error if start has passed', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/settings/${process.env.SEEDFI_SYSTEM_PROMO_ONE_ID}/promo`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .field('name', 'borrow for entertainment')
        .field('description', 'borrow and get 10 percent discount')
        .field('start_date', '2023-06-17')
        .field('end_date', '2023-06-30')
        .field('percentage_discount', '20')
        .field('customer_segment', 'unemployed')
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Please input a date that has not passed');
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should edit promo successfully', (done) => {
      chai.request(app)
        .put(`/api/v1/admin/settings/${process.env.SEEDFI_SYSTEM_PROMO_ONE_ID}/promo`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .attach('document', path.resolve(__dirname,  '../../files/signature.png'))
        .field('name', 'borrow for feeding')
        .field('description', 'borrow and get 10 percent discount')
        .field('percentage_discount', '10')
        .field('customer_segment', 'employed')
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('promo_id');
          expect(res.body.data).to.have.property('description');
          expect(res.body.data).to.have.property('name');
          expect(res.body.data).to.have.property('status');
          expect(res.body.data).to.have.property('customer_segment');
          expect(res.body.message).to.equal('Promo edited successfully');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('cancel promo', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/cancel-promo')
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
        .patch('/api/v1/admin/settings/cancel-promo')
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
    it('Should return error if promo does not exist', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/cancel-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send([
          {
            promo_id: process.env.SEEDFI_SYSTEM_PROMO_ONE_IDjdhdiej
          }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('[0].promo_id is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if body is not an array of object', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/cancel-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          promo_id: process.env.SEEDFI_SYSTEM_PROMO_ONE_ID

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
    it('Should cancel promo successfully', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/cancel-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send([
          {
            promo_id: process.env.SEEDFI_SYSTEM_PROMO_ONE_ID
          }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('status');
          expect(res.body.data[0]).to.have.property('promo_id');
          expect(res.body.data[0]).to.have.property('description');
          expect(res.body.data[0]).to.have.property('name');
          expect(res.body.data[0]).to.have.property('status');
          expect(res.body.data[0]).to.have.property('actual_end_date');
          expect(res.body.message).to.equal('Promo cancelled successfully');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('delete promo', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/delete-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .send([
          {
            promo_id: process.env.SEEDFI_SYSTEM_PROMO_ONE_ID
          }
        ])
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
        .patch('/api/v1/admin/settings/delete-promo')
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
    it('Should return error if promo does not exist', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/delete-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send([
          {
            promo_id: process.env.SEEDFI_SYSTEM_PROMO_ONE_IDjdhdiej
          }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('[0].promo_id is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if body is not an array of object', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/delete-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          promo_id: process.env.SEEDFI_SYSTEM_PROMO_ONE_ID
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
    it('Should delete promo successfully', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/delete-promo')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send([
          {
            promo_id: process.env.SEEDFI_SYSTEM_PROMO_ONE_ID
          }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body.message).to.equal('Promo deleted successfully');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });

  describe('Fetch reward points details in settings', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/reward-points')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .query({
          type: 'general'
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
        .get('/api/v1/admin/settings/reward-points')
        .query({
          type: 'general'
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
    it('Should return error if type is not sent', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/reward-points')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({  })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('type is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should fetch general reward point details successfully', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/reward-points')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          type: 'general'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data[0]).to.have.property('id');
          expect(res.body.data[0]).to.have.property('reward_id');
          expect(res.body.data[0]).to.have.property('name');
          expect(res.body.data[0]).to.have.property('point');
          expect(res.body.data[2].point_range.length).to.equals(5);
          expect(res.body.message).to.equal(enums.FETCH_REWARD_POINT_DETAILS_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_ADMIN_SYSTEM_SIGN_UP_REWARD_ID = res.body.data[0].reward_id;
          process.env.SEEDFI_ADMIN_SYSTEM_COMPLETE_LOAN_REPAYMENT_REWARD_ID = res.body.data[1].reward_id;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID = res.body.data[2].reward_id;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_ONE_ID = res.body.data[2].point_range[0].range_id;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_ONE_LOWER_BOUND = res.body.data[2].point_range[0].lower_bound;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_ONE_UPPER_BOUND = res.body.data[2].point_range[0].upper_bound;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_TWO_ID = res.body.data[2].point_range[1].range_id;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_TWO_LOWER_BOUND = res.body.data[2].point_range[1].lower_bound;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_TWO_UPPER_BOUND = res.body.data[2].point_range[1].upper_bound;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_THREE_ID = res.body.data[2].point_range[2].range_id;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_THREE_LOWER_BOUND = res.body.data[2].point_range[2].lower_bound;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_THREE_UPPER_BOUND = res.body.data[2].point_range[2].upper_bound;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_FOUR_ID = res.body.data[2].point_range[3].range_id;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_FOUR_LOWER_BOUND = res.body.data[2].point_range[3].lower_bound;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_FOUR_UPPER_BOUND = res.body.data[2].point_range[3].upper_bound;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_FIVE_ID = res.body.data[2].point_range[4].range_id;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_FIVE_LOWER_BOUND = res.body.data[2].point_range[4].lower_bound;
          process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_FIVE_UPPER_BOUND = res.body.data[2].point_range[4].upper_bound;
          done();
        });
    });
    it('Should fetch cluster related reward point details successfully', (done) => {
      chai.request(app)
        .get('/api/v1/admin/settings/reward-points')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          type: 'cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data[0]).to.have.property('id');
          expect(res.body.data[0]).to.have.property('reward_id');
          expect(res.body.data[0]).to.have.property('name');
          expect(res.body.data[0]).to.have.property('point');
          expect(res.body.message).to.equal(enums.FETCH_REWARD_POINT_DETAILS_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_ADMIN_SYSTEM_CLUSTER_CREATION_REWARD_ID = res.body.data[0].reward_id;
          process.env.SEEDFI_ADMIN_SYSTEM_CLUSTER_MEMBERSHIP_INCREASE_REWARD_ID = res.body.data[1].reward_id;
          done();
        });
    });
  });
  describe('Should update cluster related reward points in settings', () => {
    it('Should return error if body is not an array of object', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/cluster-rewards')
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
    it('Should update env value settings successfully', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/cluster-rewards')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send([
          {
            reward_id: process.env.SEEDFI_ADMIN_SYSTEM_CLUSTER_CREATION_REWARD_ID,
            point: 10
          },
          {
            reward_id: process.env.SEEDFI_ADMIN_SYSTEM_CLUSTER_MEMBERSHIP_INCREASE_REWARD_ID,
            point: 25
          }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.UPDATED_CLUSTER_RELATED_REWARDS_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('Should update general reward points not having range in settings', () => {
    it('Should return error if reward id is not sent', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/general-rewards')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send(
          {
            point: 80
          }
        )
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('reward_id is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if reward to be edited is type having range', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/general-rewards')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send(
          {
            reward_id: process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID,
            point: 80
          }
        )
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.REWARD_POINT_RANGE_TO_BE_UPDATED);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid reward to be edited', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/general-rewards')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send(
          {
            reward_id: `${process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID}9ke`,
            point: 80
          }
        )
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.REWARD_DOES_NOT_EXISTS);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should update env value settings successfully', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/general-rewards')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send(
          {
            reward_id: process.env.SEEDFI_ADMIN_SYSTEM_SIGN_UP_REWARD_ID,
            point: 40
          }
        )
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.UPDATED_GENERAL_REWARDS_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('Should update general reward points range in settings', () => {
    it('Should return error if body is not an array of object', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/general-reward-ranges')
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
    it('Should update env value settings successfully', (done) => {
      chai.request(app)
        .patch('/api/v1/admin/settings/general-reward-ranges')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send([
          {
            range_id: process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_ONE_ID,
            lower_bound: process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_ONE_LOWER_BOUND,
            upper_bound: process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_ONE_UPPER_BOUND,
            point: 2
          },
          {
            range_id: process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_TWO_ID,
            lower_bound: process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_TWO_LOWER_BOUND,
            upper_bound: process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_TWO_UPPER_BOUND,
            point: 5
          },
          {
            range_id: process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_FIVE_ID,
            lower_bound: process.env.SEEDFI_ADMIN_SYSTEM_SUCCESSFUL_LOAN_REQUEST_REWARD_ID_RANGE_FIVE_LOWER_BOUND,
            upper_bound: 90000000,
            point: 45
          }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.UPDATED_GENERAL_REWARD_RANGES_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
});

