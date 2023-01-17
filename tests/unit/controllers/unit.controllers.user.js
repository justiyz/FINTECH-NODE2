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
  });
});
