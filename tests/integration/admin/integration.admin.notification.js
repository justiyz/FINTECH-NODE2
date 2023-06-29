import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';

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
    it('Should update a notification', (done) => {
      chai.request(app)
        .patch(`/api/v1/admin/${1687270708159}/single-notification`)
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
    it('Should successfully send down time notification', (done) => {
      chai.request(app)
        .post('/api/v1/admin/downtime/notifications')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'system',
          end_at: '2025-07-08'
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
    it('Should successfully send users notification', (done) => {
      chai.request(app)
        .post('/api/v1/admin/users/notifications')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'system',
          title: 'promo time',
          content: 'something to put here, working on something',
          sent_to: [
            { user_id: 'user-f664edd0168011ee8c518ff2b43a9cdc' },
            { user_id: 'user-f65cab3e168011eea326db608894811c' },
            { user_id: 'user-f65ecb26168011eea326731ea8de735e' },
            { user_id: 'user-f660473a168011ee8c5133894605a3d8' },
            { user_id: 'user-f663f68c168011eea32687b195cab0bc' },
            { user_id: 'user-f665c4bc168011eea326c369ea760836' }
          ],
          end_at: '2025-07-08'
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
        .post('/api/v1/admin/users/notifications')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          type: 'system',
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
          expect(res.body.message).to.equal('end_at is required');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
});
