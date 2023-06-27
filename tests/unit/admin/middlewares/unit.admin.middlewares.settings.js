import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminSettingsMiddleware from '../../../../src/admins/api/middlewares/middlewares.settings';

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
    it('should call checkIfPromoAlreadyExists', async() => {
      const req = { admin: '', body: '' };
      const data = await AdminSettingsMiddleware.checkIfPromoAlreadyExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfStartOrEndDateHasPassed', async() => {
      const req = { admin: '', body: '' };
      const data = await AdminSettingsMiddleware.checkIfStartOrEndDateHasPassed(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfPromoExists', async() => {
      const req = { admin: '', params: '' };
      const data = await AdminSettingsMiddleware.checkIfPromoExists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkPromoStatus ', async() => {
      const req = { admin: '', params: '' };
      const data = await AdminSettingsMiddleware.checkPromoStatus(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfPromoIsActive ', async() => {
      const req = { admin: '', params: '' };
      const data = await AdminSettingsMiddleware.checkIfPromoIsActive(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfAdminCreatedPromo ', async() => {
      const req = { admin: null, params: null, body: null };
      const data = await AdminSettingsMiddleware.checkIfAdminCreatedPromo(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
