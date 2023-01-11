import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminAuthController from '../../../../src/admins/api/controllers/controllers.auth';

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
    it('should call completeAdminLoginRequest', async() => {
      const req = { token: '', admin: '' };
      const data = await AdminAuthController.completeAdminLoginRequest(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call login', async() => {
      const req = { token: '', permissions: '', admin: '' };
      const data = await AdminAuthController.login(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call setPassword', async() => {
      const req = { body: '', admin: '' };
      const data = await AdminAuthController.setPassword('first')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call forgotPassword', async() => {
      const req = { token: '', admin: '' };
      const data = await AdminAuthController.forgotPassword(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call sendAdminPasswordToken', async() => {
      const req = { passwordToken: '', admin: '' };
      const data = await AdminAuthController.sendAdminPasswordToken(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
