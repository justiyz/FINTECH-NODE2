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
    it('should call checkIfUserHasActivePersonalLoan', async() => {
      const req = { user: '' };
      const data = await LoanMiddleware.checkIfUserHasActivePersonalLoan(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfLoanApplicationStatusIsStillPending', async() => {
      const req = { user: '', existingLoanApplication: '' };
      const data = await LoanMiddleware.checkIfLoanApplicationStatusIsStillPending(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call validateLoanAmountAndTenor', async() => {
      const req = { user: '', body: '' };
      const data = await LoanMiddleware.validateLoanAmountAndTenor(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call validateRenegotiationAmount', async() => {
      const req = { user: '', body: '', existingLoanApplication: '' };
      const data = await LoanMiddleware.validateRenegotiationAmount(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkSeedfiPaystackBalance', async() => {
      const req = { user: '', existingLoanApplication: '' };
      const data = await LoanMiddleware.checkSeedfiPaystackBalance(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call generateLoanDisbursementRecipient', async() => {
      const req = { user: '' };
      const data = await LoanMiddleware.generateLoanDisbursementRecipient(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkUserLoanPaymentExists', async() => {
      const req = { user: '', params: '' };
      const data = await LoanMiddleware.checkUserLoanPaymentExists('cluster')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfEmploymentTypeLimitApplies', async() => {
      const req = { userEmploymentDetails: '', user: '', body: '' };
      const data = await LoanMiddleware.checkIfEmploymentTypeLimitApplies(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfUserBvnNotBlacklisted', async() => {
      const req = {  user: '' };
      const data = await LoanMiddleware.checkIfUserBvnNotBlacklisted(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfOngoingLoanApplication', async() => {
      const req = {  user: '', existingLoanApplication: '' };
      const data = await LoanMiddleware.checkIfOngoingLoanApplication(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkRescheduleExtensionExists', async() => {
      const req = {  user: '', query: '' };
      const data = await LoanMiddleware.checkRescheduleExtensionExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkLoanReschedulingRequest', async() => {
      const req = {  user: '', query: '' };
      const data = await LoanMiddleware.checkLoanReschedulingRequest(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfUserHasClusterDiscount', async() => {
      const req = {  user: '' };
      const data = await LoanMiddleware.checkIfUserHasClusterDiscount(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call additionalUserChecksForLoan', async() => {
      const req = {  user: '' };
      const data = await LoanMiddleware.additionalUserChecksForLoan(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});

