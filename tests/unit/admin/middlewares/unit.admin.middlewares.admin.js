import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminAdminMiddleware from '../../../../src/admins/api/middlewares/middlewares.admin';

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
    it('should call checkIfAdminExists', async() => {
      const req = { params: '' };
      const data = await AdminAdminMiddleware.checkIfAdminExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfSuperAdmin', async() => {
      const req = { adminUser: '' };
      const data = await AdminAdminMiddleware.checkIfSuperAdmin(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call validateUnAuthenticatedAdmin', async() => {
      const req = { body: '' };
      const data = await AdminAdminMiddleware.validateUnAuthenticatedAdmin('login')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfAuthenticatedAdmin', async() => {
      const req = { admin: '', adminUser: '' };
      const data = await AdminAdminMiddleware.checkIfAuthenticatedAdmin(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
