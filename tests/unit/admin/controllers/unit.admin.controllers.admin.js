import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminController from '../../../../src/admins/api/controllers/controllers.admin';
import * as BvnController from '../../../../src/admins/api/controllers/controllers.bvn';

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
    it('should call completeAdminProfile', async() => {
      const req = { body: '', admin: '' };
      const data = await AdminController.completeAdminProfile(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call adminPermissions', async() => {
      const req = { adminUser: '', admin: '' };
      const data = await AdminController.adminPermissions(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call editAdminPermissions', async() => {
      const req = { body: '', admin: '', params: '' };
      const data = await AdminController.editAdminPermissions(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call inviteAdmin', async() => {
      const req = { token: '', admin: '' };
      const data = await AdminController.inviteAdmin(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchAllAdmins', async() => {
      const req = { token: '', params: '' };
      const data = await AdminController.fetchAllAdmins(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call editAdminStatus', async() => {
      const req = { token: '', params: '', body: '' };
      const data = await AdminController.editAdminStatus(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should get admin profile', async() => {
      const req = { admin: '' };
      const data = await AdminController.getProfile(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should get platform overview', async() => {
      const req = { admin: '', query: '' };
      const data = await AdminController.fetchPlatformOverview(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call blacklistedBvn', async() => {
      const req = { body: '', admin: '', query: '' };
      const data = await BvnController.addBlacklistedBvns(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchBlacklistedBvn', async() => {
      const req = { admin: '', query: '' };
      const data = await BvnController.fetchBlacklistedBvn(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
