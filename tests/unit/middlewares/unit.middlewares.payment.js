import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../src/users/lib/enums';
import * as PaymentMiddleware from '../../../src/users/api/middlewares/middlewares.payment';

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

  describe('Payment middleware catch block unit testings', () => {
    it('should call paystackWebhookVerification', async() => {
      const req = { body: '' };
      const data = await PaymentMiddleware.paystackWebhookVerification(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call verifyPaystackPaymentStatus', async() => {
      const req = { body: '' };
      const data = await PaymentMiddleware.verifyPaystackPaymentStatus(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call verifyTransactionPaymentRecord', async() => {
      const req = { body: '' };
      const data = await PaymentMiddleware.verifyTransactionPaymentRecord(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call handleTransactionRefundResponse', async() => {
      const req = { body: '', paymentRecord: '' };
      const data = await PaymentMiddleware.handleTransactionRefundResponse(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call updatePaymentHistoryStatus', async() => {
      const req = { body: '', paymentRecord: '' };
      const data = await PaymentMiddleware.updatePaymentHistoryStatus(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call saveCardAuth', async() => {
      const req = { body: '', paymentRecord: '' };
      const data = await PaymentMiddleware.saveCardAuth(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call raiseRefundForCardTokenization', async() => {
      const req = { body: '', paymentRecord: '' };
      const data = await PaymentMiddleware.raiseRefundForCardTokenization(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call processPersonalLoanTransferPayments', async() => {
      const req = { body: '', paymentRecord: '' };
      const data = await PaymentMiddleware.processPersonalLoanTransferPayments(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call processPersonalLoanRepayments', async() => {
      const req = { body: '', paymentRecord: '' };
      const data = await PaymentMiddleware.processPersonalLoanRepayments(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    it('should call processClusterLoanTransferPayments', async() => {
      const req = { body: '', paymentRecord: '' };
      const data = await PaymentMiddleware.processClusterLoanTransferPayments(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
});
