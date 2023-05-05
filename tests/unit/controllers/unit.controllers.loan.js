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
    it('should call cancelLoanApplication', async() => {
      const req = { user: '', params: '' };
      const data = await LoanController.cancelLoanApplication(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call initiateLoanDisbursement', async() => {
      const req = { user: '', params: '', existingLoanApplication: '' };
      const data = await LoanController.initiateLoanDisbursement(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchPersonalLoanDetails', async() => {
      const req = { user: '', params: '' };
      const data = await LoanController.fetchPersonalLoanDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchUserCurrentLoans', async() => {
      const req = { user: '' };
      const data = await LoanController.fetchUserCurrentLoans(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchUserLoanPaymentTransactions', async() => {
      const req = { user: '', query: '' };
      const data = await LoanController.fetchUserLoanPaymentTransactions(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchPersonalLoanPaymentDetails', async() => {
      const req = { user: '', existingLoanPayment: '' };
      const data = await LoanController.fetchPersonalLoanPaymentDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call initiateManualLoanRepayment', async() => {
      const req = { user: '', params: '', existingLoanApplication: '', query: '' };
      const data = await LoanController.initiateManualLoanRepayment(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call initiateManualCardOrBankLoanRepayment', async() => {
      const req = { user: '', params: '', query: '', existingLoanApplication: '', userDebitCard: '', accountDetails: '' };
      const data = await LoanController.initiateManualCardOrBankLoanRepayment(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call submitPaymentOtp', async() => {
      const req = { user: '', body: '', params: '' };
      const data = await LoanController.submitPaymentOtp(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call acceptSystemMaximumAllowableLoanAmount', async() => {
      const req = { user: '', existingLoanApplication: '', params: '' };
      const data = await LoanController.acceptSystemMaximumAllowableLoanAmount(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
