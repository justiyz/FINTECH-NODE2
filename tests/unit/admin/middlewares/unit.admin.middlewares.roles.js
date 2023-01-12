import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminRolesMiddleware from '../../../../src/admins/api/middlewares/middlewares.roles';

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

  describe('Role middleware catch block unit testings', () => {
    it('should call adminAccess', async() => {
      const req = { admin: '' };
      const data = await AdminRolesMiddleware.adminAccess('users', 'read')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkRoleNameIsUnique', async() => {
      const req = { body: '', admin: '' };
      const data = await AdminRolesMiddleware.checkRoleNameIsUnique(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkAdminResources', async() => {
      const req = { body: '', admin: '' };
      const data = await AdminRolesMiddleware.checkAdminResources(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
