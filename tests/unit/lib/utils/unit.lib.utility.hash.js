import { expect } from 'chai';
import 'dotenv/config';
import * as Hash from '../../../../src/users/lib/utils/lib.util.hash';

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
    process.env.SEEDFI_TESTING_HASH_TOKEN = data;
    expect(data).to.be.a('string');
  });
  it('should decodeToken', () => {
    const data = Hash.decodeToken(process.env.SEEDFI_TESTING_AUTH_TOKEN);
    expect(data).to.be.an('object');
    expect(data).to.have.property('iat');
    expect(data).to.have.property('exp');
    expect(data.user_id).to.equal('ur-74yh678ty8y78768ryry');
  });
  it('should compareData', () => {
    const data = Hash.compareData('myNameSeedfi', process.env.SEEDFI_TESTING_HASH_TOKEN);
    expect(data).to.be.a('boolean');
    expect(data).to.equal(true);
  });
  it('should encrypt value', async() => {
    const data = await Hash.encrypt('30028900567890');
    expect(data).to.be.a('string');
    process.env.SEEDFI_TESTING_ENCRYPT_VALUE = data;
  });
  it('should decrypt encrypted value', async() => {
    const data = await Hash.decrypt(process.env.SEEDFI_TESTING_ENCRYPT_VALUE);
    expect(data).to.be.a('string');
    expect(data).to.equal('30028900567890');
  });
});

