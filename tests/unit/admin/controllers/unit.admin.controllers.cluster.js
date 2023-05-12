import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminClusterController from '../../../../src/admins/api/controllers/controllers.cluster';

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

  describe('Cluster controller catch block unit testings', () => {
    it('should call createCluster', async() => {
      const req = { admin: '', body: '' };
      const data = await AdminClusterController.createCluster(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchAndFilterClusters', async() => {
      const req = { admin: '', query: '' };
      const data = await AdminClusterController.fetchAndFilterClusters(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchSingleClusterDetails', async() => {
      const req = { admin: '', query: '' };
      const data = await AdminClusterController.fetchSingleClusterDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
