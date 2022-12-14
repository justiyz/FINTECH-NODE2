import { expect } from 'chai';
import 'dotenv/config';
import * as Hash from '../../../../src/lib/utils/lib.util.hash';

describe('Hash unit Tests', () => {
  it('should generateRandomString', () => {
    const data = Hash.generateRandomString(5);
    expect(data.length).to.equal(10);
    expect(data).to.be.a('string');
  });
  it('should generateAuthToken', () => {
    const data = Hash.generateAuthToken({ user_id: 'ur-74yh678ty8y78768ryry' });
    process.env.SEEDFI_TESTING_AUTH_TOKEN = data;
    expect(data).to.be.a('string');
  });
  it('should hashData', () => {
    const data = Hash.hashData('myNameSeedfi');
    expect(data).to.be.a('string');
  });
  it('should decodeToken', () => {
    const data = Hash.decodeToken(process.env.SEEDFI_TESTING_AUTH_TOKEN);
    expect(data).to.be.an('object');
    expect(data).to.have.property('iat');
    expect(data).to.have.property('exp');
    expect(data.user_id).to.equal('ur-74yh678ty8y78768ryry');
  });
});

