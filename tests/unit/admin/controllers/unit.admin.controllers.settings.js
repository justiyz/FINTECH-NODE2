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
  });
});
