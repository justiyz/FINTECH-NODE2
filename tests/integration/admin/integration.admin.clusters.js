import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';

const { expect } = chai;
chai.use(chaiHttp);

describe('Clusters', () => {
  describe('Admin creates clusters', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .post('/api/v1/admin/cluster/create')
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
        .post('/api/v1/admin/cluster/create')
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
    it('should throw error when cluster name is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          description: 'group borrowing of money for small projects',
          type: 'private',
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
    it('should throw error when cluster description is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Enyata admin cluster',
          type: 'private',
          maximum_members: 2,
          minimum_monthly_income: 45000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('description is required');
          done();
        });
    });
    it('should throw error when cluster type is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Enyata admin cluster',
          description: 'group borrowing of money for small projects',
          maximum_members: 2,
          minimum_monthly_income: 45000
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
    it('should throw error when maximum members is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Enyata admin cluster',
          description: 'group borrowing of money for small projects',
          type: 'private',
          minimum_monthly_income: 45000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('maximum_members is required');
          done();
        });
    });
    it('should throw error when minimum monthly income is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Enyata admin cluster',
          description: 'group borrowing of money for small projects',
          type: 'private',
          loan_goal_target: '200000',
          maximum_members: 2
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('minimum_monthly_income is required');
          done();
        });
    });
    it('should throw error when invalid maximum members is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Enyata admin cluster',
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
        .post('/api/v1/admin/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Enyata admin cluster',
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
          expect(res.body.message).to.equal('type must be [private]');
          done();
        });
    });
    it('should create cluster one successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Enyata admin cluster',
          description: 'group borrowing of money for small projects',
          type: 'private',
          maximum_members: 3,
          loan_goal_target: 500000,
          minimum_monthly_income: 45000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('loan_status');
          expect(res.body.data).to.have.property('name');
          res.body.data.cluster_id = process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID;
          expect(res.body.message).to.equal('Cluster created successfully');
          done();
        });
    });
    it('should create cluster two successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Enyata developers cluster',
          description: 'group borrowing of money for large projects',
          type: 'private',
          maximum_members: 10,
          loan_goal_target: 600000,
          minimum_monthly_income: 56000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('loan_status');
          expect(res.body.data).to.have.property('name');
          res.body.data.cluster_id = process.env.SEEDFI_ENYATA_DEVELOPERS_CLUSTER_ID;
          expect(res.body.message).to.equal('Cluster created successfully');
          done();
        });
    });
    
  });
  describe('Admin fetches, filters and searches clusters', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/cluster/clusters')
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
        .get('/api/v1/admin/cluster/clusters')
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
    it('Should fetch all clusters', (done) => {
      chai.request(app)
        .get('/api/v1/admin/cluster/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch cluster by the cluster name', (done) => {
      chai.request(app)
        .get('/api/v1/admin/cluster/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          search: 'Enyata admin cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter clusters by the cluster loan with pagination', (done) => {
      chai.request(app)
        .get('/api/v1/admin/cluster/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          page: '1',
          per_page: '1',
          search: 'Enyata admin cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter clusters by the status ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/cluster/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          status: 'active'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter clusters by the loan status ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/cluster/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          loan_status: 'inactive'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter clusters by the loan status with pagination', (done) => {
      chai.request(app)
        .get('/api/v1/admin/cluster/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          page: '1',
          per_page: '1',
          loan_status: 'inactive'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTERS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('Admin fetches single cluster details', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/details`)
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
        .get(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/details`)
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
    it('Should fetch single cluster details', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTER__DETAILS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
});
