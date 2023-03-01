import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../src/users/lib/enums';
import * as ClusterMiddlewares from '../../../src/users/api//middlewares/middlewares.cluster';

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
      const req = { user: '', body: '' };
      const data = await ClusterMiddlewares.checkIfClusterNameUnique(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call compareUserIncomeRange', async() => {
      const req = { user: '', body: '' };
      const data = await ClusterMiddlewares.compareUserIncomeRange(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call generateClusterUniqueCode', async() => {
      const req = { body: '', user: '' };
      const data = await ClusterMiddlewares.generateClusterUniqueCode(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
