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

export const processAdminBasedPermissions = async(admin_id, adminResources, adminPermissions) => {
  const rolePermissionsResourceIds = adminPermissions.map((permission) => permission['resource_id']);
  
  const processFullPermissions = await adminResources.map((resource) => {
    if (rolePermissionsResourceIds.includes(resource.resource_id)) {
      return resource;
    }
    adminPermissions.push({
      admin_id: admin_id,
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


export const calculateTotalFees = (body) => {
  const processingFee = (parseFloat(body.processing_fee)/100) * body.loan_amount;
  const insuranceFee = (parseFloat(body.insurance_fee)/100) * body.loan_amount;
  const advisoryFee = (parseFloat(body.advisory_fee)/100) * body.loan_amount;

  return processingFee + insuranceFee + advisoryFee;
};

// Function to calculate total monthly repayment
export const calculateTotalMonthlyRepayment = (monthlyRepayment, loanTenor) => {
  return parseFloat(monthlyRepayment) * Number(loanTenor);
};


// Function to calculate total amount repayable or total outstanding amount
export const calculateTotalAmountRepayable  = (totalMonthlyRepayment, totalFees) => {
  return parseFloat(totalMonthlyRepayment) + parseFloat(totalFees);
};

export const calculateTotalInterestAmount = (totalMonthlyRepayment, loanAmount) => {
  return parseFloat(totalMonthlyRepayment) - parseFloat(loanAmount);
};

export const calculateMonthlyInterestRate = (body, period) => {
  const monthlyInterest = (parseFloat(body.interest_rate)) / period;
  return  monthlyInterest;
};

export const monthlyRepaymentNumerator = (monthlyInterest, loanAmount) => {
  return (monthlyInterest/100) * loanAmount;
};

export const monthlyRepaymentDenominator = (monthlyInterest, loanTenor) => {
  return 1 - Math.pow(1 + monthlyInterest/100, -loanTenor);
};

export const monthlyRepayment = (numerator, denominator) => {
  return numerator/denominator;
};

export const processingFeeValue = (processingPercentage, loanAmount) => {
  return (processingPercentage/100) * loanAmount;
};

export const insuranceFeeValue = (insurancePercentage, loanAmount) => {
  return (insurancePercentage/100) * loanAmount;
};

export const advisoryFeeValue = (advisoryPercentage, loanAmount) => {
  return (advisoryPercentage/100) * loanAmount;
};
