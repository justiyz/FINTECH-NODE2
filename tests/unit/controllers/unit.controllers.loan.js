import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../src/users/lib/enums';
import * as LoanController from '../../../src/users/api/controllers/controllers.loan';

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
    it('should call initializeCardTokenizationPayment', async() => {
      const req = { user: '', body: '' };
      const data = await LoanController.checkUserLoanEligibility(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
