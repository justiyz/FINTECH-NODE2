import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../src/users/lib/enums';
import * as UserMiddleware from '../../../src/users/api/middlewares/middlewares.user';

describe('', () => {
  let status,
    next;

  const res = {
    status: 'error',
    error: 'INTERNAL_SERVER_ERROR',
    code: enums.HTTP_INTERNAL_SERVER_ERROR
  };

  beforeEach(() => {
    status = sinon.stub();
    next = sinon.stub();
    status.returns(res);
    next.returns(res);
  });

  describe('User middleware catch block unit testings', () => {
    it('should call getUser', async() => {
      const req = { body: '' };
      const data = await UserMiddleware.validateUnAuthenticatedUser('validate')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call validateRefreshToken', async() => {
      const req = { user: '', query: '' };
      const data = await UserMiddleware.validateRefreshToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call isVerifiedBvn', async() => {
      const req = null;
      const data = await UserMiddleware.isVerifiedBvn('confirm')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call verifyBvn', async() => {
      const req = { body: '', user: '' };
      const data = await UserMiddleware.verifyBvn(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call isBvnPreviouslyExisting', async() => {
      const req = { user: '', body: '' };
      const data = await UserMiddleware.isBvnPreviouslyExisting(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call verifyEmailVerificationToken', async() => {
      const req = { query: '' };
      const data = await UserMiddleware.verifyEmailVerificationToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call isUploadedImageSelfie', async() => {
      const req = { user: '' };
      const data = await UserMiddleware.isUploadedImageSelfie('confirm')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkUserIdVerification', async() => {
      const req = { user: '' };
      const data = await UserMiddleware.isUploadedVerifiedId(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfBvnIsVerified', async() => {
      const req = { user: '' };
      const data = await UserMiddleware.checkIfBvnIsVerified(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call resolveBankAccountNumberName', async() => {
      const req = { user: '', query: '', body: '' };
      const data = await UserMiddleware.resolveBankAccountNumberName(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkAccountOwnership', async() => {
      const req = { user: '', accountNumberDetails: '' };
      const data = await UserMiddleware.checkAccountOwnership(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfAccountDetailsExists', async() => {
      const req = { user: '', params: '' };
      const data = await UserMiddleware.checkIfAccountDetailsExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkUserLoanStatus', async() => {
      const req = { user: '' };
      const data = await UserMiddleware.checkUserLoanStatus(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkAccountCurrentChoicesAndTypeSent', async() => {
      const req = { user: '', query: '', accountDetails: '' };
      const data = await UserMiddleware.checkAccountCurrentChoicesAndTypeSent(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfLoanStatusIsActive', async() => {
      const req = { user: '' };
      const data = await UserMiddleware.checkIfLoanStatusIsActive(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
