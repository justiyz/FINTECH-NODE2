import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminSettingsController from '../../../../src/admins/api/controllers/controllers.settings';

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

  describe('Settings controller catch block unit testings', () => {
    it('should call fetchEnvValues', async() => {
      const req = { admin: '' };
      const data = await AdminSettingsController.fetchEnvValues(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call updateEnvValues', async() => {
      const req = { admin: '', body: '' };
      const data = await AdminSettingsController.updateEnvValues(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call scoreCardBreakdown', async() => {
      const req = { admin: '' };
      const data = await AdminSettingsController.scoreCardBreakdown(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call createSystemPromo', async() => {
      const req = { admin: '', body: '', document: '' };
      const data = await AdminSettingsController.createSystemPromo(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchAllSystemPromos', async() => {
      const req = { admin: ''};
      const data = await AdminSettingsController.fetchAllSystemPromos(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchSinglePromo', async() => {
      const req = { admin: '', params: ''};
      const data = await AdminSettingsController.fetchSinglePromo(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call editPromoDetails', async() => {
      const req = { admin: '', params: '', document: '', body: '', promoDetails: ''};
      const data = await AdminSettingsController.editPromoDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call cancelPromo', async() => {
      const req = { admin: '', params: ''};
      const data = await AdminSettingsController.cancelPromo(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call deletePromo', async() => {
      const req = { admin: '', params: ''};
      const data = await AdminSettingsController.deletePromo(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchRewardPointDetails', async() => {
      const req = { admin: '', query: ''};
      const data = await AdminSettingsController.fetchRewardPointDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call updateClusterRelatedRewards', async() => {
      const req = { admin: '', body: ''};
      const data = await AdminSettingsController.updateClusterRelatedRewards(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call updateGeneralRewards', async() => {
      const req = { admin: '', body: ''};
      const data = await AdminSettingsController.updateGeneralRewards(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call updateGeneralRewardRanges', async() => {
      const req = { admin: '', body: ''};
      const data = await AdminSettingsController.updateGeneralRewardRanges(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
