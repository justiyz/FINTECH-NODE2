export const sterlingVerifyBvnTestResponse = (user) => {
  const data = {
    responseCode: '00',
    responseDesc: null,
    bvn: '56790647909378',
    firstName: `${user.first_name.toUpperCase()}`,
    middleName: user.middle_name !== null ? `${user.middle_name.toUpperCase()}` : '',
    lastName: `${user.last_name.toUpperCase()}`,
    dateOfBirth: '02-Dec-1994',
    phoneNumber: '090000000000',
    email: 'testuser89@mail.com',
    gender: `${user.gender}`
  };
  return data;
};
