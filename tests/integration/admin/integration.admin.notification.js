import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';
import dayjs from 'dayjs';

const { expect } = chai;
chai.use(chaiHttp);

describe('Admin Notification', () => {
  describe('Admin Notifications', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/${1687270708159}/single-notification`)
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
        .patch(`/api/v1/admin/${1687270708159}/single-notification`)
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
    it('Should successfully update multiply notification', (done) => {
      chai.request(app)
        .put('/api/v1/admin/admin-notifications')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.NOTIFICATION_UPDATED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should successfully send users system notification', (done) => {
      chai.request(app)
        .post('/api/v1/admin/send-notifications')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'system',
          title: 'promo time',
          content: 'something to put here, working on something',
          sent_to: [
            { 
              user_id: process.env.SEEDFI_USER_ONE_USER_ID
            },
            { 
              user_id: process.env.SEEDFI_USER_TWO_USER_ID
            },
            { 
              user_id: process.env.SEEDFI_USER_THREE_USER_ID
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.SUCCESSFULLY_NOTIFICATION);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should successfully send users alert notification', (done) => {
      chai.request(app)
        .post('/api/v1/admin/send-notifications')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'alert',
          title: 'Happy Holidays',
          content: 'something to put here, working on something',
          end_at: dayjs().add(1, 'months')
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.SUCCESSFULLY_NOTIFICATION);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });

    it('Should flag when a field is missing', (done) => {
      chai.request(app)
        .post('/api/v1/admin/send-notifications')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          title: 'promo time',
          content: 'something to put here, working on something',
          sent_to: [
            { user_id: 'user-f664edd0168011ee8c518ff2b43a9cdc' },
            { user_id: 'user-f65cab3e168011eea326db608894811c' },
            { user_id: 'user-f65ecb26168011eea326731ea8de735e' },
            { user_id: 'user-f660473a168011ee8c5133894605a3d8' },
            { user_id: 'user-f663f68c168011eea32687b195cab0bc' },
            { user_id: 'user-f665c4bc168011eea326c369ea760836' }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_UNPROCESSABLE_ENTITY);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('type is required');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
  describe('Admin fetches, filters and searches notifications', () => {
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/admin-notifications')
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
        .get('/api/v1/admin/admin-notifications')
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
    it('Should fetch all notifications', (done) => {
      chai.request(app)
        .get('/api/v1/admin/admin-notifications')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.FETCHED_NOTIFICATIONS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should fetch notification by the title', (done) => {
      chai.request(app)
        .get('/api/v1/admin/admin-notifications')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          title: 'promo time'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.FETCHED_NOTIFICATIONS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should filter notification by the notification title with pagination', (done) => {
      chai.request(app)
        .get('/api/v1/admin/admin-notifications')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .query({
          page: 1,
          per_page: 1
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.FETCHED_NOTIFICATIONS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          process.env.SEEDFI_NOTIFICATION_ID = res.body.data.notifications[0].notification_id;
          done();
        });
    });
    it('Should fetch notification', (done) => {
      chai.request(app)
        .get('/api/v1/admin/admin-notifications')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.FETCHED_NOTIFICATIONS);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
  });
  describe('delete notification', () => {
    it('Should flag when admin is not a super admin and did create the notification', (done) => {
      chai.request(app)
        .put('/api/v1/admin/sent-notification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_ADMIN_THREE_ACCESS_TOKEN}`
        })
        .send([
          { adminNotificationId: process.env.SEEDFI_NOTIFICATION_ID }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.NOT_ALLOWED_TO_DELETE_NOTIFICATION);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should delete notification by id', (done) => {
      chai.request(app)
        .put('/api/v1/admin/sent-notification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send([
          { adminNotificationId: process.env.SEEDFI_NOTIFICATION_ID }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.DELETE_NOTIFICATION);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
    it('Should flag when id des not exist', (done) => {
      chai.request(app)
        .put('/api/v1/admin/sent-notification')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send([
          { adminNotificationId: `${process.env.SEEDFI_NOTIFICATION_ID}0p` }
        ])
        .end((err, res) => {
          expect(res.statusCode).to.equal(400);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.NOTIFICATION_DOES_NOT_EXIST);
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
});
