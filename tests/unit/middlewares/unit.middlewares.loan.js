import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../src/users/lib/enums';
import * as LoanMiddleware from '../../../src/users/api/middlewares/middlewares.loan';

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

  describe('User middleware catch block unit testings', () => {
    it('should call checkUserLoanApplicationExists', async() => {
      const req = { params: '', user: '' };
      const data = await LoanMiddleware.checkUserLoanApplicationExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfLoanApplicationStatusIsCurrentlyApproved', async() => {
      const req = { user: '', existingLoanApplication: '' };
      const data = await LoanMiddleware.checkIfLoanApplicationStatusIsCurrentlyApproved(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});

