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
  });
});
