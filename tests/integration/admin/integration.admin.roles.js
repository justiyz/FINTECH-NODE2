import chai from 'chai';
import chaiHttp from 'chai-http';
import 'dotenv/config';
import app from '../../../src/app';
import enums from '../../../src/users/lib/enums';

const { expect } = chai;
chai.use(chaiHttp);

describe('Admin roles', () => {  
  describe('Fetch all non-super admin roles', () => {
    it('Should fetch all non-super admin roles', (done) => {
      chai.request(app)
        .get('/api/v1/admin/role/regular-admins')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.NON_SUPER_ADMINS_FETCHED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });
      
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/role/regular-admins')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('invalid signature');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
      
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .get('/api/v1/admin/role/regular-admins')
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Please provide a token');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });

  describe('Create Admin role', () => {
    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .send({
          name: 'Head ops'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.NO_TOKEN);
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .send({
          name: 'Head ops'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('invalid signature');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if name is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          permissions: [
            {
              resource_id: process.env.SEEDFI_ADMIN_USER_RESOURCE_ID,
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('name is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if permission is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head ops'
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('permissions is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if empty array permission is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head ops',
          permissions: [ ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('permissions does not contain 1 required value(s)');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if resource id is not sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head ops',
          permissions: [ 
            {
              user_permissions: [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('permissions[0].resource_id is required');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
    it('Should return error if an invalid user permission option is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head ops',
          permissions: [ 
            {
              resource_id: process.env.SEEDFI_ADMIN_USER_RESOURCE_ID,
              user_permissions: [ 'create', 'view', 'edit', 'delete' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(422);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('permissions[0].user_permissions[1] must be one of [create, read, update, delete, approve, reject]');
          expect(res.body.error).to.equal('UNPROCESSABLE_ENTITY');
          expect(res.body.status).to.equal(enums.ERROR_STATUS); 
          done();
        });
    });
    it('Should return error if an already existing admin name is sent', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Super Admin',
          permissions: [ 
            {
              resource_id: process.env.SEEDFI_ADMIN_USER_RESOURCE_ID,
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(409);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ADMIN_ROLE_NAME_EXISTS('Super Admin'));
          expect(res.body.error).to.equal('CONFLICT');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });

    it('Should create role for head sales successfully', (done) => {
      chai.request(app)
        .post('/api/v1/admin/role')
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .send({
          name: 'Head sales',
          permissions: [ 
            {
              resource_id: `${process.env.SEEDFI_ADMIN_USER_RESOURCE_ID}`,
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ADMINISTRATORS_RESOURCE_ID}`,
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_LOAN_APPLICATION_RESOURCE_ID}`,
              user_permissions:  [ 'create', 'read', 'update', 'delete', 'approve', 'reject' ]
            },
            {
              resource_id: `${process.env.SEEDFI_ADMIN_ROLE_MANAGEMENT_RESOURCE_ID}`,
              user_permissions:  [ 'read' ]
            }
          ]
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(enums.HTTP_OK);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.equal(enums.ROLE_CREATION_SUCCESSFUL);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          expect(res.body.data.name).to.equal('Head sales');
          process.env.SEEDFI_ADMIN_ROLE_TYPE = res.body.data.roleCode;
          done();
        });
    });
  });

  describe('Delete a particular role', () => {
    it('Should delete a role', (done) => {
      chai.request(app)
        .delete(`/api/v1/admin/role/${process.env.SEEDFI_ADMIN_ROLE_TYPE}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(200);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal(enums.ROLE_DELETED_SUCCESSFULLY);
          expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
          done();
        });
    });

    it('Should return error if invalid token is set', (done) => {
      chai.request(app)
        .delete(`/api/v1/admin/role/${process.env.SEEDFI_ADMIN_ROLE_TYPE}`)
        .set({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
        })
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('invalid signature');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });

    it('Should return error if token is not set', (done) => {
      chai.request(app)
        .delete(`/api/v1/admin/role/${process.env.SEEDFI_ADMIN_ROLE_TYPE}`)
        .end((err, res) => {
          expect(res.statusCode).to.equal(401);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Please provide a token');
          expect(res.body.error).to.equal('UNAUTHORIZED');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });

    it('Should return error if role code is not sent', (done) => {
      chai.request(app)
        .delete('/api/v1/admin/role/')
        .end((err, res) => {
          expect(res.statusCode).to.equal(404);
          expect(res.body).to.have.property('message');
          expect(res.body).to.have.property('status');
          expect(res.body.message).to.equal('Resource Not Found');
          expect(res.body.status).to.equal(enums.ERROR_STATUS);
          done();
        });
    });
  });
});

describe('Fetch roles', () => {
  it('Should fetch all roles', (done) => {
    chai.request(app)
      .get('/api/v1/admin/role/fetch-roles')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
      })
      .end((err, res) => {
        console.log(res.body);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal(enums.ROLES_FETCHED_SUCCESSFULLY);
        expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
        done();
      });
  });
  it('Should return error if invalid token is set', (done) => {
    chai.request(app)
      .get('/api/v1/admin/role/fetch-roles')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal('invalid signature');
        expect(res.body.error).to.equal('UNAUTHORIZED');
        expect(res.body.status).to.equal(enums.ERROR_STATUS);
        done();
      });
  });

  it('Should fetch roles by the role name', (done) => {
    chai.request(app)
      .get('/api/v1/admin/role/fetch-roles')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
      })
      .query({
        search: 'head socials'
      })
      .end((err, res) => {
        console.log(res.body);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal(enums.ROLES_FETCHED_SUCCESSFULLY);
        expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
        done();
      });
  });

  it('Should return error if invalid token is set', (done) => {
    chai.request(app)
      .get('/api/v1/admin/role/fetch-roles')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
      })
      .query({
        search: 'head socials'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal('invalid signature');
        expect(res.body.error).to.equal('UNAUTHORIZED');
        expect(res.body.status).to.equal(enums.ERROR_STATUS);
        done();
      });
  });

  it('Should filter roles by the role status ', (done) => {
    chai.request(app)
      .get('/api/v1/admin/role/fetch-roles')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
      })
      .query({
        status: 'active'
      })
      .end((err, res) => {
        console.log(res.body);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal(enums.ROLES_FETCHED_SUCCESSFULLY);
        expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
        done();
      });
  });

  it('Should return error if invalid token is set', (done) => {
    chai.request(app)
      .get('/api/v1/admin/role/fetch-roles')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
      })
      .query({
        status: 'active'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal('invalid signature');
        expect(res.body.error).to.equal('UNAUTHORIZED');
        expect(res.body.status).to.equal(enums.ERROR_STATUS);
        done();
      });
  });

  it('Should filter roles by the date they were created ', (done) => {
    chai.request(app)
      .get('/api/v1/admin/role/fetch-roles')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
      })
      .query({
        from_date: '2023-01-13 23:03:09.875717',
        to_date: '2023-01-14 23:03:09.875717'
      })
      .end((err, res) => {
        console.log(res.body);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal(enums.ROLES_FETCHED_SUCCESSFULLY);
        expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
        done();
      });
  });

  it('Should return error if invalid token is set', (done) => {
    chai.request(app)
      .get('/api/v1/admin/role/fetch-roles')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
      })
      .query({
        from_date: '2023-01-13 23:03:09.875717',
        to_date: '2023-01-14 23:03:09.875717+01'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal('invalid signature');
        expect(res.body.error).to.equal('UNAUTHORIZED');
        expect(res.body.status).to.equal(enums.ERROR_STATUS);
        done();
      });
  });

  it('Should filter roles by the date they were created and status ', (done) => {
    chai.request(app)
      .get('/api/v1/admin/role/fetch-roles')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}`
      })
      .query({
        from_date: '2023-01-13 23:03:09.875717',
        to_date: '2023-01-14 23:03:09.875717',
        status: 'active'
      })
      .end((err, res) => {
        console.log(res.body);
        expect(res.statusCode).to.equal(200);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal(enums.ROLES_FETCHED_SUCCESSFULLY);
        expect(res.body.status).to.equal(enums.SUCCESS_STATUS);
        done();
      });
  });

  it('Should return error if invalid token is set', (done) => {
    chai.request(app)
      .get('/api/v1/admin/role/fetch-roles')
      .set({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.SEEDFI_SUPER_ADMIN_ACCESS_TOKEN}6t7689`
      })
      .query({
        from_date: '2023-01-13 23:03:09.875717',
        to_date: '2023-01-14 23:03:09.875717+01',
        status: 'active'
      })
      .end((err, res) => {
        expect(res.statusCode).to.equal(401);
        expect(res.body).to.have.property('message');
        expect(res.body).to.have.property('status');
        expect(res.body.message).to.equal('invalid signature');
        expect(res.body.error).to.equal('UNAUTHORIZED');
        expect(res.body.status).to.equal(enums.ERROR_STATUS);
        done();
      });
  });


});
