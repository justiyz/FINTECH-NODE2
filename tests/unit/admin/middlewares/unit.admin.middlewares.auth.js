import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminAuthMiddleware from '../../../../src/admins/api/middlewares/middlewares.auth';

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
    it('should call compareAdminPassword', async() => {
      const req = { body: '', admin: '' };
      const data = await AdminAuthMiddleware.compareAdminPassword(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call verifyLoginVerificationToken', async() => {
      const req = { body: '', admin: '' };
      const data = await AdminAuthMiddleware.verifyLoginVerificationToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call adminPermissions', async() => {
      const req = { admin: '' };
      const data = await AdminAuthMiddleware.adminPermissions(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call validateAdminAuthToken', async() => {
      const req = { token: '' };
      const data = await AdminAuthMiddleware.validateAdminAuthToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfChangedDefaultPassword', async() => {
      const req = { admin: '' };
      const data = await AdminAuthMiddleware.checkIfChangedDefaultPassword('validate')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call validateAdminResetPasswordToken', async() => {
      const req = { token: '' };
      const data = await AdminAuthMiddleware.validateAdminResetPasswordToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfResetCredentialsSameAsOld', async() => {
      const req = { body: '', admin: '' };
      const data = await AdminAuthMiddleware.checkIfResetCredentialsSameAsOld(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
