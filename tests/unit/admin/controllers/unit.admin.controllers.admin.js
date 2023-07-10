import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminController from '../../../../src/admins/api/controllers/controllers.admin';
import * as BvnController from '../../../../src/admins/api/controllers/controllers.bvn';
import * as NotificationController from '../../../../src/admins/api/controllers/controller.notification';

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
      const req = { body: { role_code: 'THUJKLG', email: 'u@mail.com' }, token: '', admin: '' };
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
      const req = { token: '', params: '', body: '', adminUser: '' };
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
    it('should call fetchActivityLog', async() => {
      const req = { admin: '', query: '' };
      const data = await AdminController.fetchActivityLog(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call unblacklistBvn', async() => {
      const req = { admin: '', body: '' };
      const data = await BvnController.unblacklistBvn(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call loanRepaymentReport', async() => {
      const req = { admin: '', query: '' };
      const data = await AdminController.loanRepaymentReport(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchLoanManagementAnalytics', async() => {
      const req = { admin: '', query: '' };
      const data = await AdminController.fetchLoanManagementAnalytics(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchClusterManagementAnalytics', async() => {
      const req = { admin: '', query: '' };
      const data = await AdminController.fetchClusterManagementAnalytics(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call updateSingleNotification', async() => {
      const req = { admin: '', params: '' };
      const data = await NotificationController.updateSingleNotification(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call updateAllNotificationsAsRead', async() => {
      const req = { admin: '' };
      const data = await NotificationController.updateAllNotificationsAsRead(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call sendNotifications', async() => {
      const req = { body: '', admin: '' };
      const data = await NotificationController.sendNotifications(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchNotifications', async() => {
      const req = { query: '', admin: '' };
      const data = await NotificationController.fetchNotifications(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call deleteNotification', async() => {
      const req = { params: '', admin: '' };
      const data = await NotificationController.deleteNotification(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
