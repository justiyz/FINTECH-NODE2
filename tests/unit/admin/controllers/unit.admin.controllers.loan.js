import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminLoanController from '../../../../src/admins/api/controllers/controllers.loan';

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

  describe('Admin Loan controller catch block unit testings', () => {
    it('should call approveLoanApplication', async() => {
      const req = { body: '', admin: '', loanApplication: '', params: '' };
      const data = await AdminLoanController.approveLoanApplication(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call declineLoanApplication', async() => {
      const req = { body: '', admin: '', loanApplication: '', params: '' };
      const data = await AdminLoanController.declineLoanApplication(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call loanApplicationDetails', async() => {
      const req = { admin: '', loanApplication: '', params: '' };
      const data = await AdminLoanController.loanApplicationDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetcLoans', async() => {
      const req = { admin: '', query: ''};
      const data = await AdminLoanController.fetchLoans(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetcRepaidLoans', async() => {
      const req = { admin: '', query: ''};
      const data = await AdminLoanController.fetchRepaidLoans(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetcRescheduledLoans', async() => {
      const req = { admin: '', query: ''};
      const data = await AdminLoanController.fetchRescheduledLoans(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchSingleUserRescheduledLoan ', async() => {
      const req = { admin: '', params: ''};
      const data = await AdminLoanController.fetchSingleUserRescheduledLoan(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call approveClusterMemberLoanApplication', async() => {
      const req = { admin: '', loanApplication: '', params: '' };
      const data = await AdminLoanController.approveClusterMemberLoanApplication(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call declineClusterMemberLoanApplication', async() => {
      const req = { body: '', admin: '', loanApplication: '', params: '' };
      const data = await AdminLoanController.declineClusterMemberLoanApplication(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
