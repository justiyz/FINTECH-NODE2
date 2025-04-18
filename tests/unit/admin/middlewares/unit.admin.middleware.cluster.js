import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminClusterMiddleware from '../../../../src/admins/api/middlewares/middlewares.cluster';

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

  describe('Cluster middleware catch block unit testings', () => {
    it('should call checkIfClusterNameUnique', async() => {
      const req = { admin: '', body: '' };
      const data = await AdminClusterMiddleware.checkIfClusterNameUnique(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call generateClusterUniqueCode', async() => {
      const req = { admin: '', body: '' };
      const data = await AdminClusterMiddleware.generateClusterUniqueCode(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfClusterExists', async() => {
      const req = { params: '', admin: '' };
      const data = await AdminClusterMiddleware.checkIfClusterExists('active')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkClusterCurrentStatus', async() => {
      const req = { cluster: '', admin: '', body: '' };
      const data = await AdminClusterMiddleware.checkClusterCurrentStatus(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkClusterLoanStatus', async() => {
      const req = { cluster: '', admin: '' };
      const data = await AdminClusterMiddleware.checkClusterLoanStatus(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkUserClusterLoanStatus', async() => {
      const req = { userClusterDetails: '', admin: '' };
      const data = await AdminClusterMiddleware.checkUserClusterLoanStatus(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call clusterMemberBulkInvite', async() => {
      const req = { cluster: '', body: '' };
      const data = await AdminClusterMiddleware.clusterMemberBulkInvite(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call adminClusterRestriction', async() => {
      const req = { cluster: '' };
      const data = await AdminClusterMiddleware.adminClusterRestriction(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
