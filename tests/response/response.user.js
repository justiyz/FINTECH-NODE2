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

export const paystackResolveAccountNumberTestResponse = () => {
  const data = {
    status: true,
    message: 'Account number resolved',
    data: {
      'account_number': '0030878578',
      'account_name': 'VICTORY RASHIDAT BABATUNDE',
      'bank_id': 9
    }
  };
  return data;
};

export const paystackFetchBankListsTestResponse = () => {
  const data = {
    status: true,
    message: 'Banks retrieved',
    data: [
      {
        'id': 302,
        'name': '9mobile 9Payment Service Bank',
        'slug': '9mobile-9payment-service-bank-ng',
        'code': '120001',
        'longcode': '120001',
        'gateway': '',
        'pay_with_bank': false,
        'active': true,
        'country': 'Nigeria',
        'currency': 'NGN',
        'type': 'nuban',
        'is_deleted': false,
        'createdAt': '2022-05-31T06:50:27.000Z',
        'updatedAt': '2022-06-23T09:33:55.000Z'
      },
      {
        'id': 174,
        'name': 'Abbey Mortgage Bank',
        'slug': 'abbey-mortgage-bank',
        'code': '801',
        'longcode': '',
        'gateway': null,
        'pay_with_bank': false,
        'active': true,
        'country': 'Nigeria',
        'currency': 'NGN',
        'type': 'nuban',
        'is_deleted': false,
        'createdAt': '2020-12-07T16:19:09.000Z',
        'updatedAt': '2020-12-07T16:19:19.000Z'
      },
      {
        'id': 188,
        'name': 'Above Only MFB',
        'slug': 'above-only-mfb',
        'code': '51204',
        'longcode': '',
        'gateway': null,
        'pay_with_bank': false,
        'active': true,
        'country': 'Nigeria',
        'currency': 'NGN',
        'type': 'nuban',
        'is_deleted': false,
        'createdAt': '2021-10-13T20:35:17.000Z',
        'updatedAt': '2021-10-13T20:35:17.000Z'
      }
    ]
  };
  return data;
};
