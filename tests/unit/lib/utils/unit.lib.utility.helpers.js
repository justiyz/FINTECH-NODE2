import { expect } from 'chai';
import * as Helpers from '../../../../src/users/lib/utils/lib.util.helpers';

describe('Helpers unit Tests', () => {
  it('should generateOtp', () => {
    const data = Helpers.generateOtp();
    expect(data.length).to.equal(6);
    expect(data).to.be.a('string');
  });
  it('should generateReferralCode', () => {
    const data = Helpers.generateReferralCode(5);
    expect(data.length).to.equal(10);
    expect(data).to.be.a('string');
  });
});

