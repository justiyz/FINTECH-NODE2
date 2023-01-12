import { expect } from 'chai';
import 'dotenv/config';
import * as Hash from '../../../../../src/admins/lib/utils/lib.util.hash';

describe('Admin Hash unit Tests', () => {
  it('should generateAuthToken', () => {
    const data = Hash.generateAdminAuthToken({ admin_id: 'ad-74yh6778988ty8y78768ryry' });
    process.env.SEEDFI_TESTING_AUTH_TOKEN = data;
    expect(data).to.be.a('string');
  });
  it('should hashData', () => {
    const data = Hash.hashData('myNameSeedfi');
    process.env.SEEDFI_TESTING_HASH_TOKEN = data;
    expect(data).to.be.a('string');
  });
  it('should decrypt encrypted value', async() => {
    const data = await Hash.generateAdminResetPasswordToken({ email: 'admin@seedfi.ng' });
    process.env.SEEDFI_TESTING_RESET_PASSWORD_TOKEN = data;
    expect(data).to.be.a('string');
  });
});
