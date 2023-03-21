import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import * as Helpers from '../../src/users/lib/utils/lib.util.helpers';
import * as Hash from '../../src/users/lib/utils/lib.util.hash';
import app from '../../src/app';
import enums from '../../src/users/lib/enums';
import { userEightProfile, userNineProfile } from '../payload/payload.auth';

const { expect } = chai;
chai.use(chaiHttp);

const password = 'initialPassword1%';

describe('Clusters', () => {
  describe('user creates clusters', () => {
    it('should throw error when cluster name is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          description: 'group borrowing of money for small projects',
          type: 'public',
          maximum_members: 2,
          minimum_monthly_income: 45000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('name is required');
          done();
        });
    });
    it('should throw error when invalid maximum members is sent', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          name: 'Seedfi movers',
          description: 'group borrowing of money for small projects',
          type: 'private',
          maximum_members: 'seven',
          loan_goal_target: 500000,
          minimum_monthly_income: 45000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('maximum_members must be a number');
          done();
        });
    });
    it('should throw error when invalid cluster type is sent', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          name: 'Seedfi movers',
          description: 'group borrowing of money for small projects',
          type: 'open',
          maximum_members: 3,
          loan_goal_target: 500000,
          minimum_monthly_income: 45000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('type must be one of [public, private]');
          done();
        });
    });
    it('should throw error when loan goal target is sent for type public cluster', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          name: 'Seedfi movers',
          description: 'group borrowing of money for small projects',
          type: 'public',
          maximum_members: 3,
          loan_goal_target: 500000,
          minimum_monthly_income: 45000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('loan_goal_target is not allowed');
          done();
        });
    });
    it('should throw error if user has not verified email', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .send({
          name: 'Seedfi movers',
          description: 'group borrowing of money for small projects',
          type: 'public',
          maximum_members: 3,
          minimum_monthly_income: 45000
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
    it('should throw error if user has not uploaded selfie image', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN}`
        })
        .send({
          name: 'Seedfi movers',
          description: 'group borrowing of money for small projects',
          type: 'public',
          maximum_members: 3,
          minimum_monthly_income: 45000
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
    it('should throw error if user has not verified BVN', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .send({
          name: 'Seedfi movers',
          description: 'group borrowing of money for small projects',
          type: 'public',
          maximum_members: 3,
          minimum_monthly_income: 45000
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
    it('should throw error if user income range is lower than cluster minimum income', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          name: 'Seedfi movers',
          description: 'group borrowing of money for small projects',
          type: 'private',
          maximum_members: 3,
          loan_goal_target: 500000,
          minimum_monthly_income: 45000000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_MINIMUM_INCOME_GREATER_THAN_USER_MINIMUM_INCOME_EXISTING);
          done();
        });
    });
    it('should throw error if user income range has not been filled in profile', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          name: 'Seedfi movers',
          description: 'group borrowing of money for small projects',
          type: 'private',
          maximum_members: 3,
          loan_goal_target: 500000,
          minimum_monthly_income: 500
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.UPDATE_INCOME_RANGE_FOR_ACTION_PERFORMANCE);
          done();
        });
    });
    it('should create a public cluster for user two successfully', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          name: 'Seedfi movers',
          description: 'Group borrowing of money for SMALL projects',
          type: 'public',
          maximum_members: 3,
          minimum_monthly_income: 45000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CLUSTER_CREATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('join_cluster_closes_at');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.maximum_members).to.equal(3);
          process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID = res.body.data.cluster_id;
          process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_UNIQUE_CODE = res.body.data.unique_code;
          done();
        });
    });
    it('should throw error if user tries to create cluster of less than 2 members', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          name: 'agape movers',
          description: 'group borrowing of money for large projects',
          type: 'public',
          maximum_members: 1,
          minimum_monthly_income: 45000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('maximum_members must be greater than or equal to 2');
          done();
        });
    });
    it('should create a public cluster for user one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          name: 'agape movers',
          description: 'group borrowing of money for large projects',
          type: 'public',
          maximum_members: 2,
          minimum_monthly_income: 45000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CLUSTER_CREATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('join_cluster_closes_at');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.maximum_members).to.equal(2);
          process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID = res.body.data.cluster_id;
          process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_UNIQUE_CODE = res.body.data.unique_code;
          done();
        });
    });
    it('should throw error if cluster name already exists', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          name: 'Seedfi movers',
          description: 'group borrowing of money for medium projects',
          type: 'private',
          maximum_members: 5,
          loan_goal_target: 900000,
          minimum_monthly_income: 100000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_NAME_ALREADY_EXISTING('Seedfi movers'));
          done();
        });
    });
    it('should create a private cluster for user one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          name: 'Highfliers Loaners',
          description: 'group borrowing of money for large projects',
          type: 'private',
          maximum_members: 3,
          loan_goal_target: 1000000,
          minimum_monthly_income: 100000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CLUSTER_CREATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('join_cluster_closes_at');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.maximum_members).to.equal(3);
          process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID = res.body.data.cluster_id;
          process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_UNIQUE_CODE = res.body.data.unique_code;
          done();
        });
    });
    it('should create another public cluster for user two successfully', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          name: 'Unique lenders',
          description: 'group borrowing of money for large projects',
          type: 'public',
          maximum_members: 2,
          minimum_monthly_income: 30000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CLUSTER_CREATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('join_cluster_closes_at');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.maximum_members).to.equal(2);
          process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_TWO_CLUSTER_ID = res.body.data.cluster_id;
          process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_TWO_CLUSTER_UNIQUE_CODE = res.body.data.unique_code;
          done();
        });
    });
  });
  describe('user fetches clusters', () => {
    it('should throw error if token is not sent', (done) => {
      chai.request(app)
        .get('/api/v1/cluster')
        .set({
          'Content-Type': 'application/json'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNAUTHORIZED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Please provide a token');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if type is not sent', (done) => {
      chai.request(app)
        .get('/api/v1/cluster')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('type is required');
          done();
        });
    });
    it('should throw error if invalid token is sent', (done) => {
      chai.request(app)
        .get('/api/v1/cluster')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}yhghretruftg`
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
    it('should throw error if invalid type is sent', (done) => {
      chai.request(app)
        .get('/api/v1/cluster')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'explorer'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('type must be one of [explore, my cluster, created]');
          done();
        });
    }); 
    it('should fetch all clusters successfully', (done) => {
      chai.request(app)
        .get('/api/v1/cluster')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'explore'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CLUSTER_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data[0]).to.have.property('cluster_id');
          expect(res.body.data[0]).to.have.property('type');
          expect(res.body.data[0].maximum_members).to.equal(3);
          done();
        });
    });
    it('should fetch a user clusters successfully', (done) => {
      chai.request(app)
        .get('/api/v1/cluster')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'my cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CLUSTER_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data[0]).to.have.property('cluster_id');
          expect(res.body.data[0]).to.have.property('type');
          expect(res.body.data[0].maximum_members).to.equal(2);
          done();
        });
    });
    it('should fetch a user created clusters successfully', (done) => {
      chai.request(app)
        .get('/api/v1/cluster')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          type: 'created'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CLUSTER_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data[0]).to.have.property('cluster_id');
          expect(res.body.data[0]).to.have.property('type');
          expect(res.body.data[0].maximum_members).to.equal(3);
          done();
        });
    });
  });
  describe('user fetches cluster details', () => {
    it('should throw error if id is not sent', (done) => {
      chai.request(app)
        .get('/api/v1/cluster/details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_NOT_FOUND);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('Resource Not Found');
          done();
        });
    });
    it('should throw error if invalid token is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}hfjdhgsfs`
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
    it('should throw error if invalid cluster id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}ygt789/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTER_NOT_EXISTING);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if token is not sent', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/details`)
        .set({
          'Content-Type': 'application/json'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNAUTHORIZED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Please provide a token');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should fetch cluster details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CLUSTER_DETAILS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('type');
          expect(res.body.data.maximum_members).to.equal(3);
          done();
        });
    });
  });
  describe('invite cluster member', () => {
    it('Should successfully invite cluster member', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/invite-member/`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          type: 'email',
          email: process.env.SEEDFI_USER_TWO_EMAIL,
          link_url: 'sdfghjhgfdsdfdfghjkjhgfdsertghjm'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.message).to.equal(enums.INVITE_CLUSTER_MEMBER);
          done();
        });
    });
    it('Should successfully invite cluster member with phone number', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/invite-member/`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({ 
          type: 'phone_number',
          phone_number: process.env.SEEDFI_USER_FOUR_PHONE_NUMBER,
          link_url: 'sdfghjhgfdsdfdfghjkjhgfdsertghjm'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.message).to.equal(enums.INVITE_CLUSTER_MEMBER);
          done();
        });
    });
    it('Should successfully invite none existing cluster member by email', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/invite-member/`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          type: 'email',
          email: 'test@gmail.com',
          link_url: 'sdfghjhgfdsdfdfghjkjhgfdsertghjm'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_MEMBER_INVITATION('email'));
          done();
        });
    });
    it('Should successfully invite none existing cluster member by phone_number', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/invite-member/`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          type: 'phone_number',
          phone_number: '+2349075743312',
          link_url: 'sdfghjhgfdsdfdfghjkjhgfdsertghjm'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_MEMBER_INVITATION('phone_number'));
          done();
        });
    });
    it('Should successfully invite none existing cluster member by phone_number', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/invite-member/`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          type: 'phone_number',
          phone_number: '+2348044332213',
          link_url: 'sdfghjhgfdsdfdfghjkjhgfdsertghjm'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_MEMBER_INVITATION('phone_number'));
          done();
        });
    });
    it('Should flag when try to invite with wrong cluster id', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}0/invite-member/`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          type: 'phone_number',
          phone_number: '+2349075743312',
          link_url: 'sdfghjhgfdsdfdfghjkjhgfdsertghjm'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('Cluster does not exist');
          done();
        });
    });
  });
  describe('user joins cluster based on invitation', () => {
    it('should throw error if user has not verified email', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
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
    it('should throw error if user has not uploaded selfie image', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
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
    it('should throw error if user has not verified BVN', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
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
    it('should throw error if user is already a cluster member', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CONFLICT);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_ALREADY_CLUSTER_MEMBER);
          done();
        });
    });
    it('should throw error if cluster does not exist', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}tyt8uh/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'no'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_NOT_EXISTING);
          done();
        });
    });
    it('should throw error if cluster invitation does not exist for user', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_NO_CLUSTER_INVITATION('highfliers loaners'));
          done();
        });
    });
    it('should throw error if cluster is a private cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_TYPE_NOT_PUBLIC_OR_PRIVATE('private'));
          done();
        });
    });
    it('should successfully accept cluster invite', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.message).to.equal(enums.JOIN_CLUSTER_DECISION_CHOICE('accepted'));
          done();
        });
    });
    it('Should if flag if none admin try performing action', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/invite-member/`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          type: 'email',
          email: 'balabluw@gmail.com',
          link_url: 'sdfghjhgfdsdfdfghjkjhgfdsertghjm'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CONFLICT);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_MEMBER_NOT_ADMIN);
          done();
        });
    });
  });
  describe('user requests to join cluster', () => {
    it('should throw error if user has not verified email', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FIVE_ACCESS_TOKEN}`
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
    it('should throw error if user has not uploaded selfie image', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_FOUR_ACCESS_TOKEN}`
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
    it('should throw error if user has not verified BVN', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_UNIQUE_CODE}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_SIX_ACCESS_TOKEN}`
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
    it('should throw error if user income range has not been filled in profile', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.UPDATE_INCOME_RANGE_FOR_ACTION_PERFORMANCE);
          done();
        });
    });
    it('should update user three monthly income successfully', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          employment_type: 'unemployed',
          income_range: '0 - 20000'
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
    it('should throw error if user is already a cluster member', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_UNIQUE_CODE}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CONFLICT);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_ALREADY_CLUSTER_MEMBER);
          done();
        });
    });
    it('should throw error if user income range is lower than cluster minimum income', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_MINIMUM_INCOME_GREATER_THAN_USER_MINIMUM_INCOME_EXISTING);
          done();
        });
    });
    it('should throw error if cluster does not exist', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_UNIQUE_CODE}tyt8uh/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_NOT_EXISTING);
          done();
        });
    });
    it('should request to join user two public cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_UNIQUE_CODE}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_TO_JOIN_CLUSTER_SENT_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('ticket_id');
          expect(res.body.data).to.have.property('decision_type');
          expect(res.body.data.decision_type).to.equal('join cluster');
          process.env.SEEDFI_USER_ONE_JOIN_USER_TWO_PUBLIC_CLUSTER_ONE_TICKET_ID = res.body.data.ticket_id;
          done();
        });
    });
    it('should request to join user two public cluster two', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_TWO_CLUSTER_ID}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_TO_JOIN_CLUSTER_SENT_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('ticket_id');
          expect(res.body.data).to.have.property('decision_type');
          expect(res.body.data.decision_type).to.equal('join cluster');
          process.env.SEEDFI_USER_ONE_JOIN_USER_TWO_PUBLIC_CLUSTER_TWO_TICKET_ID = res.body.data.ticket_id;
          done();
        });
    });
    it('should throw error if request to join cluster has been raised and not concluded', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CONFLICT);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_HAS_PREVIOUSLY_RAISED_REQUEST_CLUSTER_TICKET('join'));
          done();
        });
    });
  });
  describe('user decides on another user request to join cluster', () => {
    it('should throw error when invalid cluster type is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_JOIN_USER_TWO_PUBLIC_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          decision: 'maybe'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('decision must be one of [yes, no]');
          done();
        });
    });
    it('should throw error if cluster request to join ticket does not exist', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_JOIN_USER_TWO_PUBLIC_CLUSTER_ONE_TICKET_ID}jkmhijkjl/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          decision: 'no'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_DECISION_TICKET_NOT_EXISTING);
          done();
        });
    });
    it('should throw error if user does not belong to cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_JOIN_USER_TWO_PUBLIC_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_NOT_CLUSTER_MEMBER);
          done();
        });
    });
    it('should accept request to join user two public cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_JOIN_USER_TWO_PUBLIC_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_TO_JOIN_CLUSTER_DECISION('accepted'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should reject request to join user two public cluster two', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_JOIN_USER_TWO_PUBLIC_CLUSTER_TWO_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          decision: 'no'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_TO_JOIN_CLUSTER_DECISION('declined'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if request to join cluster ticket has been concluded', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_JOIN_USER_TWO_PUBLIC_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          decision: 'no'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.VOTING_DECISION_ALREADY_CONCLUDED);
          done();
        });
    });
  });
  describe('another user decides to request to join cluster', () => {
    it('should update user three monthly income successfully', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          employment_type: 'employed',
          income_range: '0 - 300000'
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
    it('user three should request to join user two public cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_TO_JOIN_CLUSTER_SENT_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('ticket_id');
          expect(res.body.data).to.have.property('decision_type');
          expect(res.body.data.decision_type).to.equal('join cluster');
          process.env.SEEDFI_USER_THREE_JOIN_USER_TWO_PUBLIC_CLUSTER_ONE_TICKET_ID = res.body.data.ticket_id;
          done();
        });
    });
    it('user two should accept request to join user two public cluster by user three', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_THREE_JOIN_USER_TWO_PUBLIC_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_TO_JOIN_CLUSTER_DECISION('accepted'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if request to join cluster decision has been taken by user', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_THREE_JOIN_USER_TWO_PUBLIC_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          decision: 'no'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_PREVIOUSLY_DECIDED);
          done();
        });
    });
    it('user one should accept request to join user two public cluster by user three', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_THREE_JOIN_USER_TWO_PUBLIC_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_TO_JOIN_CLUSTER_DECISION('accepted'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if request to join cluster ticket has been concluded', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_THREE_JOIN_USER_TWO_PUBLIC_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'no'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.VOTING_DECISION_ALREADY_CONCLUDED);
          done();
        });
    });
  });
  describe('another user decides to request to join cluster', () => {
    it('should request to join user one public cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_TO_JOIN_CLUSTER_SENT_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('ticket_id');
          expect(res.body.data).to.have.property('decision_type');
          expect(res.body.data.decision_type).to.equal('join cluster');
          process.env.SEEDFI_USER_TWO_JOIN_USER_ONE_PUBLIC_CLUSTER_ONE_TICKET_ID = res.body.data.ticket_id;
          done();
        });
    });
    it('user one should accept request to join user one public cluster by user two', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_JOIN_USER_ONE_PUBLIC_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_TO_JOIN_CLUSTER_DECISION('accepted'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('user three should request to join user one public cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/request-to-join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_CLOSED_FOR_MEMBERSHIP);
          done();
        });
    });
    it('Should flag when cluster is filled up and admin wants to invite member', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/invite-member/`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          type: 'phone_number',
          phone_number: '+2349075743312',
          link_url: 'sdfghjhgfdsdfdfghjkjhgfdsertghjm'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_CLOSED_FOR_MEMBERSHIP);
          done();
        });
    });
  });
  describe('user eight and nine should sign up based on cluster invitation', () => {
    it('Should create user eight successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2349075743312'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal( '+2349075743312');
          process.env.SEEDFI_USER_EIGHT_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_EIGHT_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_EIGHT_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should create user nine successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send({
          phone_number: '+2349067749313'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ACCOUNT_CREATED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.phone_number).to.equal( '+2349067749313');
          process.env.SEEDFI_USER_NINE_USER_ID = res.body.data.user_id;
          process.env.SEEDFI_USER_NINE_PHONE_NUMBER = res.body.data.phone_number;
          process.env.SEEDFI_USER_NINE_VERIFICATION_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should verify user eight phone number successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: process.env.SEEDFI_USER_EIGHT_VERIFICATION_OTP,
          fcm_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_VERIFIED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_phone_number).to.equal(true);
          expect(res.body.data.phone_number).to.equal(process.env.SEEDFI_USER_EIGHT_PHONE_NUMBER);
          process.env.SEEDFI_USER_EIGHT_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_EIGHT_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_EIGHT_REFERRAL_CODE = res.body.data.referral_code;
          done();
        });
    });
    it('Should verify user nine phone number successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/verify-phone-number')
        .send({
          otp: process.env.SEEDFI_USER_NINE_VERIFICATION_OTP,
          fcm_token: Hash.generateRandomString(20)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_ACCOUNT_VERIFIED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('inactive');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_phone_number).to.equal(true);
          expect(res.body.data.phone_number).to.equal(process.env.SEEDFI_USER_NINE_PHONE_NUMBER);
          process.env.SEEDFI_USER_NINE_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_NINE_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_NINE_REFERRAL_CODE = res.body.data.referral_code;
          done();
        });
    });
    it('Should complete user eight profile successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_EIGHT_ACCESS_TOKEN}`
        })
        .send({
          ...userEightProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_PROFILE_COMPLETED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.gender).to.equal('female');
          done();
        });
    });
    it('Should complete user nine profile successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/complete-profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          ...userNineProfile,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_PROFILE_COMPLETED);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.gender).to.equal('male');
          done();
        });
    });
    it('Should log user nine in successfully', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userNineProfile.email,
          password
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_LOGIN_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('tokenExpireAt');
          expect(res.body.data.status).to.equal('active');
          expect(res.body.data.is_completed_kyc).to.equal(true);
          process.env.SEEDFI_USER_NINE_ACCESS_TOKEN = res.body.data.token;
          process.env.SEEDFI_USER_NINE_REFRESH_TOKEN = res.body.data.refresh_token;
          process.env.SEEDFI_USER_NINE_EMAIL = res.body.data.email;
          done();
        });
    });
    it('should upload selfie for user nine successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/upload-selfie')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          image_url: 'https://enyata.com'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_SELFIE_IMAGE_UPDATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_verified_bvn');
          expect(res.body.data).to.have.property('is_completed_kyc');
          expect(res.body.data.tier).to.equal(0);
          expect(res.body.data.is_verified_bvn).to.equal(false);
          expect(res.body.data.is_uploaded_selfie_image).to.equal(true);
          done();
        });
    });
    it('should throw error if user has not verified email', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
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
    it('Should send a verify otp email', (done) => {
      chai.request(app)
        .post('/api/v1/user/request-email-verification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          email: process.env.SEEDFI_USER_NINE_EMAIL
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REQUEST_EMAIL_VERIFICATION);
          process.env.SEEDFI_USER_NINE_VERIFY_EMAIL_OTP = res.body.data.otp;
          done();
        });
    });
    it('Should successfully verify user email', (done) => {
      chai.request(app)
        .get('/api/v1/user/verify-email')
        .query({
          verifyValue: process.env.SEEDFI_USER_NINE_VERIFY_EMAIL_OTP
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Email verified successfully.');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if user has not verified BVN', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
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
    it('should verify bvn for user nine successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/verify-bvn')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          bvn: Helpers.generateElevenDigits()
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_BVN_VERIFIED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_verified_bvn');
          expect(res.body.data).to.have.property('is_completed_kyc');
          expect(res.body.data.tier).to.equal(1);
          expect(res.body.data.is_verified_bvn).to.equal(true);
          done();
        });
    });
    it('should throw error if user income range has not been filled in profile', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.UPDATE_INCOME_RANGE_FOR_ACTION_PERFORMANCE);
          done();
        });
    });
    it('should update user nine profile successfully', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          employment_type: 'employed',
          marital_status: 'married',
          number_of_dependents: '3',
          income_range: '1,000 - 5,000'
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
    it('should throw error if user income range is lower than cluster minimum income', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_MINIMUM_INCOME_GREATER_THAN_USER_MINIMUM_INCOME_EXISTING);
          done();
        });
    });
    it('should update user nine profile successfully', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          income_range: '100,000 - 500,000'
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
    it('Should create user nine pin.', (done) => {
      chai.request(app)
        .post('/api/v1/auth/pin')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          pin: '0908'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CREATED);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CREATE_PIN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should successfully accept cluster invite', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/join`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.message).to.equal(enums.JOIN_CLUSTER_DECISION_CHOICE('accepted'));
          done();
        });
    });
  });
  describe('suggest a new cluster admin and accept adminship', () => {
    it('should suggest new admin for cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/admin/${process.env.SEEDFI_USER_TWO_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.SELECT_NEW_ADMIN);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('ticket_id');
          process.env.SEEDFI_SUGGEST_ADMIN_CLUSTER_TWO_TICKET_ID = res.body.data.ticket_id;
          done();
        });
    });
    it('should flag if user is not a member of the cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/admin/${process.env.SEEDFI_USER_SIX_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('User does not belong to this cluster');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('user should vote to accept admin cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_SUGGEST_ADMIN_CLUSTER_TWO_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CLUSTER_ADMIN_ACCEPTANCE('accepted'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if user already accepted cluster adminship responsibility', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_SUGGEST_ADMIN_CLUSTER_TWO_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          decision: 'no'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.VOTING_DECISION_ALREADY_CONCLUDED);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('initiate a delete cluster and vote to delete cluster', () => {
    it('should initiate to delete a cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/initiate-delete-cluster`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          deletion_reason: 'wait for some action'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.INITIATE_DELETE_CLUSTER);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('ticket_id');
          expect(res.body.data).to.have.property('decision_type');
          expect(res.body.data.decision_type).to.equal('delete cluster');
          process.env.SEEDFI_DELETE_CLUSTER_ONE_TICKET_ID = res.body.data.ticket_id;
          done();
        });
    });
    it('should flag when cluster dose not exist', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}p0/initiate-delete-cluster`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          deletion_reason: 'wait for some action'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Cluster does not exist');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('user should decline to accept request to delete cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_DELETE_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          decision: 'no'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_CANNOT_TAKE_DECISION_ON_THIS_TICKET);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('user should vote to delete cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_DELETE_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'yes'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.CLUSTER_DELETED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should flag users that is not a cluster member', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_DELETE_CLUSTER_ONE_TICKET_ID}/voting-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'no'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('User does not belong to this cluster');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should flag when payload is not passed', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/initiate-delete-cluster`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('deletion_reason is required');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('user leaves a cluster', () => {
    it('should throw error if id is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/cluster/leave')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_NOT_FOUND);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('Resource Not Found');
          done();
        });
    });
    it('should throw error if invalid token is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/leave`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}yhghretruftg`
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
    it('should throw error if user is an admin', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/leave`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_IS_AN_ADMIN);
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('user should leave the cluster successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/leave`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_LEFT_CLUSTER_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('user should leave the cluster successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_TWO_CLUSTER_ID}/leave`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_LEFT_CLUSTER_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('user throw error if user has previously left the cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/leave`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_NOT_CLUSTER_MEMBER);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('user fetches cluster', () => {
    it('should throw error if id is not sent', (done) => {
      chai.request(app)
        .get('/api/v1/cluster/members')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_NOT_FOUND);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('Resource Not Found');
          done();
        });
    });
    it('should throw error if invalid token is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/members`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}yhghretruftg`
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
    it('should fetch members of a particular cluster successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/members`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTER_MEMBERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('user throw error if user does not belong to a cluster', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/members`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.USER_NOT_CLUSTER_MEMBER);
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('cluster admin edits cluster', () => {
    it('should throw error if id is not sent', (done) => {
      chai.request(app)
        .patch('/api/v1/cluster/edit')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_NOT_FOUND);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('Resource Not Found');
          done();
        });
    });
    it('should throw error if invalid token is sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/edit`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}yhghretruftg`
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
    it('should throw error if cluster does not exist', (done) => {
      chai.request(app)
        .patch(`/api/v1/cluster/${process.env.SEEDFI_USER_EIGHT_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/edit`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Cluster does not exist');
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if user is not a cluster admin', (done) => {
      chai.request(app)
        .patch(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/edit`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CONFLICT);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Cluster member is not an admin and can not perform this action');
          expect(res.body.error).to.equal('CONFLICT');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if user cluster minimum income is greater than user maximum monthly income', (done) => {
      chai.request(app)
        .patch(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/edit`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          maximum_members: 1
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('you can not edit maximum numbers');
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if there is more than one member on the cluster and you want to edit loan_goal_target', (done) => {
      chai.request(app)
        .patch(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/edit`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          loan_goal_target: 50000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('you can not edit loan goal target');
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if there is more than one member on the cluster and you want to edit minimum monthly income', (done) => {
      chai.request(app)
        .patch(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/edit`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          minimum_monthly_income: 35000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('you can not edit minimum monthly income');
          expect(res.body.error).to.equal('FORBIDDEN');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if the name sent is not unique in the DB', (done) => {
      chai.request(app)
        .patch(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/edit`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          name: 'unique lenders'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('A cluster with this name "unique lenders" already exists');
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should edit a cluster', (done) => {
      chai.request(app)
        .patch(`/api/v1/cluster/${process.env.SEEDFI_USER_TWO_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/edit`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          name: 'jagaban cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTER_EDITED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
});
