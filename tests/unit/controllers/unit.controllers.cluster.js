import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../src/users/lib/enums';
import * as ClusterController from '../../../src/users/api/controllers/controllers.cluster';

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
    it('should call requestToJoinCluster', async() => {
      const req = { user: '', cluster: '' };
      const data = await ClusterController.requestToJoinCluster(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call finalClusterDecision', async() => {
      const req = { user: '', votingTicketDetails: '' };
      const data = await ClusterController.finalClusterDecision(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call joinClusterOnInvitation', async() => {
      const req = { user: '', body: '', params: '', cluster: '' };
      const data = await ClusterController.joinClusterOnInvitation(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call createCluster', async() => {
      const req = { user: '', body: '' };
      const data = await ClusterController.createCluster(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchClusters', async() => {
      const req = { query: null, user: null};
      const data = await ClusterController.fetchClusters(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchClusterDetails', async() => {
      const req = { params: null, user: null};
      const data = await ClusterController.fetchClusterDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call inviteClusterMember', async() => {
      const req = { params: null, body: null, user: null};
      const data = await ClusterController.inviteClusterMember(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });

    it('should call fetchClusterMembers', async() => {
      const req = { params: null, user: null};
      const data = await ClusterController.fetchClusterMembers(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    
    it('should call leaveCluster', async() => {
      const req = { params: null, user: ''};
      const data = await ClusterController.leaveCluster(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });

    it('should call editCluster', async() => {
      const req = { params: null, user: '', cluster: ''};
      const data = await ClusterController.editCluster(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call initiateDeleteCluster', async() => {
      const req = {  params: null, cluster: '', user: '', body: '' };
      const data = await ClusterController.initiateDeleteCluster(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call suggestNewClusterAdmin', async() => {
      const req = { params: null, cluster: '', user: ''};
      const data = await ClusterController.suggestNewClusterAdmin(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkClusterAdminClusterLoanEligibility', async() => {
      const req = { user: '', body: '', userEmploymentDetails: '', cluster: '', userDefaultAccountDetails: '' };
      const data = await ClusterController.checkClusterAdminClusterLoanEligibility(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call processClusterLoanRenegotiation', async() => {
      const req = { user: '', body: '', existingLoanApplication: '' };
      const data = await ClusterController.processClusterLoanRenegotiation(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchClusterMemberLoanDetails', async() => {
      const req = { user: '', existingLoanApplication: '' };
      const data = await ClusterController.fetchClusterMemberLoanDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkClusterMemberClusterLoanEligibility', async() => {
      const req = { user: '', body: '', userEmploymentDetails: '', existingLoanApplication: '', userDefaultAccountDetails: '' };
      const data = await ClusterController.checkClusterMemberClusterLoanEligibility(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call clusterMemberLoanDecision', async() => {
      const req = { user: '', body: '', existingLoanApplication: '' };
      const data = await ClusterController.clusterMemberLoanDecision(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call initiateClusterLoanDisbursement', async() => {
      const req = { user: '', params: '', userTransferRecipient: '', existingLoanApplication: '', newClusterAmountValues: '' };
      const data = await ClusterController.initiateClusterLoanDisbursement(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call initiateManualClusterLoanRepayment', async() => {
      const req = { user: '', params: '', query: '', existingLoanApplication: '' };
      const data = await ClusterController.initiateManualClusterLoanRepayment(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call initiateManualCardOrBankClusterLoanRepayment', async() => {
      const req = { user: '', params: '', query: '', existingLoanApplication: '', userDebitCard: '' };
      const data = await ClusterController.initiateManualCardOrBankClusterLoanRepayment(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchCurrentClusterLoan', async() => {
      const req = { user: '', params: '' };
      const data = await ClusterController.fetchCurrentClusterLoan(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call clusterLoanReschedulingSummary', async() => {
      const req = { user: '', loanRescheduleExtensionDetails: '', existingLoanApplication: '' };
      const data = await ClusterController.clusterLoanReschedulingSummary(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call processClusterLoanRescheduling', async() => {
      const req = { user: '', loanRescheduleRequest: '', existingLoanApplication: '' };
      const data = await ClusterController.processClusterLoanRescheduling(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
