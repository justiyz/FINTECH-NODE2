import { expect } from 'chai';
import * as Helpers from '../../../../../src/admins/lib/utils/lib.util.helpers';
import * as Hash from '../../../../../src/admins/lib/utils/lib.util.hash';

describe('Helpers unit Tests', () => {
  it('should generateRandomAlphabets', () => {
    const data = Helpers.generateRandomAlphabets(5);
    expect(data.length).to.equal(5);
    expect(data).to.be.a('string');
  });
  it('should generateRandomString', () => {
    const data = Hash.generateRandomString(3);
    expect(data.length).to.equal(6);
    expect(data).to.be.a('string');
  });
});

