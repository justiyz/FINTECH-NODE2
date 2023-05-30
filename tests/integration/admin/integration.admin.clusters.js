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
          maximum_members: 2,
          company_name: 'baba tunde',
          company_address: 'enyata road off wire',
          company_type: 'ltd',
          company_contact_number: '+2349073751133',
          interest_type: 'fixed',
          percentage_interest_type_value: '3'
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
          maximum_members: 2,
          company_name: 'baba tunde',
          company_address: 'enyata road off wire',
          company_type: 'ltd',
          company_contact_number: '+2349073751133',
          interest_type: 'fixed',
          percentage_interest_type_value: '3'
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
          company_name: 'baba tunde',
          company_address: 'enyata road off wire',
          company_type: 'ltd',
          company_contact_number: '+2349073751133',
          interest_type: 'fixed',
          percentage_interest_type_value: '3'
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
          maximum_members: 'seven',
          loan_goal_target: 500000,
          company_name: 'baba tunde',
          company_address: 'enyata road off wire',
          company_type: 'ltd',
          company_contact_number: '+2349073751133',
          interest_type: 'fixed',
          percentage_interest_type_value: '3'
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
          maximum_members: 3,
          loan_goal_target: 500000,
          company_name: 'baba tunde',
          company_address: 'enyata road off wire',
          company_type: 'ltd',
          company_contact_number: '+2349073751133',
          interest_type: 'fixed',
          percentage_interest_type_value: '3'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('loan_status');
          expect(res.body.data).to.have.property('name');
          process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID = res.body.data.cluster_id;
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
          maximum_members: 10,
          loan_goal_target: 600000,
          company_name: 'rashidat ltd',
          company_address: 'enyata road off wire',
          company_type: 'ltd',
          company_contact_number: '+2349073751133',
          interest_type: 'fixed',
          percentage_interest_type_value: '3'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('loan_status');
          expect(res.body.data).to.have.property('name');
          expect(res.body.message).to.equal('Cluster created successfully');
          process.env.SEEDFI_ADMIN_CLUSTER_ID_TWO = res.body.data.cluster_id;
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
  describe('Admin invite cluster member', () => {
    it('should successfully invite none existing user', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/invite`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'email',
          email: 'miracle@enyata.com'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.message).to.equal(enums.ADMIN_CLUSTER_MEMBER_INVITE);
          done();
        });
    });
    it('should successfully invite an existing user', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/invite`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'email',
          email: process.env.SEEDFI_USER_TWO_EMAIL
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('invitee');
          expect(res.body.message).to.equal(enums.ADMIN_CLUSTER_MEMBER_INVITE);
          done();
        });
    });
    it('should successfully invite an existing user by phone number', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/invite`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'phone_number',
          phone_number: '+2349067749313'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('invitee');
          expect(res.body.message).to.equal(enums.ADMIN_CLUSTER_MEMBER_INVITE);
          done();
        });
    });
    it('should successfully accept admin cluster invite', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/join`)
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
    it('Should flag when try to invite with wrong cluster id', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}p/invite`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'email',
          email: 'test@gamil.com'
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
    it('should throw error if a field is missing', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/invite`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({})
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('type is required');
          done();
        });
    });
    it('should flag if user is already existing in the cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/invite`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'email',
          email: process.env.SEEDFI_USER_TWO_EMAIL
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
    it('should invite a cluster member successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ADMIN_CLUSTER_ID_TWO}/invite`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'phone_number',
          phone_number: '+234830180909'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('cluster_id');
          expect(res.body.data).to.have.property('invitation_mode');
          expect(res.body.message).to.equal(enums.ADMIN_CLUSTER_MEMBER_INVITE);
          done();
        });
    });
    it('should successfully invite bulk members with email', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ADMIN_CLUSTER_ID_TWO}/invite/bulk`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'email',
          data: [
            {email: 'miracle1@enyata.com'},
            {email: 'miracle2@enyata.com'},
            {email: 'miracle3@enyata.com'},
            {email: 'miracle4@enyata.com'},
            {email: 'miracle5@enyata.com'},
            {email: 'miracle6@enyata.com'},
            {email: 'miracle7@enyata.com'},
            {email: 'miracle8@enyata.com'},
            {email: 'miracle12@enyata.com'},
            {email: process.env.SEEDFI_USER_TWO_EMAIL}
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_CLUSTER_MEMBER_INVITE);
          done();
        });
    });
    it('should successfully invite bulk members with phone number', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ADMIN_CLUSTER_ID_TWO}/invite/bulk`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'phone_number',
          data: [
            {phone_number: '+2348072132241'},
            {phone_number: '+2348072132242'},
            {phone_number: '+2348072132243'},
            {phone_number: '+2348072132244'},
            {phone_number: '+2348072132245'},
            {phone_number: '+2348072132246'},
            {phone_number: '+2348072132247'},
            {phone_number: '+2348072132248'}
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_CLUSTER_MEMBER_INVITE);
          done();
        });
    });
    it('should successfully invite bulk members with phone number', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/invite/bulk`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'phone_number',
          data: [
            {phone_number: '+2348072132241'},
            {phone_number: '+2348072132242'},
            {phone_number: '+2348072132243'},
            {phone_number: '+2348072132244'},
            {phone_number: '+2348072132245'},
            {phone_number: '+2348072132246'},
            {phone_number: '+2348072132247'},
            {phone_number: '+2348072132248'}
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ADMIN_CLUSTER_MEMBER_INVITE);
          done();
        });
    });
    it('should throw error if user try to join uninvited', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_ADMIN_CLUSTER_ID_TWO}/join`)
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
          expect(res.body.message).to.equal('User has no active invitation from enyata developers cluster cluster');
          done();
        });
    });
  });
  describe('Admin activate and deactivate cluster', () => {
    it('should flag error if cluster current status is same a what is being sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/status`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'active'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_STATUS_SAME_AS_STATUS_ACTION('active'));
          done();
        });
    });
    it('should successfully deactivated cluster', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/status`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'deactivated'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.message).to.equal('admin successfully deactivated enyata admin cluster cluster');
          done();
        });
    });
    it('should flag error if cluster current status is same a what is being sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/status`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'deactivated'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_STATUS_SAME_AS_STATUS_ACTION('deactivated'));
          done();
        });
    });
    it('should successfully activate cluster', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/status`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'active'
        })
        .end((err, res) => {

          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.message).to.equal('admin successfully active enyata admin cluster cluster');
          done();
        });
    });
    it('should flag if cluster does not exist', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}p/status`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          status: 'active'
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
  describe('Admin deletes cluster member', () => {
    it('should successfully delete cluster member', (done) => {
      chai.request(app)
        .delete(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/member/${process.env.SEEDFI_USER_TWO_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('is_left');
          expect(res.body.message).to.equal(enums.ADMIN_DELETES_CLUSTER_MEMBER);
          done();
        });
    });
    it('should flag if cluster does not exist', (done) => {
      chai.request(app)
        .delete(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}78549/member/${process.env.SEEDFI_USER_TWO_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
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
    it('should flag if cluster member does not exist', (done) => {
      chai.request(app)
        .delete(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/member/${process.env.SEEDFI_USER_TWO_USER_ID}0`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.ACCOUNT_NOT_EXIST('user'));
          done();
        });
    });
    it('should flag if user does not belong to cluster', (done) => {
      chai.request(app)
        .delete(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/member/${process.env.SEEDFI_USER_THREE_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_MEMBER_NOT_EXISTING);
          done();
        });
    });
  });
});
