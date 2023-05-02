import { generateReferralCode } from '../../src/users/lib/utils/lib.util.helpers';

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
      'account_name': `${user.first_name.toUpperCase()} ${user.middle_name.toUpperCase()} ${user.last_name.toUpperCase()}`, 
      // This will only pass for users with middle name and won't pass for users without middle name
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
      pricing_band: 36,
      monthly_interest: 0.03,
      fees: {
        processing_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        insurance_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        advisory_fee: parseFloat(0.01 * parseFloat(payload.loan_amount)),
        processing_fee_percentage: 0.01,
        insurance_fee_percentage: 0.01,
        advisory_fee_percentage: 0.01
      },
      monthly_repayment: parseFloat(parseFloat((((0.03) * parseFloat(payload.loan_amount)) / (1 - ((1 + (0.03))**(-Number(payload.loan_duration_in_month)))))).toFixed(2)),
      max_approval: 679629.6000000001
    }
  };
  return data;
};

export const seedfiYouVerifyUserCandidateCreationTestResponse = (user) => {
  const data = {
    success: true,
    statusCode: 201,
    message: 'Candidate created successfully!',
    data: {
      firstName: user.first_name,
      middleName: '',
      lastName: user.last_name,
      dateOfBirth: user.date_of_birth,
      photo: user.image_url,
      email: user.email,
      mobile: user.phone_number.replace('+234', '0'),
      idNumber: null,
      type: 'form',
      medium: 'form',
      youverifyCandidateId: '644988355df07530ef289564',
      businessId: '642e9966bfa9c5d130d62571',
      createdAt: '2023-04-26T20:23:17.638Z',
      lastModifiedAt: '2023-04-26T20:23:17.638Z',
      _createdAt: '2023-04-26T20:23:1717+00:00',
      _lastModifiedAt: '2023-04-26T20:23:1717+00:00',
      id: generateReferralCode(12)
    },
    links: []
  };
  return data;
};

export const seedfiYouVerifyUserAddressVerificationRequestTestResponse = (user, body, requestId, candidateId) => {
  const data = {
    success: true,
    statusCode: 201,
    message: 'Address requested successfully!',
    data: {
      candidate: {
        candidateId: candidateId,
        firstName: user.first_name,
        middleName: '',
        lastName: user.first_name,
        photo: user.image_url,
        email: null,
        mobile: user.phone_number.replace('+234', '0')
      },
      agent: {
        firstName: null,
        middleName: null,
        lastName: null,
        signature: null,
        photo: null
      },
      address: {
        latlong: [ Object ],
        flatNumber: '',
        buildingName: '',
        buildingNumber: body.house_number,
        subStreet: '',
        street: body.street,
        landmark: body.landmark,
        state: body.state,
        city: body.city,
        country: 'nigeria',
        lga: body.lga
      },
      referenceId: '6449b9e75df07589e8289597',
      parentId: null,
      status: 'pending',
      taskStatus: 'PENDING',
      tatStatus: 'NOT_AVAILABLE',
      subjectConsent: 'true',
      notes: [],
      isFlagged: false,
      description: 'Verify the candidate',
      reportId: '6449b9e75df07589e8289597',
      downloadUrl: null,
      apiVersion: 'v2',
      businessType: 'business',
      businessId: '642e9966bfa9c5d130d62571',
      userId: '642e9966bfa9c50707d6256d',
      type: 'individual',
      metadata: { requestId },
      createdAt: '2023-04-26T23:55:19.272Z',
      lastModifiedAt: '2023-04-26T23:55:19.272Z',
      _createdAt: '2023-04-26T23:55:1919+00:00',
      _lastModifiedAt: '2023-04-26T23:55:1919+00:00',
      verificationId: '6449b9e75df07589e8289597',
      id: generateReferralCode(12)
    },
    links: []
  };
  return data;
};

export const seedfiUnderwritingUserAndLoanApplicationOrrBreakdownTestResponse = (user_id, loan_id) => {
  const result ={
    status: 200,
    data: {
      customer_id: user_id,
      loan_id: loan_id,
      breakdown: {
        orr_score: 81.25,
        date_of_birth_actual_score: 5.0,
        marital_status_actual_score: 2.5,
        monthly_income_actual_score: 3.5,
        employment_type_actual_score: 10.0,
        number_of_dependants_actual_actual: 1.75,
        number_of_returned_cheques_actual_score: 5.0,
        history_of_court_case_from_cr_actual_score: 5.0,
        total_length_of_credit_history_actual_score: 9.0,
        total_number_of_active_loans_availed_actual_score: 7.5,
        total_number_of_closed_loans_availed_actual_score: 12.0,
        history_of_written_off_account_from_cr_actual_score: 5.0,
        total_number_of_returned_cheques_from_cr_report_actual_score: 15.0
      },
      decision_reasons: [
        {
          id: 1,
          upper_limit: 74.99,
          lower_limit: 65.0,
          reason: 'MANUAL'
        },
        {
          id: 2,
          upper_limit: 100.0,
          lower_limit: 75.0,
          reason: 'APPROVED'
        }
      ]
    }
  };
  return result;
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

export const initiateChargeViaCardAuthTokenPaystackTestResponse = (reference) => {
  const result = {
    status: true,
    message: 'Charge attempted',
    data: {
      id: 2590405333,
      domain: 'test',
      status: 'success',
      reference: reference,
      amount: 21921220,
      message: null,
      gateway_response: 'Successful',
      paid_at: '2023-03-03T22:38:26.000Z',
      created_at: '2023-03-03T22:38:26.000Z',
      channel: 'card',
      currency: 'NGN',
      ip_address: '172.31.68.32',
      metadata: '',
      log: null,
      fees: 200000,
      fees_split: null,
      authorization: {
        authorization_code: 'AUTH_opcf85n7x5',
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
        id: 114027951,
        first_name: null,
        last_name: null,
        email: 'akinpelumi@enyata.com',
        customer_code: 'CUS_hq6flu6mv1wy2e1',
        phone: null,
        metadata: null,
        risk_action: 'default',
        international_format_phone: null
      },
      plan: null,
      split: {},
      order_id: null,
      paidAt: '2023-03-03T22:38:26.000Z',
      createdAt: '2023-03-03T22:38:26.000Z',
      requested_amount: 21921220,
      pos_transaction_data: null,
      source: null,
      fees_breakdown: null,
      transaction_date: '2023-03-03T22:38:26.000Z',
      plan_object: {},
      subaccount: {}
    }
  };
  return result;
};

export const initiateChargeViaBankAccountPaystackTestResponse = (reference) => {
  const result = {
    status: true,
    message: 'Charge attempted',
    data: {
      reference: reference,
      status: 'send_otp',
      display_text: 'To confirm that you own this account, kindly enter the OTP sent to your phone'
    }
  };
  return result;
};

export const paystackSubmitOtpTestResponse = (reference) => {
  const data = {
    status: true,
    message: 'Charge attempted',
    data: {
      id: 2598623413,
      domain: 'test',
      status: 'success',
      reference: reference,
      amount: 18921220,
      message: 'madePayment',
      gateway_response: 'Approved',
      paid_at: '2023-03-06T12:01:55.000Z',
      created_at: '2023-03-06T11:43:09.000Z',
      channel: 'bank',
      currency: 'NGN',
      ip_address: '172.31.68.216',
      metadata: '',
      log: null,
      fees: 200000,
      fees_split: null,
      authorization: {
        authorization_code: 'AUTH_59uaygpua0',
        bin: '000XXX',
        last4: 'X000',
        exp_month: '12',
        exp_year: '9999',
        channel: 'bank',
        card_type: '',
        bank: 'Zenith Bank',
        country_code: 'NG',
        brand: 'Zenith Emandate',
        reusable: false,
        signature: null,
        account_name: null
      },
      customer: {
        id: 114027951,
        first_name: null,
        last_name: null,
        email: 'akinpelumi@enyata.com',
        customer_code: 'CUS_hq6flu6mv1wy2e1',
        phone: null,
        metadata: null,
        risk_action: 'default',
        international_format_phone: null
      },
      plan: null,
      split: {},
      order_id: null,
      paidAt: '2023-03-06T12:01:55.000Z',
      createdAt: '2023-03-06T11:43:09.000Z',
      requested_amount: 18921220,
      pos_transaction_data: null,
      source: null,
      fees_breakdown: null,
      transaction_date: '2023-03-06T11:43:09.000Z',
      plan_object: {},
      subaccount: {}
    }
  };
  return data;
};
