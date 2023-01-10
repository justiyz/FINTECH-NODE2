import { expect } from 'chai';
import * as Helpers from '../../../../../src/admins/lib/utils/lib.util.helpers';

describe('Helpers unit Tests', () => {
  it('should generateRandomAlphabets', () => {
    const data = Helpers.generateRandomAlphabets(5);
    expect(data.length).to.equal(6);
    expect(data).to.be.a('string');
  });
});

