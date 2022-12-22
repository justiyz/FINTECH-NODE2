import { expect } from 'chai';
import enums from '../../../../src/users/lib/enums';


describe('HTTP Status code Enums Tests', () => {
  it('HTTP_CONFLICT', () => {
    const data = enums.HTTP_CONFLICT;
    expect(data).to.equal(409);
  });
  it('HTTP_BAD_REQUEST', () => {
    const data = enums.HTTP_BAD_REQUEST;
    expect(data).to.equal(400);
  });
  it('HTTP_TO_MANY_REQUESTS', () => {
    const data = enums.HTTP_TO_MANY_REQUESTS;
    expect(data).to.equal(429);
  });
  it('SMTP_TRANSACTION_FAILED', () => {
    const data = enums.SMTP_TRANSACTION_FAILED;
    expect(data).to.equal(554);
  });
  it('HTTP_SERVICE_UNAVAILABLE', () => {
    const data = enums.HTTP_SERVICE_UNAVAILABLE;
    expect(data).to.equal(503);
  });
  it('HTTP_UNAUTHORIZED', () => {
    const data = enums.HTTP_UNAUTHORIZED;
    expect(data).to.equal(401);
  });
  it('HTTP_CREATED', () => {
    const data = enums.HTTP_CREATED;
    expect(data).to.equal(201);
  });
  it('HTTP_GONE', () => {
    const data = enums.HTTP_GONE;
    expect(data).to.equal(410);
  });
});

describe('Enum messages Tests', () => {
  it('SERVER_ERROR', () => {
    const data = enums.SERVER_ERROR;
    expect(data).to.equal('Server Error');
  });
  it('USER_ACCOUNT_STATUS', () => {
    const data = enums.USER_ACCOUNT_STATUS('inactive');
    expect(data).to.equal('User account is inactive');
  });
  it('INVALID', () => {
    const data = enums.INVALID('otp');
    expect(data).to.equal('Invalid otp');
  });
  it('ALREADY_CREATED', () => {
    const data = enums.ALREADY_CREATED('account');
    expect(data).to.equal('account already created');
  });
  it('SESSION_EXPIRED', () => {
    const data = enums.SESSION_EXPIRED;
    expect(data).to.equal('Session expired');
  });
  it('SOMETHING_BROKE_MESSAGE', () => {
    const data = enums.SOMETHING_BROKE_MESSAGE;
    expect(data).to.equal('Oooops! Something broke, kindly try later');
  });
});

describe('Enum queries Tests', () => {
  it('AUTH_QUERY', () => {
    const data = enums.AUTH_QUERY;
    expect(data).to.equal('authQuery');
  });
  it('USER_QUERY', () => {
    const data = enums.USER_QUERY;
    expect(data).to.equal('userQuery');
  });
});
