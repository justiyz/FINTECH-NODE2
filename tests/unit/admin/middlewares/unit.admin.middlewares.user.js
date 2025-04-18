import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminUserMiddleware from '../../../../src/admins/api/middlewares/middlewares.user';

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

  describe('Admin User middleware catch block unit testings', () => {
    it('should call checkIfAdminExists', async() => {
      const req = { params: '' };
      const data = await AdminUserMiddleware.checkIfUserExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call uploadDocument', async() => {
      const req = { files: '', userDetails: '', body: '', admin: '' };
      const data = await AdminUserMiddleware.uploadDocument(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call userLoanStatus', async() => {
      const req = { userDetails: '' };
      const data = await AdminUserMiddleware.userLoanStatus(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkUserCurrentStatus', async() => {
      const req = { userDetails: '', body: '', admin: '' };
      const data = await AdminUserMiddleware.checkUserCurrentStatus(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call adminCheckIfClusterExists', async() => {
      const req = { params: null };
      const data = await AdminUserMiddleware.adminCheckIfClusterExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfUserBelongsToCluster', async() => {
      const req = { params: null, cluster: '' };
      const data = await AdminUserMiddleware.checkIfUserBelongsToCluster(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
