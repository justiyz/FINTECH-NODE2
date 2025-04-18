import { processAnyData, processOneOrNoneData } from '../../api/services/services.db';
import usersQueries from '../../api/queries/queries.user';
export const generateRandomAlphabets = (length) => {
  const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const calculatePages = (total, limit) => {
  const displayPage = Math.floor(total / limit);
  return total % limit ? displayPage + 1 : displayPage;
};

export const processRoleBasedPermissions = async(role_type, adminResources, rolePermissions) => {
  const rolePermissionsResourceIds = rolePermissions.map((permission) => permission['resource_id']);
  
  const processFullPermissions = await adminResources.map((resource) => {
    if (rolePermissionsResourceIds.includes(resource.resource_id)) {
      return resource;
    }
    rolePermissions.push({
      code: role_type,
      name: resource.name,
      resource_id: resource.resource_id,
      permissions: []
    });
    return resource;
  });
  await Promise.all([ processFullPermissions ]);
  return rolePermissions;
};

export const processMerchantAdminBasedPermissions = async(merchant_admin_id, adminResources, adminPermissions) => {
  const rolePermissionsResourceIds = adminPermissions.map((permission) => permission['resource_id']);
  
  const processFullPermissions = await adminResources.map((resource) => {
    if (rolePermissionsResourceIds.includes(resource.resource_id)) {
      return resource;
    }
    adminPermissions.push({
      admin_id: merchant_admin_id,
      name: resource.name,
      resource_id: resource.resource_id,
      permissions: []
    });
    return resource;
  });
  await Promise.all([ processFullPermissions ]);
  return adminPermissions;
};


export const collateUsersFcmTokens = async(users) => {
  const tokens = [];
  const userNames = [];
  await Promise.all(users.map(async(user) => {
    const [ userDetails ] = await processAnyData(usersQueries.getUsersForNotifications, [ user.user_id ]);
    if (userDetails) {
      tokens.push(userDetails.fcm_token);
      userNames.push(userDetails.name);
    }
    return user;
  }));
  await Promise.all([ tokens, userNames ]);
  return [ tokens, userNames ];
};

export const collateUsersFcmTokensExceptConcernedUser = async(users, user_id) => {
  const otherClusterMembers = await users.filter(user => user.user_id != user_id);
  const tokens = [];
  await Promise.all(otherClusterMembers.map(async(user) => {
    const userFcmToken = await processOneOrNoneData(usersQueries.fetchUserFcmTOken, [ user.user_id ]);
    if (userFcmToken?.fcm_token) {
      tokens.push(userFcmToken.fcm_token);
    }
    return user;
  }));
  await Promise.all([ tokens ]);
  return [ tokens, otherClusterMembers ];
};
