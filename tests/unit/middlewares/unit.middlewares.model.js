import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../src/lib/enums';
import validateData from '../../../src/api/middlewares/middlewares.model';

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

  describe('Model middleware catch block unit testings', () => {
    it('should call validateData', async() => {
      const req = { query: '', body: '' };
      const data = await validateData(null, '')(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
