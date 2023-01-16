import { expect } from 'chai';
import sinon from 'sinon';
import enums from '../../../../src/users/lib/enums';
import * as AdminRolesController from '../../../../src/admins/api/controllers/controllers.roles';

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

  describe('Auth middleware catch block unit testings', () => {
    it('should call rolePermissions', async() => {
      const req = { admin: '', params: '' };
      const data = await AdminRolesController.rolePermissions(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });

    it('should call editRoleWithPermissions', async() => {
      const req = { admin: '', body: '', params: '' };
      const data = await AdminRolesController.editRoleWithPermissions(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });

    it('should call activateDeactivateRole', async() => {
      const req = { query: '', params: '' };
      const data = await AdminRolesController.activateDeactivateRole(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });

    it('should call createRole', async() => {
      const req = { body: '', admin: '', roleCode: '' };
      const data = await AdminRolesController.createRole(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });

    it('should call adminPermissionResources', async() => {
      const req = {  admin: '' };
      const data = await AdminRolesController.adminPermissionResources(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
    
    it('should call non-super admin roles', async() => {
      const req = {  admin: ''};
      const data = await AdminRolesController.nonSuperAdminRoles(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });

    it('should call delete role', async() => {
      const req = {  admin: '', params: ''};
      const data = await AdminRolesController.deleteRole(req, res, next);
      expect(data.code).to.equal(500);
      expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
    });
  });
  
  it('should call fetchRoles', async() => {
    const req = { query: '', admin: '' };
    const data = await AdminRolesController.fetchRoles(req, res, next);
    expect(data.code).to.equal(500);
    expect(data.error).to.equal('INTERNAL_SERVER_ERROR');
  });

});
