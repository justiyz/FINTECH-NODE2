import assert from 'assert';
import request from 'supertest';

import app from '../../src/app';

describe('Welcome Integration test', () => {
  it('Welcome', done => {
    request(app)
      .get('/')
      .set('Content-Type', 'application/json')
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.message, 'Welcome to Seedfi');
        done();
      });
  });

  it('Wrong route', done => {
    request(app)
      .get('/welcome')
      .set('Content-Type', 'application/json')
      .expect(404)
      .end((err, res) => {
        assert.equal(res.body.status, 'Error');
        assert.equal(res.body.message, 'Resource Not Found');
        done();
      });
  });
});
