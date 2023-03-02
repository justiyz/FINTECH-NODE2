import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../src/app';
import enums from '../../src/users/lib/enums';

const { expect } = chai;
chai.use(chaiHttp);

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
          loan_goal_target: 500000,
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
          loan_goal_target: 500000,
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
          loan_goal_target: 500000,
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
          loan_goal_target: 500000,
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
          type: 'public',
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
          type: 'public',
          maximum_members: 3,
          loan_goal_target: 500000,
          minimum_monthly_income: 500
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.UPDATE_INCOME_RANGE_FOR_CLUSTER_CREATION);
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
          description: 'group borrowing of money for small projects',
          type: 'public',
          maximum_members: 3,
          loan_goal_target: 500000,
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
          maximum_members: 2,
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
          expect(res.body.data.maximum_members).to.equal(2);
          process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID = res.body.data.cluster_id;
          done();
        });
    });
  });
  describe('user fetches clusters', () => {
    it('should throw error if token is not sent', (done) => {
      chai.request(app)
        .get('/api/v1/cluster/fetch-clusters')
        .set({
          'Content-Type': 'application/json'
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
    it('should throw error if type is not sent', (done) => {
      chai.request(app)
        .get('/api/v1/cluster/fetch-clusters')
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
        .get('/api/v1/cluster/fetch-clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}yhghretruftg`
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
    it('should throw error if invalid type is sent', (done) => {
      chai.request(app)
        .get('/api/v1/cluster/fetch-clusters')
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
        .get('/api/v1/cluster/fetch-clusters')
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
          expect(res.body.data[0].maximum_members).to.equal(2);
          process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID = res.body.data[0].cluster_id;
          done();
        });
    });
    it('should fetch a user clusters successfully', (done) => {
      chai.request(app)
        .get('/api/v1/cluster/fetch-clusters')
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
          process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID = res.body.data[0].cluster_id;
          done();
        });
    });
    it('should fetch a user created clusters successfully', (done) => {
      chai.request(app)
        .get('/api/v1/cluster/fetch-clusters')
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
          expect(res.body.data[0].maximum_members).to.equal(2);
          process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID = res.body.data[0].cluster_id;
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
        .get('/api/v1/cluster/process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID/details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}hfjdhgsfs`
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
    it('should throw error if token is not sent', (done) => {
      chai.request(app)
        .get('/api/v1/cluster/process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID/details')
        .set({
          'Content-Type': 'application/json'
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
          expect(res.body.data.maximum_members).to.equal(2);
          done();
        });
    });
  });
});
