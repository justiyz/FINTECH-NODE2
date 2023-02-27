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

export const dojahVerifyBvnTestResponse = (user, bvn) => {
  const data = {
    status: 200,
    data: {
      entity: {
        bvn: bvn,
        first_name: user.first_name,
        last_name: user.last_name,
        middle_name: user.middle_name !== null ? user.middle_name : '',
        gender: user.gender,
        date_of_birth: user.date_of_birth,
        phone_number1: user.phone_number,
        image: 'ygguygujhgjghy8tw67tyuhjikhnkjghuo',
        email: '',
        enrollment_bank: '033',
        enrollment_branch: 'Badagry',
        level_of_account: 'Level 1 - Low Level Accounts',
        lga_of_origin: 'Katsina-Ala',
        lga_of_residence: 'Badagry',
        marital_status: 'Married',
        name_on_card: '242 c compound badagry',
        nationality: 'Nigeria',
        nin: '',
        phone_number2: '',
        registration_date: '',
        residential_address: '242 c compound badaGRY ',
        state_of_origin: 'Benue State',
        state_of_residence: 'Lagos State',
        title: 'Mrs',
        watch_listed: '',
        customer: '38e0e1c0-2318-4292-8180-b35345f6dd99'
      }
    }
  };
  return data;
};

export const paystackResolveAccountNumberTestResponse = (account_number, user) => {
  const data = {
    status: true,
    message: 'Account number resolved',
    data: {
      'account_number': account_number,
      'account_name': `${user.first_name.toUpperCase()} ${user.middle_name.toUpperCase()} ${user.last_name.toUpperCase()}`, // This will only pass for users with middle name and won't pass for users without middle name
      'bank_id': 9
    }
  };
  return data;
};

export const paystackInitializeCardPaymentTestResponse = (reference) => {
  const data = {
    status: true,
    message: 'Authorization URL created',
    'data': {
      'authorization_url': 'https://checkout.paystack.com/cw0o99ro6d1nkss',
      'access_code': 'cw0o99ro6d1nkss',
      'reference': reference
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

export const paystackVerifyTransactionStatusTestResponse = (reference) => {
  const result = {
    status: true,
    message: 'Verification successful',
    data: {
      id: 2464131595,
      domain: 'test',
      status: 'success',
      reference: reference,
      amount: 50000,
      message: null,
      gateway_response: 'Successful',
      paid_at: '2023-01-21T00:35:45.000Z',
      created_at: '2023-01-21T00:35:31.000Z',
      channel: 'card',
      currency: 'NGN',
      ip_address: '102.89.46.48',
      metadata: '',
      log: {
        start_time: 1674261342,
        time_spent: 2,
        attempts: 1,
        errors: 0,
        success: false,
        mobile: false,
        input: [],
        history: [ Array ]
      },
      fees: 750,
      fees_split: null,
      authorization: {
        authorization_code: 'AUTH_dsau7cwp5x',
        bin: '408408',
        last4: '4081',
        exp_month: '12',
        exp_year: '2030',
        channel: 'card',
        card_type: 'visa ',
        bank: 'TEST BANK',
        country_code: 'NG',
        brand: 'visa',
        reusable: true,
        signature: 'SIG_LeKgBEBPtDuxJDRKCSsP',
        account_name: null
      },
      customer: {
        id: 109405397,
        first_name: null,
        last_name: null,
        email: 'victory@enyata.com',
        customer_code: 'CUS_0wfczyq7aoqxz4v',
        phone: null,
        metadata: null,
        risk_action: 'default',
        international_format_phone: null
      },
      plan: null,
      split: {},
      order_id: null,
      paidAt: '2023-01-21T00:35:45.000Z',
      createdAt: '2023-01-21T00:35:31.000Z',
      requested_amount: 50000,
      pos_transaction_data: null,
      source: null,
      fees_breakdown: null,
      transaction_date: '2023-01-21T00:35:31.000Z',
      plan_object: {},
      subaccount: {}
    }
  };
  return result;
};

export const paystackInitiateRefundTestResponse = (transaction_id) => {
  const result =  {
    status: true,
    message: 'Refund has been queued for processing',
    data: {
      transaction: {
        id: transaction_id,
        domain: 'test',
        reference: '013d96fb-49ec-40f7-bf35-5a91b4f5ea87',
        amount: 50000,
        paid_at: '2023-01-21T01:00:48.000Z',
        channel: 'card',
        currency: 'NGN',
        authorization: [ Object ],
        customer: [ Object ],
        plan: {},
        subaccount: [ Object ],
        split: {},
        order_id: null,
        paidAt: '2023-01-21T01:00:48.000Z',
        pos_transaction_data: null,
        source: null,
        fees_breakdown: null
      },
      integration: 894264,
      deducted_amount: 0,
      channel: null,
      merchant_note: 'Refund for transaction 013d96fb-49ec-40f7-bf35-5a91b4f5ea87 by admin@tdlc.ng',
      customer_note: 'Refund for transaction 013d96fb-49ec-40f7-bf35-5a91b4f5ea87',
      status: 'pending',
      refunded_by: 'admin@tdlc.ng',
      expected_at: '2023-01-31T01:00:51.740Z',
      currency: 'NGN',
      domain: 'test',
      amount: 50000,
      fully_deducted: false,
      id: 7934510,
      createdAt: '2023-01-21T01:00:52.948Z',
      updatedAt: '2023-01-21T01:00:52.948Z'
    }
  };
  return result;
};

export const seedfiUnderwritingLoanEligibilityCheckTestResponse = (payload) => {
  const data = {
    loan_application_id: payload.loan_application_id,
    loan_duration_in_month: payload.loan_duration_in_month,
    loan_amount: parseFloat(payload.loan_amount),
    orr_score: 93.16,
    final_decision: 'APPROVED',
    pricing_band: 35,
    monthly_interest: 2.92,
    fees: {
      processing_fee: 1000.0,
      insurance_fee: 1000.0,
      advisory_fee: 1000.0
    },
    monthly_repayment: 14000.0
  };
  return data;
};

export const seedfiUnderwritingApprovedLoanApplicationTestResponse = (payload) => {
  const data = {
    status: 200,
    statusText: 'OK',
    data: {
      loan_application_id: payload.loan_application_id,
      loan_duration_in_month: payload.loan_duration_in_month,
      loan_amount: payload.loan_amount,
      orr_score: 81.99,
      final_decision: 'APPROVED',
      pricing_band: 45,
      monthly_interest: 3.75,
      fees: {
        processing_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        insurance_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        advisory_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        processing_fee_percentage: 0.01,
        insurance_fee_percentage: 0.01,
        advisory_fee_percentage: 0.01
      },
      monthly_repayment: parseFloat(parseFloat((((3.75 / 100) * parseFloat(payload.loan_amount)) / (1 - ((1 + (3.75 / 100))**(-Number(payload.loan_duration_in_month)))))).toFixed(2))
    }
  };
  return data;
};

export const paystackPlatformBalanceCheckerTestResponse = () => {
  const result =  {
    status: true,
    message: 'Balances retrieved',
    data: [ { currency: 'NGN', balance: 10000000000 } ]
  };
  return result;
};

export const paystackUserRecipientCodeCreationTestResponse = (userDisbursementAccountDetails) => {
  const result =  {
    status: true,
    message: 'Transfer recipient created successfully',
    data: {
      active: true,
      createdAt: '2023-02-23T14:56:37.020Z',
      currency: 'NGN',
      domain: 'test',
      id: 48946220,
      integration: 894264,
      name: userDisbursementAccountDetails.account_name,
      recipient_code: 'RCP_lwdid9q9ebzg20oldismmd39',
      type: 'nuban',
      updatedAt: '2023-02-23T14:56:37.020Z',
      is_deleted: false,
      isDeleted: false,
      details: {
        authorization_code: null,
        account_number: userDisbursementAccountDetails.account_number,
        account_name: userDisbursementAccountDetails.account_name.toUpperCase(),
        bank_code: userDisbursementAccountDetails.bank_code,
        bank_name: userDisbursementAccountDetails.bank_name
      }
    }
  };
  return result;
};

export const initiatePaystackBankTransferTestResponse = (userTransferRecipient, existingLoanApplication, reference) => {
  const result =  {
    status: true,
    message: 'Transfer has been queued',
    data: {
      transfersessionid: [],
      domain: 'test',
      amount: parseFloat(existingLoanApplication.amount_requested) * 100,
      currency: 'NGN',
      reference: reference,
      source: 'balance',
      source_details: null,
      reason: 'Loan facility disbursement',
      status: 'success',
      failures: null,
      transfer_code: userTransferRecipient,
      titan_code: null,
      transferred_at: null,
      id: 249017035,
      integration: 894264,
      request: 224392831,
      recipient: 48945403,
      createdAt: '2023-02-23T16:33:42.000Z',
      updatedAt: '2023-02-23T16:33:42.000Z'
    }

  };
  return result;
};
