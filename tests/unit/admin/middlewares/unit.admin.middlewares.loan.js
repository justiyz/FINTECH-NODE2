import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminLoanMiddleware from '../../../../src/admins/api/middlewares/middlewares.loan';

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

  describe('Admin loan middleware catch block unit testings', () => {
    it('should call checkIfLoanExists', async() => {
      const req = { params: '', admin: '' };
      const data = await AdminLoanMiddleware.checkIfLoanExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfLoanStatusIsInReview', async() => {
      const req = { loanApplication: '', admin: '', body: '' };
      const data = await AdminLoanMiddleware.checkIfLoanStatusIsInReview(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfClusterMemberLoanExists', async() => {
      const req = { admin: '', params: '' };
      const data = await AdminLoanMiddleware.checkIfClusterMemberLoanExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
