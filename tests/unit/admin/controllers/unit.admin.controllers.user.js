import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminUserController from '../../../../src/admins/api/controllers/controllers.user';

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

  describe('Admin user controller catch block unit testings', () => {
    it('should call checkIfAdminExists', async() => {
      const req = { admin: '', userDetails: '', params: '' };
      const data = await AdminUserController.userProfileDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call checkIfAdminExists', async() => {
      const req = { admin: '', params: '' };
      const data = await AdminUserController.userAccountInformation(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
