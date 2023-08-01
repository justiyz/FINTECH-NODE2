/* eslint-disable max-len */
import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';
import * as Hash from '../../../src/users/lib/utils/lib.util.hash';
import { receiveChargeSuccessWebHookOneUserTwo, receiveRefundSuccessWebHook, 
  receiveTransferSuccessWebHookTwo, receiveTransferSuccessWebHookOne, receiveTransferFailedWebHookOne,
  receiveChargeSuccessWebHookTwo
} from '../../payload/payload.payment';

const { expect } = chai;
chai.use(chaiHttp);

const pin = '0908';
const userOnePin = '2020';

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
          percentage_interest_type_value: '30'
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

    it('should throw error when cluster name already exists', (done) => {
      chai.request(app)
        .post('/api/v1/admin/cluster/create')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Enyata admin cluster',
          description: 'group borrowing of money for large projects',
          maximum_members: 2,
          company_name: 'baba tunde',
          company_address: 'enyata road off wire',
          loan_goal_target: 500000,
          company_type: 'ltd',
          company_contact_number: '+2349073751133',
          interest_type: 'fixed',
          percentage_interest_type_value: '3'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('A cluster with this name "Enyata admin cluster" already exists');
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
          interest_type: 'discount',
          percentage_interest_type_value: '40'
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
    it('Should fetch admin created clusters with pagination if type is admin_cluster', (done) => {
      chai.request(app)
        .get('/api/v1/admin/cluster/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          page: '1',
          per_page: '1',
          type: 'admin_cluster'
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
    it('should throw error if not admin created cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/invite`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'phone_number',
          phone_number: '+2349067749313'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.ADMIN_CLUSTER_RESTRICTED_ACTION);
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
    it('should successfully accept admin cluster invite', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/join`)
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
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ADMIN_CLUSTER_ID_TWO}/bulk-invite`)
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
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ADMIN_CLUSTER_ID_TWO}/bulk-invite`)
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
        .post(`/api/v1/admin/cluster/${process.env.SEEDFI_ENYATA_ADMIN_CLUSTER_ID}/bulk-invite`)
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
    it('should throw error if not admin created cluster', (done) => {
      chai.request(app)
        .delete(`/api/v1/admin/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/member/${process.env.SEEDFI_USER_TWO_USER_ID}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.ADMIN_CLUSTER_RESTRICTED_ACTION);
          done();
        });
    });
  });
  describe('User nine applies for loan', () => {
    it('should update user nine profile successfully', (done) => {
      chai.request(app)
        .put('/api/v1/user/profile')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          marital_status: 'single',
          number_of_children: '1'
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
    it('should save account details for user nine successfully', (done) => {
      chai.request(app)
        .post('/api/v1/user/settings/account-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          bank_name: 'Zenith Bank',
          account_number: '6032673208',
          bank_code: '055'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_SAVED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('account_number');
          expect(res.body.data).to.have.property('is_default');
          expect(res.body.data.is_default).to.equal(false);
          process.env.SEEDFI_USER_NINE_BANK_ACCOUNT_ID_ONE = res.body.data.id;
          done();
        });
    });
    it('should set user nine bank account one as default account', (done) => {
      chai.request(app)
        .patch(`/api/v1/user/settings/${process.env.SEEDFI_USER_NINE_BANK_ACCOUNT_ID_ONE}/account-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .query({
          type: 'default'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.BANK_ACCOUNT_CHOICE_UPDATED_SUCCESSFULLY('default'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('account_number');
          expect(res.body.data).to.have.property('is_default');
          expect(res.body.data.is_default).to.equal(true);
          done();
        });
    });
    it('should initiate card tokenization successfully for user 9', (done) => {
      chai.request(app)
        .get('/api/v1/payment/initiate-card-tokenization')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal('Authorization URL created');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_NINE_CARD_TOKENIZATION_PAYMENT_REFERENCE_ONE = res.body.data.reference;
          done();
        });
    });
    it('should successfully process card payment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookOneUserTwo(process.env.SEEDFI_USER_NINE_CARD_TOKENIZATION_PAYMENT_REFERENCE_ONE))
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
    it('should successfully process card payment refund successful for user 9 card tokenization', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveRefundSuccessWebHook(process.env.SEEDFI_USER_NINE_CARD_TOKENIZATION_PAYMENT_REFERENCE_ONE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.REFUND_STATUS_SAVED('processed'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });
    it('should update the fcm-token of user nine successfully', (done) => {
      chai.request(app)
        .patch('/api/v1/user/mono-account-id')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          mono_account_code: Hash.generateRandomString(5)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('mono_account_id');
          expect(res.body.data.user_id).to.equal(process.env.SEEDFI_USER_NINE_USER_ID);
          expect(res.body.message).to.equal(enums.UPDATE_USER_MONO_ID);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.is_default).to.equal(true);
          done();
        });
    });
    it('should apply for loan for user 9 successfully', (done) => {
      chai.request(app)
        .post('/api/v1/loan/application')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          amount: 100000,
          duration_in_months: 5,
          loan_reason: 'House rent'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_id');
          expect(res.body.data).to.have.property('fees');
          expect(res.body.data.loan_duration_in_months).to.equal('5');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_APPROVED_DECISION);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_USER_NINE_LOAN_APPLICATION_ONE_LOAN_ID = res.body.data.loan_id;
          done();
        });
    });
    it('should disburse loan for user nine successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_USER_NINE_LOAN_APPLICATION_ONE_LOAN_ID}/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
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
          process.env.SEEDFI_USER_NINE_LOAN_APPLICATION_TWO_DISBURSEMENT_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should receive user nine loan one webhook transfer success response successfully', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveTransferSuccessWebHookTwo(process.env.SEEDFI_USER_NINE_LOAN_APPLICATION_TWO_DISBURSEMENT_REFERENCE))
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
  describe('User one takes private cluster loan', () => {
    it('should throw error when loan duration is not sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 1000000,
          sharing_type: 'equal'
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
    it('should throw error if invalid total loan amount is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 'ma78ll',
          duration_in_months: 6,
          sharing_type: 'self-allocate'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('total_amount must be a number');
          done();
        });
    });
    it('should throw error if invalid sharing type is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 200000,
          duration_in_months: 3,
          sharing_type: 'manual-allocation'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('sharing_type must be one of [equal, self-allocate]');
          done();
        });
    });
    it('should throw error if invalid cluster id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}85895/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 200000,
          duration_in_months: 3,
          sharing_type: 'equal'
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
    it('should throw error if user not cluster member', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 200000,
          duration_in_months: 3,
          sharing_type: 'equal'
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
    it('should throw error if user not the cluster admin', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 200000,
          duration_in_months: 3,
          sharing_type: 'equal'
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
    it('should throw error if cluster is a public cluster', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 200000,
          duration_in_months: 3,
          sharing_type: 'equal'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_TYPE_NOT_PUBLIC_OR_PRIVATE('public'));
          done();
        });
    });
    it('should throw error if type self-allocate is sent and no amount is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_THREE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 200000,
          duration_in_months: 3,
          sharing_type: 'self-allocate'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('amount is required');
          done();
        });
    });
    it('should throw error if cluster has just one member', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_THREE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_THREE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 200000,
          duration_in_months: 3,
          sharing_type: 'self-allocate',
          amount: 150000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_MEMBERS_NOT_MORE_THAN_ONE);
          done();
        });
    });
    it('should throw error if total amount is greater than system allowable total cluster loan', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 2000000,
          duration_in_months: 3,
          sharing_type: 'equal'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_REQUESTS_FOR_CLUSTER_LOAN_AMOUNT_GREATER_THAN_ALLOWABLE);
          done();
        });
    });
    it('should throw error if total amount is lesser than system allowable total cluster loan', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 40000,
          duration_in_months: 3,
          sharing_type: 'equal'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_REQUESTS_FOR_CLUSTER_LOAN_AMOUNT_LESSER_THAN_ALLOWABLE);
          done();
        });
    });
    it('should initiate cluster loan for user one private cluster successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 1000000,
          duration_in_months: 6,
          sharing_type: 'equal'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_id');
          expect(res.body.data).to.have.property('fees');
          expect(res.body.data.loan_duration_in_months).to.equal('6');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_APPROVED_DECISION);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_LOAN_ID = res.body.data.loan_id;
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID = res.body.data.member_loan_id;
          done();
        });
    });
    it('should throw error if cluster has an inprogress loan and a new loan is to be initiated', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 1000000,
          duration_in_months: 6,
          sharing_type: 'equal'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('Cluster currently have a pending loan application, thus action cannot be performed');
          done();
        });
    });
  });
  describe('User one renegotiates cluster loan application', () => {
    it('should throw error when new loan amount is not sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/renegotiate`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({})
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('new_loan_amount is required');
          done();
        });
    });
    it('should throw error if invalid cluster member loan id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}dhdud/renegotiate`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          new_loan_amount: 300000
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
    it('should throw error if renegotiation amount is greater than user tier allowable', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/renegotiate`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          new_loan_amount: 7000000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.RENEGOTIATION_AMOUNT_GREATER_THAN_ALLOWABLE_AMOUNT);
          done();
        });
    });
    it('should throw error if renegotiation amount is lesser than user tier max allowable but greater than user max allowable', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/renegotiate`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          new_loan_amount: 400000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.RENEGOTIATION_AMOUNT_GREATER_THAN_ALLOWABLE_AMOUNT);
          done();
        });
    });
    it('should renegotiate cluster loan successfully for user one', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/renegotiate`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          new_loan_amount: 300000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_id');
          expect(res.body.data).to.have.property('fees');
          expect(res.body.data).to.have.property('max_allowable_amount');
          expect(res.body.data.loan_duration_in_months).to.equal('6');
          expect(res.body.data.max_allowable_amount).to.equal(null);
          expect(res.body.message).to.equal(enums.LOAN_RENEGOTIATION_SUCCESSFUL_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('Fetch cluster member loan details', () => {
    it('should fetch user nine current loans successfully', (done) => {
      chai.request(app)
        .get('/api/v1/loan/current-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data.currentPersonalLoans.length).to.equal(1);
          expect(res.body.data.currentClusterLoans.length).to.equal(1);
          expect(res.body.data.currentPersonalLoans[0].status).to.equal('ongoing');
          expect(res.body.data.currentClusterLoans[0].status).to.equal('pending');
          expect(res.body.message).to.equal(enums.USER_CURRENT_LOANS_FETCHED_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID = res.body.data.currentClusterLoans[0].member_loan_id;
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_REQUESTING_AMOUNT = res.body.data.currentClusterLoans[0].amount_requested;
          done();
        });
    });
    it('should throw error if invalid cluster member loan id', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}eyen/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
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
    it('should fetch details of user nine cluster loan successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('clusterLoanDetails');
          expect(res.body.data).to.have.property('clusterLoanRepaymentDetails');
          expect(res.body.data.clusterLoanRepaymentDetails.length).to.equal(0);
          expect(res.body.message).to.equal(enums.USER_LOAN_DETAILS_FETCHED_SUCCESSFUL('cluster'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_REQUESTING_AMOUNT = res.body.data.clusterLoanDetails.amount_requested;
          done();
        });
    });
  });
  describe('User nine runs eligibility check for private cluster loan', () => {
    it('should throw error when loan amount is not sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/eligibility-check`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({ })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('amount is required');
          done();
        });
    });
    it('should throw error if invalid loan amount is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/eligibility-check`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          amount: 'ma78ll'
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
    it('should throw error if invalid cluster member loan id', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}eyen/eligibility-check`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          amount: parseFloat(process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_REQUESTING_AMOUNT)
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
    it('should throw error if eligibility check is not run and user wants to accept offer', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/loan-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'accept'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_NO_ELIGIBILITY_CHECK_RESULT_CLUSTER_LOAN_DECISION);
          done();
        });
    });
    it('should run cluster loan eligibility check for user nine successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/eligibility-check`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          amount: parseFloat(process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_REQUESTING_AMOUNT)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_id');
          expect(res.body.data).to.have.property('fees');
          expect(res.body.data.loan_duration_in_months).to.equal('6');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_APPROVED_DECISION);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if cluster member has an inprogress loan and a new loan is to be initiated', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/eligibility-check`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          amount: parseFloat(process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_REQUESTING_AMOUNT)
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_FAILED_FOR_EXISTING_APPROVED_CLUSTER_LOAN_REASON);
          done();
        });
    });
    it('should renegotiate cluster loan successfully for user nine', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/renegotiate`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          new_loan_amount: 200000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_id');
          expect(res.body.data).to.have.property('fees');
          expect(res.body.data).to.have.property('max_allowable_amount');
          expect(res.body.data.loan_duration_in_months).to.equal('6');
          expect(res.body.data.max_allowable_amount).to.equal(null);
          expect(res.body.message).to.equal(enums.LOAN_RENEGOTIATION_SUCCESSFUL_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should fetch user nine homepage details successfully', (done) => {
      chai.request(app)
        .get('/api/v1/user/homepage')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
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
  describe('Take decision for cluster loan for private cluster loan one', () => {
    it('should throw error when decision is not sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/loan-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({ })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('decision is required');
          done();
        });
    });
    it('should throw error if invalid loan decision is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/loan-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'reject'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('decision must be one of [accept, decline]');
          done();
        });
    });
    it('should throw error if invalid cluster member loan id', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}eyen/loan-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'accept'
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
    it('should accept cluster one loan application initiation by user nine successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/loan-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'accept'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_ACCEPTANCE_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if cluster member has previously taken cluster loan decision', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/loan-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'accept'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_CONFLICT);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.USER_ALREADY_TAKEN_CLUSTER_LOAN_DECISION);
          done();
        });
    });
    it('should cancel loan application by user one the cluster admin', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/loan-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'decline'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_CANCELLING_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('approve cluster member loan application', () => {
    it('Should return error if non existing loan id is sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}yr7u/approve`)
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
        .patch(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/approve`)
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
        .patch(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/approve`)
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
        .patch(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/approve`)
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
        .patch(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/approve`)
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
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_STATUS('cancelled'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('decline cluster member loan application', () => {
    it('Should return error if non existing loan id is sent', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}yr7u/reject`)
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
        .patch(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/reject`)
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
        .patch(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/reject`)
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
        .patch(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/reject`)
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
        .patch(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/reject`)
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
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_STATUS('cancelled'));
          expect(res.body.error).to.equal('BAD_REQUEST');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  }); 
  describe('User one sets up another cluster loan', () => {
    it('should initiate another cluster loan for user one private cluster successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/initiation`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          total_amount: 500000,
          duration_in_months: 3,
          sharing_type: 'self-allocate',
          amount: 400000
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
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID = res.body.data.loan_id;
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_MEMBER_LOAN_ID = res.body.data.member_loan_id;
          done();
        });
    });
    it('should renegotiate cluster loan successfully for user one', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_MEMBER_LOAN_ID}/renegotiate`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          new_loan_amount: 300000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_id');
          expect(res.body.data).to.have.property('fees');
          expect(res.body.data).to.have.property('max_allowable_amount');
          expect(res.body.data.loan_duration_in_months).to.equal('3');
          expect(res.body.data.max_allowable_amount).to.equal(null);
          expect(res.body.message).to.equal(enums.LOAN_RENEGOTIATION_SUCCESSFUL_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should accept cluster one loan application initiation by user one successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_MEMBER_LOAN_ID}/loan-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'accept'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_ACCEPTANCE_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should fetch user nine current loans successfully', (done) => {
      chai.request(app)
        .get('/api/v1/loan/current-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data.currentPersonalLoans.length).to.equal(1);
          expect(res.body.data.currentClusterLoans.length).to.equal(1);
          expect(res.body.data.currentPersonalLoans[0].status).to.equal('ongoing');
          expect(res.body.data.currentClusterLoans[0].status).to.equal('pending');
          expect(res.body.message).to.equal(enums.USER_CURRENT_LOANS_FETCHED_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID = res.body.data.currentClusterLoans[0].member_loan_id;
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_REQUESTING_AMOUNT = res.body.data.currentClusterLoans[0].amount_requested;
          done();
        });
    });
    it('should fetch details of user nine cluster loan successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.USER_LOAN_DETAILS_FETCHED_SUCCESSFUL('cluster'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_REQUESTING_AMOUNT = res.body.data.amount_requested;
          done();
        });
    });
    it('should throw error for if loan application does not need renegotiation', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/renegotiate`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          new_loan_amount: 300000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.SYSTEM_MAXIMUM_ALLOWABLE_AMOUNT_HAS_NULL_VALUE);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if loan amount will cause to exceed total loan amount', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/eligibility-check`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          amount: 300000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('loan allocated amount will exceed cluster total loan, ₦200000.00 is still available for allocation');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should run cluster loan eligibility check for user nine successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/eligibility-check`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          amount: 200000
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
          done();
        });
    });
    it('should renegotiation renegotiate cluster loan successfully for user nine', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/renegotiate`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          new_loan_amount: 100000
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('loan_id');
          expect(res.body.data).to.have.property('fees');
          expect(res.body.data).to.have.property('max_allowable_amount');
          expect(res.body.data.loan_duration_in_months).to.equal('3');
          expect(res.body.data.max_allowable_amount).to.equal(null);
          expect(res.body.message).to.equal(enums.LOAN_RENEGOTIATION_SUCCESSFUL_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should accept cluster one loan application initiation by user nine successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/loan-decision`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          decision: 'accept'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_ACCEPTANCE_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('User one initiates loan disbursement for private cluster loan one', () => {
    it('should throw error when transaction pin is not sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID}/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({ })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('pin is required');
          done();
        });
    });
    it('should throw error if cluster is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}djdk/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID}/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          pin: userOnePin
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
    it('should throw error if not cluster admin is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID}/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .send({
          pin: userOnePin
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
    it('should throw error if invalid general loan id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID}dyi/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          pin: userOnePin
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_NOT_EXISTING_FOR_CLUSTER);
          done();
        });
    });
    it('should throw error if invalid user pin is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID}/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          pin: '8902'
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
    it('should throw error if loan status no longer pending', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_LOAN_ID}/disbursement`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .send({
          pin: userOnePin
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_DISBURSEMENT_CANNOT_BE_PROCESSED_DUE_TO_LOAN_STATUS);
          done();
        });
    });
    it('should initiate cluster loan disbursement for user one private cluster successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID}/disbursement`)
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
          expect(res.body.data).to.have.property('loan_id');
          expect(res.body.data).to.have.property('status');
          expect(res.body.data.loan_tenor_in_months).to.equal('3');
          expect(res.body.data.status).to.equal('processing');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_DISBURSEMENT_INITIATION_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_DISBURSEMENT_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should receive user 1 loan 1 webhook transfer failed response successfully', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveTransferFailedWebHookOne(process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_DISBURSEMENT_REFERENCE))
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_DISBURSEMENT_INITIATION_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.be.an('object');
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_RE_DISBURSEMENT_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should receive user 1 cluster loan 2 webhook transfer success response successfully', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveTransferSuccessWebHookOne(process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_RE_DISBURSEMENT_REFERENCE))
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
  describe('admin fetches cluster loan applications on the platform', () => {
    it('Should fetch all loans', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all in review loans without pagination if export is true and status is in review', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/clusters')
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
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all loan applications without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/clusters')
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
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all loan applications without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/clusters')
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
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/clusters')
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
    it('Should fetch cluster loan applications by the name of cluster', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          search: 'jagaban cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch in review cluster loan applications by the name of cluster if export is true ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          status: 'in review',
          search: 'jagaban cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch cluster loan applications by the name of cluster without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          search: 'jagaban cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch cluster loan applications by the name of cluster without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          search: 'jagaban cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });

    it('Should throw error if export is not true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/clusters')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'false',
          search: 'jagaban cluster'
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
    
    it('Should filter cluster loans by the loan status ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/clusters')
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
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });

      it('Should filter loans by the loan status with pagination ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/clusters')
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
            expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });

        it('Should throw error if status is not pending, cancelled, in review, processing, declined, approved, ongoing, over due, completed', (done) => {
          chai.request(app)
            .get('/api/v1/admin/loan/clusters')
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
      
      it('Should filter loans by the date they were created ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/clusters')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            start_date: '2023-07-02 23:03:09.875717',
            end_date: '2023-07-03 23:03:09.875717'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should filter cluster loans by the date they were created if export is true ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/clusters')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            start_date: '2023-07-02 23:03:09.875717',
            end_date: '2023-07-02 23:03:09.875717'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should filter cluster loans by the date they were created without pagination export is true', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/clusters')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            start_date: '2023-07-02 23:03:09.875717',
            end_date: '2023-07-03 23:03:09.875717'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
     
      it('Should throw error if in invalid cluster loan application date is entered', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/clusters')
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
      it('Should filter cluster loans by the date they were created and status ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/clusters')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            from_date: '2023-07-02 23:03:09.875717',
            to_date: '2023-07-03 23:03:09.875717',
            status: 'active'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should filter cluster loans by the date they were created and status if export is true', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/clusters')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            start_date: '2023-07-02 23:03:09.875717',
            end_date: '2023-07-03 23:03:09.875717',
            status: 'approved'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
    });
  });
  describe('admin fetches single cluster loan details', () => {
    it('Should fetch single cluster loan details', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/${process.env.SEEDFI_ADMIN_CLUSTER_ID_TWO}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_LOAN_ID}/cluster`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data.clusterDetails).to.have.property('cluster_id');
          expect(res.body.data.clusterDetails).to.have.property('type');
          expect(res.body.data.clusterDetails).to.have.property('loan_amount');          
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_DETAILS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/${process.env.SEEDFI_ADMIN_CLUSTER_ID_TWO}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_LOAN_ID}/cluster`)
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
  });
  describe('Fetch details of each member of a cluster loan', () => {
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/members-loan-details`)
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
        .get(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/members-loan-details`)
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
    it('Should fetch cluster loan member details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/members-loan-details`)
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
          expect(res.body.data).to.have.property('memberDetails');
          expect(res.body.data).to.have.property('loan_details');
          expect(res.body.data).to.have.property('orr_break_down');
          done();
        });
    });
  });
  describe('Fetch user cluster loan payments and details', () => {
    it('should fetch user nine current loans successfully', (done) => {
      chai.request(app)
        .get('/api/v1/loan/loan-payments')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .query({
          type: 'cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data.length).to.equal(1);
          expect(res.body.message).to.equal(enums.USER_LOAN_PAYMENTS_FETCHED_SUCCESSFUL('cluster'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_PAYMENT_ONE_ID = res.body.data[0].payment_id;
          done();
        });
    });
    it('should throw error if invalid cluster payment id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_PAYMENT_ONE_ID}eyen/cluster/payment-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
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
    it('should fetch details of user nine cluster loan payment one successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_PAYMENT_ONE_ID}/cluster/payment-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('clusterLoanPaymentDetails');
          expect(res.body.data).to.have.property('clusterLoanDetails');
          expect(res.body.data).to.have.property('clusterLoanRepaymentDetails');
          expect(res.body.data.clusterLoanRepaymentDetails.length).to.equal(3);
          expect(res.body.message).to.equal(enums.USER_LOAN_PAYMENT_DETAILS_FETCHED_SUCCESSFUL('cluster'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should fetch user nine current loans successfully', (done) => {
      chai.request(app)
        .get('/api/v1/loan/current-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data.currentPersonalLoans.length).to.equal(1);
          expect(res.body.data.currentClusterLoans.length).to.equal(1);
          expect(res.body.data.currentPersonalLoans[0].status).to.equal('ongoing');
          expect(res.body.data.currentClusterLoans[0].status).to.equal('ongoing');
          expect(res.body.message).to.equal(enums.USER_CURRENT_LOANS_FETCHED_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should fetch details of user nine cluster loan successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('nextClusterLoanRepaymentDetails');
          expect(res.body.data).to.have.property('clusterLoanDetails');
          expect(res.body.data).to.have.property('clusterLoanRepaymentDetails');
          expect(res.body.data.clusterLoanRepaymentDetails.length).to.equal(3);
          expect(res.body.message).to.equal(enums.USER_LOAN_DETAILS_FETCHED_SUCCESSFUL('cluster'));
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('User nine initiates manual cluster loan repayment', () => {
    it('should throw error if invalid cluster loan id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}eyen/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
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
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_NOT_EXISTING);
          done();
        });
    });
    it('should throw error if payment channel is not sent', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
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
    it('should throw error if invalid payment type is not sent', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'all',
          payment_channel: 'bank_transfer'
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
    it('should throw error if cluster loan status is not eligible for repayment', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_NINE_MEMBER_LOAN_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'full',
          payment_channel: 'bank_transfer'
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
    it('should initiate part payment for cluster loan by user nine successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
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
          expect(res.body.message).to.equal('Authorization URL created');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_REPAYMENT_ONE_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should successfully process card payment for loan repayment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookTwo(process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_REPAYMENT_ONE_REFERENCE))
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
    it('should initiate part payment for cluster loan by user nine successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'part',
          payment_channel: 'bank_transfer'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal('Authorization URL created');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_REPAYMENT_TWO_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should successfully process card payment for loan repayment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookTwo(process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_REPAYMENT_TWO_REFERENCE))
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
  });
  describe('User one initiates manual cluster loan repayment', () => {
    it('should throw error if invalid cluster loan id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_MEMBER_LOAN_ID}eyen/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_ONE}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
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
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_NOT_EXISTING);
          done();
        });
    });
    it('should throw error if payment channel id does not belong to user', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_MEMBER_LOAN_ID}/${process.env.SEEDFI_USER_TWO_BANK_ACCOUNT_ID_ONE}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'part',
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
    it('should throw error if invalid payment channel is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_MEMBER_LOAN_ID}/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_ONE}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'full',
          payment_channel: 'bank_transfer'
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
    it('should throw error if cluster loan status is not eligible for repayment', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_ONE}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
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
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_STATUS_NOT_FOR_REPAYMENT('cancelled'));
          done();
        });
    });
    it('should initiate full payment for cluster loan by user one successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_MEMBER_LOAN_ID}/${process.env.SEEDFI_USER_ONE_BANK_ACCOUNT_ID_ONE}/initiate-repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          payment_type: 'full',
          payment_channel: 'bank'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal('Charge attempted');
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_REPAYMENT_ONE_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should successfully verify payment by bank account otp for user one full payment', (done) => {
      chai.request(app)
        .post(`/api/v1/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_REPAYMENT_ONE_REFERENCE}/submit-otp`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
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
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_REPAYMENT_ONE_REFERENCE = res.body.data.reference;
          done();
        });
    });
    it('should successfully process bank payment for loan repayment using paystack webhook', (done) => {
      chai.request(app)
        .post('/api/v1/payment/paystack-webhook')
        .send(receiveChargeSuccessWebHookTwo(process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_REPAYMENT_ONE_REFERENCE))
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
  });
  describe('Fetch cluster current loan application', () => {
    it('should fetch general cluster loan details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/current-loan`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data[0]).to.have.property('can_disburse_loan');
          expect(res.body.data[0].status).to.equal('ongoing');
          expect(res.body.message).to.equal(enums.CLUSTER_CURRENT_LOAN_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if invalid cluster id', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}kfk/current-loan`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
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
    it('should throw error if not cluster member', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/current-loan`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
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
    it('should throw error if public cluster', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/current-loan`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_TYPE_NOT_PUBLIC_OR_PRIVATE('public'));
          done();
        });
    });
  });
  describe('Fetch cluster loan summary details', () => {
    it('should fetch general cluster loan summary details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID}/loan-summary`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data.length).to.equal(2);
          expect(res.body.data[0]).to.have.property('cluster_name');
          expect(res.body.data[0]).to.have.property('amount_requested');
          expect(res.body.data[0]).to.have.property('total_outstanding_amount');
          expect(res.body.data[0]).to.have.property('is_rescheduled');
          expect(res.body.message).to.equal(enums.CLUSTER_LOAN_SUMMARY_DETAILS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if invalid cluster id', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}9i/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID}/loan-summary`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
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
    it('should throw error if not cluster member', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID}/loan-summary`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
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
    it('should throw error if public cluster', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PUBLIC_CLUSTER_ONE_CLUSTER_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID}/loan-summary`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.CLUSTER_TYPE_NOT_PUBLIC_OR_PRIVATE('public'));
          done();
        });
    });
    it('should throw error if invalid general loan id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/${process.env.SEEDFI_USER_ONE_PRIVATE_CLUSTER_ONE_CLUSTER_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_LOAN_ID}di/loan-summary`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_APPLICATION_NOT_EXISTING_FOR_CLUSTER);
          done();
        });
    });
  });
  describe('User nine initiates loan rescheduling process', () => {
    it('should throw error if invalid member loan id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}jdj5/reschedule-summary`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .query({
          extension_id: process.env.SEEDFI_LOAN_RESCHEDULING_DURATION_ID_THREE
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
    it('should throw error if no extension id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/reschedule-summary`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .query({ })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('extension_id is required');
          done();
        });
    });
    it('should throw error if invalid extension id is sent', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/reschedule-summary`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .query({
          extension_id: 100
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_RESCHEDULING_EXTENSION_NOT_EXISTING);
          done();
        });
    });
    it('should throw error if loan is not an ongoing loan', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_MEMBER_LOAN_ID}/reschedule-summary`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .query({
          extension_id: process.env.SEEDFI_LOAN_RESCHEDULING_DURATION_ID_THREE
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('Loan application is already completed, thus action cannot be performed');
          done();
        });
    });
    it('should process loan rescheduling summary successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/reschedule-summary`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .query({
          extension_id: process.env.SEEDFI_LOAN_RESCHEDULING_DURATION_ID_THREE
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('reschedule_id');
          expect(res.body.data).to.have.property('rescheduling_count');
          expect(res.body.data).to.have.property('next_repayment_date');
          expect(res.body.data.rescheduling_count).to.equal(0);
          expect(res.body.message).to.equal(enums.LOAN_RESCHEDULING_SUMMARY_RETURNED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_RESCHEDULING_ID_ONE = res.body.data.reschedule_id;
          done();
        });
    });
  });
  describe('User nine proceeds with loan rescheduling process', () => {
    it('should throw error if invalid member loan id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}jdj5/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_RESCHEDULING_ID_ONE}/process-rescheduling`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
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
    it('should throw error if invalid rescheduling id is sent', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_RESCHEDULING_ID_ONE}67t/process-rescheduling`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_RESCHEDULE_REQUEST_NOT_EXISTING);
          done();
        });
    });
    it('should throw error if loan is not an ongoing loan', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_MEMBER_LOAN_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_RESCHEDULING_ID_ONE}/process-rescheduling`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal('Loan application is already completed, thus action cannot be performed');
          done();
        });
    });
    it('should process loan rescheduling summary successfully', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_RESCHEDULING_ID_ONE}/process-rescheduling`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('reschedule_extension_days');
          expect(res.body.data).to.have.property('total_loan_extension_days');
          expect(res.body.data).to.have.property('is_reschedule');
          expect(res.body.data.is_reschedule).to.equal(true);
          expect(res.body.message).to.equal(enums.LOAN_RESCHEDULING_PROCESSED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('should throw error if loan previously based on reschedule Id', (done) => {
      chai.request(app)
        .post(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_RESCHEDULING_ID_ONE}/process-rescheduling`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_BAD_REQUEST);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.LOAN_RESCHEDULE_REQUEST_PREVIOUSLY_PROCESSED_EXISTING);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('should throw error if user has exceeded rescheduling allowable', (done) => {
      chai.request(app)
        .get(`/api/v1/cluster/loan/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_NINE_MEMBER_LOAN_ID}/reschedule-summary`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_NINE_ACCESS_TOKEN}`
        })
        .query({
          extension_id: process.env.SEEDFI_LOAN_RESCHEDULING_DURATION_ID_THREE
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_FORBIDDEN);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          expect(res.body.message).to.equal(enums.LOAN_RESCHEDULING_NOT_ALLOWED(1));
          done();
        });
    });
  });
  describe('admin fetches rescheduled cluster loans on the platform', () => {
    it('Should fetch all rescheduled cluster loans with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/rescheduled-loans')
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
          expect(res.body.data).to.have.property('rescheduledClusterLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all rescheduled cluster loans if query type is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/rescheduled-loans')
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
          expect(res.body.data).to.have.property('rescheduledClusterLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/rescheduled-loans')
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
    it('Should throw error if export is not true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/rescheduled-loans')
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
    it('Should fetch rescheduled cluster loans by the name of the loan applicant', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/rescheduled-loans')
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
          expect(res.body.data).to.have.property('rescheduledClusterLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter rescheduled cluster loans by date', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/rescheduled-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          start_date: '2023-06-10',
          end_date: '2023-06-11'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('rescheduledClusterLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch rescheduled cluster loans by the loan applicant name where the query type is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/rescheduled-loans')
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
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('rescheduledClusterLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch rescheduled cluster loans by the loan applicant name with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/rescheduled-loans')
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
          expect(res.body.data).to.have.property('rescheduledClusterLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter rescheduled cluster loans by the status ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/rescheduled-loans')
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
          expect(res.body.data).to.have.property('rescheduledClusterLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    
    it('Should filter resheduled cluster loans by the status with pages ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/rescheduled-loans')
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
          expect(res.body.data).to.have.property('rescheduledClusterLoans');
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });  
  });
  describe('admin fetches single user rescheduled cluster loan details on the platform', () => {
    it('Should fetch single user rescheduled cluster loan details', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_MEMBER_LOAN_ID}/rescheduled-loan-details`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data.userRescheduleDetails).to.have.property('loan_id');
          expect(res.body.data.userRescheduleDetails).to.have.property('user_id');
          expect(res.body.data.newRepayment[0]).to.have.property('repayment_amount');          
          expect(res.body.message).to.equal(enums.RESCHEDULED_LOAN_DETAILS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_TWO_USER_ONE_MEMBER_LOAN_ID}/rescheduled-loan-details`)
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
  });
  describe('admin fetches repaid cluster loans on the platform', () => {
    it('Should fetch all repaid loans with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/repayments')
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
          expect(res.body.data).to.have.property('repaidClusterLoans');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all repaid cluster loans if query type is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/repayments')
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
          expect(res.body.data).to.have.property('repaidClusterLoans');
          expect(res.body.data.repaidClusterLoans[0]).to.have.property('user_id');
          expect(res.body.data.repaidClusterLoans[0]).to.have.property('name');
          expect(res.body.data.repaidClusterLoans[0]).to.have.property('loan_id');
          expect(res.body.data.repaidClusterLoans[0]).to.have.property('status');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/repayments')
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
    it('Should fetch repaid cluster loans by the name of the loan applicant', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/repayments')
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
          expect(res.body.data).to.have.property('repaidClusterLoans');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should throw error if export is not true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/repayments')
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
    it('Should fetch repaid cluster loans by the loan applicant name where the query type is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/repayments')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          search: 'bala andrew'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data.repaidClusterLoans[0]).to.have.property('user_id');
          expect(res.body.data.repaidClusterLoans[0]).to.have.property('name');
          expect(res.body.data.repaidClusterLoans[0]).to.have.property('loan_id');
          expect(res.body.data.repaidClusterLoans[0]).to.have.property('status');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch repaid cluster loans by the loan applicant name with pages', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/repayments')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          search: 'bala andrew',
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
          expect(res.body.data).to.have.property('repaidClusterLoans');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter repaid cluster loans by the date they were paid ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/repayments')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          start_date: '2023-07-05',
          end_date: '2023-07-06'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.data).to.have.property('page');
          expect(res.body.data).to.have.property('total_pages');
          expect(res.body.data).to.have.property('repaidClusterLoans');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter repaid cluster loans by the date they were paid if query is export', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/repayments')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          start_date: '2023-07-05',
          end_date: '2023-07-06'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('repaidClusterLoans');
          expect(res.body.data).to.have.property('total_count');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter repaid cluster loans by the date they were paid with pages ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/repayments')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          start_date: '2023-07-05',
          end_date: '2023-07-06',
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
          expect(res.body.data).to.have.property('repaidClusterLoans');
          expect(res.body.message).to.equal(enums.REPAID_LOANS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });  
  });
  describe('admin fetches in review cluster loan applications on the platform', () => {
    it('Should fetch all in review cluster loans', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all in review loans without pagination if export is true and status is in review', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
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
          expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all in review loan applications without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
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
          expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch all in review loan applications without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
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
          expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
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
    it('Should fetch in review cluster loan applications by the name of cluster', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          search: 'jagaban cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch in review cluster loan applications by the name of cluster if export is true ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          status: 'in review',
          search: 'jagaban cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch in review cluster loan applications by the name of cluster without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          search: 'jagaban cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch in review cluster loan applications by the name of cluster without pagination if export is true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          search: 'jagaban cluster'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });

    it('Should throw error if export is not true', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'false',
          search: 'jagaban cluster'
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
    it('Should throw error if status is not in review', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          export: 'true',
          status: 'approved'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('status must be [in review]');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    
    it('Should filter in review cluster loans by the loan status ', (done) => {
      chai.request(app)
        .get('/api/v1/admin/loan/cluster/in-review-loans')
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
          expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });

      it('Should filter in review loans by the loan status with pagination ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/cluster/in-review-loans')
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
            expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });

        it('Should throw error if status is not pending, cancelled, in review, processing, declined, approved, ongoing, over due, completed', (done) => {
          chai.request(app)
            .get('/api/v1/admin/loan/cluster/in-review-loans')
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
      
      it('Should in review filter loans by the date they were created ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/cluster/in-review-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            start_date: '2023-07-02 23:03:09.875717',
            end_date: '2023-07-03 23:03:09.875717'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should filter in review cluster loans by the date they were created if export is true ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/cluster/in-review-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            start_date: '2023-07-02 23:03:09.875717',
            end_date: '2023-07-02 23:03:09.875717'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should filter in review cluster loans by the date they were created without pagination export is true', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/cluster/in-review-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            start_date: '2023-07-02 23:03:09.875717',
            end_date: '2023-07-03 23:03:09.875717'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
     
      it('Should throw error if in invalid cluster loan application date is entered', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/cluster/in-review-loans')
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
      it('Should filter cluster loans by the date they were created and status ', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/cluster/in-review-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            from_date: '2023-07-02 23:03:09.875717',
            to_date: '2023-07-03 23:03:09.875717',
            status: 'active'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
      it('Should filter cluster loans by the date they were created and status if export is true', (done) => {
        chai.request(app)
          .get('/api/v1/admin/loan/cluster/in-review-loans')
          .set({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
          })
          .query({
            export: 'true',
            start_date: '2023-07-02 23:03:09.875717',
            end_date: '2023-07-03 23:03:09.875717',
            status: 'approved'
          })
          .end((err, res) => {
            expect(res.statusCode).to.equal(200);
            expect(res.body).to.have.property('message');
            expect(res.body).to.have.property('status');
            expect(res.body.message).to.equal(enums.IN_REVIEW_CLUSTER_LOAN_APPLICATIONS_FETCHED_SUCCESSFULLY);
            expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
            done();
          });
      });
    });
  });
  describe('admin fetches details of each member of an in review cluster loan', () => {
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/in-review-loan-details`)
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
        .get(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/in-review-loan-details`)
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
    it('Should fetch in review cluster loan member details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/in-review-loan-details`)
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
          expect(res.body.data).to.have.property('clusterDetails');
          expect(res.body.data).to.have.property('memberLoanId');
          expect(res.body.data).to.have.property('orr_break_down');
          done();
        });
    });
  });
  describe('Fetch user one referral details and history', () => {
    it('Should fetch user referral details successfully', (done) => {
      chai.request(app)
        .get('/api/v1/user/referral-details')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.have.property('referral_code');
          expect(res.body.data).to.have.property('unclaimed_reward_points');
          expect(res.body.data).to.have.property('claimed_reward_points');
          expect(res.body.data).to.have.property('cumulative_reward_points');
          expect(res.body.data.unclaimed_reward_points).to.equal('4');
          expect(res.body.data.claimed_reward_points).to.equal('20');
          expect(res.body.data.cumulative_reward_points).to.equal('30');
          expect(res.body.message).to.equal(enums.FETCHED_REFERRAL_DETAILS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch user referral history successfully', (done) => {
      chai.request(app)
        .get('/api/v1/user/referral-history')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.data).to.be.an('array');
          expect(res.body.data.length).to.equal(5);
          expect(res.body.data[0]).to.have.property('referral_code');
          expect(res.body.data[0]).to.have.property('point_reward');
          expect(res.body.data[0]).to.have.property('reward_description');
          expect(res.body.data[0]).to.have.property('date');
          expect(res.body.data[0].point_reward).to.equal('2');
          expect(res.body.message).to.equal(enums.FETCHED_REFERRAL_HISTORY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('admin fetches user cluster loan repayment details', () => {
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/repayment`)
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
        .get(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/repayment`)
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
    it('Should fetch user cluster loan repayment details successfully', (done) => {
      chai.request(app)
        .get(`/api/v1/admin/loan/cluster/${process.env.SEEDFI_PRIVATE_CLUSTER_ONE_CLUSTER_LOAN_APPLICATION_USER_ONE_MEMBER_LOAN_ID}/repayment`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.LOAN_REPAYMENT_DETAILS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data).to.have.property('clusterDetails');
          expect(res.body.data).to.have.property('orr_break_down');
          done();
        });
    });
  });
});
