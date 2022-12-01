import assert from 'assert';
import request from 'supertest';

import app from '../../index';

describe('Integration test', () => {
  it('Hello World', done => {
    request(app)
      .get('/v1/')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.message, 'Hello World');
        done();
      });
  });

  it('Healthcheck', done => {
    request(app)
      .get('/v1/healthcheck/ping')
      .set('Content-Type', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.message, 'PONG');
        done();
      });
  });
});
