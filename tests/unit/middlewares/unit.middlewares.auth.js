import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../src/users/lib/enums';
import * as AuthMiddleware from '../../../src/users/api/middlewares/middlewares.auth';

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

  describe('Auth middleware catch block unit testings', () => {
    it('should call generateVerificationToken', async() => {
      const req = null;
      const data = await AuthMiddleware.generateVerificationToken('otp')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call generateReferralCode', async() => {
      const req = {};
      const data = await AuthMiddleware.generateReferralCode(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfReferralCodeExists', async() => {
      const req = { body: '' };
      const data = await AuthMiddleware.checkIfReferralCodeExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call verifyVerificationToken', async() => {
      const req = { body: '' };
      const data = await AuthMiddleware.verifyVerificationToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call generateTokens', async() => {
      const req = { user: null };
      const data = await AuthMiddleware.generateTokens(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call getAuthToken', async() => {
      const req = { headers: '' };
      const data = await AuthMiddleware.getAuthToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call validateAuthToken', async() => {
      const req = { token: '' };
      const data = await AuthMiddleware.validateAuthToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call isCompletedKyc', async() => {
      const req = { user: '' };
      const data = await AuthMiddleware.isCompletedKyc('confirm')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call comparePassword', async() => {
      const req = { user: '', body: '' };
      const data = await AuthMiddleware.comparePassword(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call isPasswordCreated', async() => {
      const req = { user: '' };
      const data = await AuthMiddleware.isPasswordCreated(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfEmailAlreadyExist', async() => {
      const req = { user: '', body: '' };
      const data = await AuthMiddleware.checkIfEmailAlreadyExist(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call generateResetPasswordToken', async() => {
      const req = { user: '' };
      const data = await AuthMiddleware.generateResetPasswordToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call generateResetPasswordToken', async() => {
      const req = { user: '', body: '' };
      const data = await AuthMiddleware.generateResetPasswordToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
