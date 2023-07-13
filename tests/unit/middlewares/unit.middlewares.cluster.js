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
    it('should call checkIfClusterExists', async() => {
      const req = { user: '', params: '', votingTicketDetails: '' };
      const data = await ClusterMiddlewares.checkIfClusterExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call confirmClusterIsStillOpenForJoining', async() => {
      const req = { user: '', cluster: '' };
      const data = await ClusterMiddlewares.confirmClusterIsStillOpenForJoining('join')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfAlreadyClusterMember', async() => {
      const req = { user: '', cluster: '' };
      const data = await ClusterMiddlewares.checkIfAlreadyClusterMember('authenticate')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfPublicOrPrivateCluster', async() => {
      const req = { user: '', cluster: '' };
      const data = await ClusterMiddlewares.checkIfPublicOrPrivateCluster('private')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfClusterDecisionTicketExists', async() => {
      const req = { user: '', params: '' };
      const data = await ClusterMiddlewares.checkIfClusterDecisionTicketExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIClusterDecisionHasBeenConcluded', async() => {
      const req = { user: '', votingTicketDetails: '' };
      const data = await ClusterMiddlewares.checkIClusterDecisionHasBeenConcluded(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfUserHasPreviouslyDecided', async() => {
      const req = { user: '', params: '' };
      const data = await ClusterMiddlewares.checkIfUserHasPreviouslyDecided(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call userTakesRequestToJoinClusterDecision', async() => {
      const req = { user: '', body: '', votingTicketDetails: '', cluster: '', clusterMember: '', params: '' };
      const data = await ClusterMiddlewares.userTakesRequestToJoinClusterDecision(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call confirmUserClusterInvitation', async() => {
      const req = { user: '', cluster: '', params: '' };
      const data = await ClusterMiddlewares.confirmUserClusterInvitation(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call compareUserMonthlyIncome', async() => {
      const req = { user: '', body: '' };
      const data = await ClusterMiddlewares.compareUserMonthlyIncome(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call generateClusterUniqueCode', async() => {
      const req = { body: '', user: '' };
      const data = await ClusterMiddlewares.generateClusterUniqueCode(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfInviteeAlreadyExist', async() => {
      const req = { params: null, user: null };
      const data = await ClusterMiddlewares.checkIfInviteeAlreadyClusterMember(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfClusterMemberIsAdmin', async() => {
      const req = { params: null, user: '' };
      const data = await ClusterMiddlewares.checkIfClusterMemberIsAdmin(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfUserCanLeaveCluster', async() => {
      const req = { cluster: '', user: '' };
      const data = await ClusterMiddlewares.checkIfUserCanLeaveCluster(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call requestToDeleteCluster', async() => {
      const req = { params: null, body: '', cluster: '', user: '', votingTicketDetails: ''  };
      const data = await ClusterMiddlewares.requestToDeleteCluster(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call newAdminClusterAcceptance', async() => {
      const req = { params: null, body: '', cluster: '', user: '', votingTicketDetails: ''  }; 
      const data = await ClusterMiddlewares.newAdminClusterAcceptance(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfThereIsMoreThanOnePersonInTheCluster', async() => {
      const req = { cluster: '', user: '', body: '' };
      const data = await ClusterMiddlewares.checkIfThereIsMoreThanOnePersonInTheCluster(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfUserBelongsToTypeOfCluster', async() => {
      const req = { cluster: '', user: '' };
      const data = await ClusterMiddlewares.checkIfUserBelongsToTypeOfCluster(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkClusterMembersNumber', async() => {
      const req = { cluster: '', user: '' };
      const data = await ClusterMiddlewares.checkClusterMembersNumber(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfClusterHasActiveLoan', async() => {
      const req = { cluster: '', user: '' };
      const data = await ClusterMiddlewares.checkIfClusterHasActiveLoan(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfUserHasActiveClusterLoan', async() => {
      const req = { user: '' };
      const data = await ClusterMiddlewares.checkIfUserHasActiveClusterLoan(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call totalLoanAmountVerificationAndBreakdown', async() => {
      const req = { user: '', cluster: '', body: '' };
      const data = await ClusterMiddlewares.totalLoanAmountVerificationAndBreakdown(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfMemberClusterLoanApplicationExists', async() => {
      const req = { user: '', params: '' };
      const data = await ClusterMiddlewares.checkIfMemberClusterLoanApplicationExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfMemberClusterLoanApplicationStatusIsStillPending', async() => {
      const req = { user: '', existingLoanApplication: '' };
      const data = await ClusterMiddlewares.checkIfMemberClusterLoanApplicationStatusIsStillPending(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfClusterLoanApplicationExists', async() => {
      const req = { user: '', params: '' };
      const data = await ClusterMiddlewares.checkIfClusterLoanApplicationExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchGeneralClusterNewLoanAmountValues', async() => {
      const req = { user: '', clusterLoanDetails: '' };
      const data = await ClusterMiddlewares.fetchGeneralClusterNewLoanAmountValues(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkClusterLoanReschedulingRequest', async() => {
      const req = { user: '', params: '' };
      const data = await ClusterMiddlewares.checkClusterLoanReschedulingRequest(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
