import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../src/users/lib/enums';
import * as AuthController from '../../../src/users/api/controllers/controllers.auth';

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

  describe('Auth controller catch block unit testings', () => {
    it('should call signup', async() => {
      const req = { body: '', otp: null };
      const data = await AuthController.signup(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call resendSignupOtp', async() => {
      const req = { user: '', body: '', otp: null };
      const data = await AuthController.resendSignupOtp(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call login', async() => {
      const req = { user: '' };
      const data = await AuthController.login(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call verifyAccount', async() => {
      const req = { body: '', user: '', referralCode: null };
      const data = await AuthController.verifyAccount(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call completeProfile', async() => {
      const req = { user: '', body: '', hashed: null };
      const data = await AuthController.completeProfile(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call forgetPassword', async() => {
      const req = { user: '', body: '' };
      const data = await AuthController.forgotPassword(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call resetPasswordToken', async() => {
      const req = { user: '', passwordToken: '' };
      const data = await AuthController.resetPasswordToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call resetPassword', async() => {
      const req = { user: '', body: '', hashed: null };
      const data = await AuthController.resetPassword(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call changePassword', async() => {
      const req = { user: '', body: '', hashed: null };
      const data = await AuthController.changePassword(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call createPin', async() => {
      const req = { user: '', body: '', hashed: null };
      const data = await AuthController.createPin(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call changePin', async() => {
      const req = { user: '', body: '', hashed: null };
      const data = await AuthController.changePin(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call confirmPassword', async() => {
      const req = { user: '', body: '' };
      const data = await AuthController.confirmPassword(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call confirmPin', async() => {
      const req = { user: '', body: '' };
      const data = await AuthController.confirmPin(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
