import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../src/users/lib/enums';
import * as UserController from '../../../src/users/api/controllers/controllers.user';

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

  describe('User controller catch block unit testings', () => {
    it('should call update fcm-token', async() => {
      const req = { body: undefined, user: undefined };
      await UserController.updateFcmToken(req, res, next);
      expect(res.code).to.equal(500);
      expect(res.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });

});

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

  describe('User controller catch block unit testings', () => {
    it('should call update refresh token', async() => {
      const req = { query: undefined, user: undefined };
      await UserController.updateUserRefreshToken(req, res, next);
      expect(res.code).to.equal(500);
      expect(res.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call update fcm token', async() => {
      const req = { user: '', body: undefined };
      await UserController.updateFcmToken(req, res, next);
      expect(res.code).to.equal(500);
      expect(res.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call update bvn', async() => {
      const req = { body: '', user: '' };
      await UserController.updateBvn(req, res, next);
      expect(res.code).to.equal(500);
      expect(res.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call requestEmailVerification', async() => {
      const req = { user: '', otp: '' };
      const data = await UserController.requestEmailVerification(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call verifyEmail', async() => {
      const req = { user: '' };
      const data = await UserController.verifyEmail(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call updateSelfieImage', async() => {
      const req = { user: '', body: '', otp: null };
      const data = await UserController.updateSelfieImage(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call idVerification', async() => {
      const req = { user: '', body: ''};
      const data = await UserController.idUploadVerification(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchAvailableBankLists', async() => {
      const req = { user: '' };
      const data = await UserController.fetchAvailableBankLists(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call returnAccountDetails', async() => {
      const req = { user: '', accountNumberDetails: '' };
      const data = await UserController.returnAccountDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call saveAccountDetails', async() => {
      const req = { user: '', body: '', accountNumberDetails: '' };
      const data = await UserController.saveAccountDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchUserAccountDetails', async() => {
      const req = { user: '' };
      const data = await UserController.fetchUserAccountDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call fetchUserDebitCards', async() => {
      const req = { user: '' };
      const data = await UserController.fetchUserDebitCards(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call deleteUserAccountDetails', async() => {
      const req = { user: '', params: '' };
      const data = await UserController.deleteUserAccountDetails(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call updateAccountDetailsChoice', async() => {
      const req = { user: '', params: '', query: { type: 'default' } };
      const data = await UserController.updateAccountDetailsChoice(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call updateUserProfile', async() => {
      const req = { user: '', body: ''};
      const data = await UserController.updateUserProfile(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should get user profile', async() => {
      const req = { user: '' };
      const data = await UserController.getProfile(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should set default card', async() => {
      const req = { user: '' , params: ''};
      const data = await UserController.setDefaultCard(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
