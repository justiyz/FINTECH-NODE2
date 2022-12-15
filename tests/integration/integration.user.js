import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../src/app';
import enums from '../../src/lib/enums';
import * as Hash from '../../src/lib/utils/lib.util.hash';


const { expect } = chai;
chai.use(chaiHttp);

describe('update fcm-token', () => {
  it('should update the fcm-token of user one successfully', (done) => {
    chai.request(app)
      .patch('/api/v1/user/fcm-token')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
      })
      .send({
        fcm_token: Hash.generateRandomString(20)
      })
      .end((err, res) => {
        console.log(res.body);
        expect(res.statusCode).to.equal(enums.HTTP_OK);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('data');
        expect(res.body.message).to.equal(enums.USER_FCM_TOKEN_UPDATED);
        expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
        done();
      });
  });
  it('should throw error when fcm token is not sent for user one', (done) => {
    chai.request(app)
      .patch('/api/v1/user/fcm-token')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_USER_ONE_ACCESS_TOKEN}`
      })
      .end((err, res) => {
        console.log(res.body);
        expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal(enums.ERROR_STATUS);
        done();
      });
  });
  it('should update the fcm-token of user two successfully', (done) => {
    chai.request(app)
      .patch('/api/v1/user/fcm-token')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
      })
      .send({
        fcm_token: Hash.generateRandomString(20)
      })
      .end((err, res) => {
        console.log(res.body);
        expect(res.statusCode).to.equal(enums.HTTP_OK);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body).to.have.property('data');
        expect(res.body.message).to.equal(enums.USER_FCM_TOKEN_UPDATED);
        expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
        done();
      });
  });
  it('should throw error when fcm token is not sent for user two', (done) => {
    chai.request(app)
      .patch('/api/v1/user/fcm-token')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_USER_TWO_ACCESS_TOKEN}`
      })
      .end((err, res) => {
        console.log(res.body);
        expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.status).to.equal(enums.ERROR_STATUS);
        done();
      });
  });
});
