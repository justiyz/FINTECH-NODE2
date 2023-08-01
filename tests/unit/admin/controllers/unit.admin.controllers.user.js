import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminUserController from '../../../../src/admins/api/controllers/controllers.user';

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

  describe('Admin user controller catch block unit testings', () => {
    it('should call checkIfAdminExists', async() => {
      const req = { admin: '', userDetails: '', params: '' };
      const data = await AdminUserController.userProfileDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfAdminExists', async() => {
      const req = { admin: '', params: '' };
      const data = await AdminUserController.userAccountInformation(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call editUserStatus', async() => {
      const req = { body: '', admin: '', params: '', userDetails: '' };
      const data = await AdminUserController.editUserStatus(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchUsers', async() => {
      const req = { admin: '', query: '' };
      const data = await AdminUserController.fetchUsers(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call saveUserUploadedDocument', async() => {
      const req = { admin: '', userDetails: '', body: '', document: '' };
      const data = await AdminUserController.saveUserUploadedDocument(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchAdminUploadedUserDocuments', async() => {
      const req = { admin: '', userDetails: '' };
      const data = await AdminUserController.fetchAdminUploadedUserDocuments(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchUserOrrBreakdown', async() => {
      const req = { admin: '', userDetails: '' };
      const data = await AdminUserController.fetchUserOrrBreakdown(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchUserKycDetails', async() => {
      const req = { admin: '', params: '' };
      const data = await AdminUserController.fetchUserKycDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call sendNotifications', async() => {
      const req = { admin: '', userDetails: '', query: '' };
      const data = await AdminUserController.sendNotifications(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchingUserClusterDetails', async() => {
      const req = { admin: '', params: null, cluster: '' };
      const data = await AdminUserController.fetchingUserClusterDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call verifyUserUtilityBill', async() => {
      const req = { admin: '', body: '', userAddressDetails: '', userDetails: '' };
      const data = await AdminUserController.verifyUserUtilityBill(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call userClusters', async() => {
      const req = { admin: '', params: null };
      const data = await AdminUserController.userClusters(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchUserRewards', async() => {
      const req = { admin: '', params: null, query: '' };
      const data = await AdminUserController.fetchUserRewards(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call setUserPointsToZero', async() => {
      const req = { admin: '', params: null };
      const data = await AdminUserController.resetUserPointsToZero(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call setAllUsersPointsToZero', async() => {
      const req = { admin: '' };
      const data = await AdminUserController.resetAllUsersPointsToZero(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
