import dayjs from 'dayjs';

export const receiveChargeSuccessWebHookOne = (reference) => ({
  event: 'charge.success',
  data: {
    id: 2468221493,
    domain: 'test',
    status: 'success',
    reference: reference,
    amount: 50000,
    message: 'test-3ds',
    gateway_response: '[Test] Approved',
    paid_at: '2023-01-22T12:08:21.000Z',
    created_at: '2023-01-22T12:06:43.000Z',
    channel: 'card',
    currency: 'NGN',
    ip_address: '102.89.32.100',
    metadata: '',
    fees_breakdown: null,
    log: null,
    fees: 750,
    fees_split: null,
    authorization: {
      authorization_code: 'AUTH_opcf85n7x5',
      bin: '408408',
      last4: '0409',
      exp_month: '01',
      exp_year: '2024',
      channel: 'card',
      card_type: 'visa',
      bank: 'TEST BANK',
      country_code: 'NG',
      brand: 'visa',
      reusable: true,
      signature: 'SIG_t5u0Of9ezvgBPXRyDX50',
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
    plan: {},
    subaccount: {},
    split: {},
    order_id: null,
    paidAt: '2023-01-22T12:08:21.000Z',
    requested_amount: 50000,
    pos_transaction_data: null,
    source: {
      type: 'api',
      source: 'merchant_api',
      entry_point: 'transaction_initialize',
      identifier: null
    }
  }
});

export const receiveChargeSuccessWebHookNotUserName = (reference) => ({
  event: 'charge.success',
  data: {
    id: 2468221493,
    domain: 'test',
    status: 'success',
    reference: reference,
    amount: 50000,
    message: 'test-3ds',
    gateway_response: '[Test] Approved',
    paid_at: '2023-01-22T12:08:21.000Z',
    created_at: '2023-01-22T12:06:43.000Z',
    channel: 'card',
    currency: 'NGN',
    ip_address: '102.89.32.100',
    metadata: '',
    fees_breakdown: null,
    log: null,
    fees: 750,
    fees_split: null,
    authorization: {
      authorization_code: 'AUTH_opcf85n7x5',
      bin: '408408',
      last4: '0409',
      exp_month: '01',
      exp_year: '2024',
      channel: 'card',
      card_type: 'visa',
      bank: 'TEST BANK',
      country_code: 'NG',
      brand: 'visa',
      reusable: true,
      signature: 'SIG_t5u0Of9ezvgBPXRyDX50',
      account_name: 'Ali Samaila'
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
    plan: {},
    subaccount: {},
    split: {},
    order_id: null,
    paidAt: '2023-01-22T12:08:21.000Z',
    requested_amount: 50000,
    pos_transaction_data: null,
    source: {
      type: 'api',
      source: 'merchant_api',
      entry_point: 'transaction_initialize',
      identifier: null
    }
  }
});

export const receiveChargeSuccessWebHookTwo = (reference) => ({
  event: 'charge.success',
  data: {
    id: 6428221394,
    domain: 'test',
    status: 'success',
    reference: reference,
    amount: 50000,
    message: 'test-3ds',
    gateway_response: '[Test] Approved',
    paid_at: '2023-01-22T12:08:21.000Z',
    created_at: '2023-01-22T12:06:43.000Z',
    channel: 'card',
    currency: 'NGN',
    ip_address: '102.89.32.100',
    metadata: '',
    fees_breakdown: null,
    log: null,
    fees: 750,
    fees_split: null,
    authorization: {
      authorization_code: 'AUTH_opcf85n7x5',
      bin: '300401',
      last4: '9040',
      exp_month: '03',
      exp_year: '2028',
      channel: 'card',
      card_type: 'verve ',
      bank: 'TEST BANK',
      country_code: 'NG',
      brand: 'verve',
      reusable: true,
      signature: 'SIG_t5u0Of9ezvgBPXRyDX50',
      account_name: null
    },
    customer: {
      id: 109405396,
      first_name: null,
      last_name: null,
      email: 'victory@enyata.com',
      customer_code: 'CUS_0wfczyq7aoqxz4v',
      phone: null,
      metadata: null,
      risk_action: 'default',
      international_format_phone: null
    },
    plan: {},
    subaccount: {},
    split: {},
    order_id: null,
    paidAt: '2023-01-22T12:08:21.000Z',
    requested_amount: 50000,
    pos_transaction_data: null,
    source: {
      type: 'api',
      source: 'merchant_api',
      entry_point: 'transaction_initialize',
      identifier: null
    }
  }
});

export const receiveChargeSuccessWebHookThree = (reference) => ({
  event: 'charge.success',
  data: {
    id: 6428221345,
    domain: 'test',
    status: 'success',
    reference: reference,
    amount: 45000,
    message: 'test-3ds',
    gateway_response: '[Test] Approved',
    paid_at: '2023-01-22T12:08:21.000Z',
    created_at: '2023-01-22T12:06:43.000Z',
    channel: 'card',
    currency: 'NGN',
    ip_address: '102.89.32.100',
    metadata: '',
    fees_breakdown: null,
    log: null,
    fees: 750,
    fees_split: null,
    authorization: {
      authorization_code: 'AUTH_opcf85n7x5',
      bin: '300401',
      last4: '9040',
      exp_month: dayjs().add(2, 'Month').format('MM'),
      exp_year: dayjs().format('YYYY'),
      channel: 'card',
      card_type: 'verve ',
      bank: 'TEST BANK',
      country_code: 'NG',
      brand: 'verve',
      reusable: true,
      signature: 'SIG_t5u0Of9ezvgBPXRyDX50',
      account_name: null
    },
    customer: {
      id: 109405396,
      first_name: null,
      last_name: null,
      email: 'victory@enyata.com',
      customer_code: 'CUS_0wfczyq7aoqxz4v',
      phone: null,
      metadata: null,
      risk_action: 'default',
      international_format_phone: null
    },
    plan: {},
    subaccount: {},
    split: {},
    order_id: null,
    paidAt: '2023-01-22T12:08:21.000Z',
    requested_amount: 50000,
    pos_transaction_data: null,
    source: {
      type: 'api',
      source: 'merchant_api',
      entry_point: 'transaction_initialize',
      identifier: null
    }
  }
});

export const receiveChargeSuccessWebHookOneUserTwo = (reference) => ({
  event: 'charge.success',
  data: {
    id: 2468221493,
    domain: 'test',
    status: 'success',
    reference: reference,
    amount: 50000,
    message: 'test-3ds',
    gateway_response: '[Test] Approved',
    paid_at: '2023-01-22T12:08:21.000Z',
    created_at: '2023-01-22T12:06:43.000Z',
    channel: 'card',
    currency: 'NGN',
    ip_address: '102.89.32.100',
    metadata: '',
    fees_breakdown: null,
    log: null,
    fees: 750,
    fees_split: null,
    authorization: {
      authorization_code: 'AUTH_opcf85n7x5',
      bin: '218209',
      last4: '9087',
      exp_month: '07',
      exp_year: '2024',
      channel: 'card',
      card_type: 'visa',
      bank: 'TEST BANK',
      country_code: 'NG',
      brand: 'visa',
      reusable: true,
      signature: 'SIG_t5u0Of9ezvgBPXRyDX50',
      account_name: null
    },
    customer: {
      id: 100401397,
      first_name: null,
      last_name: null,
      email: 'victory@enyata.com',
      customer_code: 'CUS_0wfczyq7kjhyxz4v',
      phone: null,
      metadata: null,
      risk_action: 'default',
      international_format_phone: null
    },
    plan: {},
    subaccount: {},
    split: {},
    order_id: null,
    paidAt: '2023-01-22T12:08:21.000Z',
    requested_amount: 50000,
    pos_transaction_data: null,
    source: {
      type: 'api',
      source: 'merchant_api',
      entry_point: 'transaction_initialize',
      identifier: null
    }
  }
});

export const receiveRefundSuccessWebHook = (reference) => ({
  event: 'refund.processed',
  data: {
    status: 'processed',
    transaction_reference: reference,
    refund_reference: null,
    amount: 50000,
    currency: 'NGN',
    customer: { first_name: null, last_name: null, email: 'victory@enyata.com' },
    integration: 894264,
    domain: 'test',
    id: '7950731'
  }
});

export const receiveRefundProcessingWebHook = (reference) => ({
  event: 'refund.processing',
  data: {
    status: 'processing',
    transaction_reference: reference,
    refund_reference: null,
    amount: 50000,
    currency: 'NGN',
    customer: { first_name: null, last_name: null, email: 'victory@enyata.com' },
    integration: 894264,
    domain: 'test',
    id: '7950731'
  }
});

export const receiveRefundPendingWebHook = (reference) => ({
  event: 'refund.pending',
  data: {
    status: 'pending',
    transaction_reference: reference,
    refund_reference: null,
    amount: 50000,
    currency: 'NGN',
    customer: { first_name: null, last_name: null, email: 'victory@enyata.com' },
    integration: 894264,
    domain: 'test',
    id: '7950731'
  }
});

export const receiveTransferSuccessWebHookTwo = (reference) => ({
  event: 'transfer.success',
  data: {
    amount: 30000,
    currency: 'NGN',
    domain: 'test',
    failures: null,
    id: 37272792,
    integration: {
      id: 463433,
      is_live: true,
      business_name: 'Boom Boom Industries NG'
    },
    reason: 'Have fun...',
    reference: reference,
    source: 'balance',
    source_details: null,
    status: 'success',
    titan_code: null,
    transfer_code: 'TRF_wpl1dem4967avzm',
    transferred_at: null,
    recipient: {
      active: true,
      currency: 'NGN',
      description: '',
      domain: 'test',
      email: null,
      id: 8690817,
      integration: 463433,
      metadata: null,
      name: 'Jack Sparrow',
      recipient_code: 'RCP_a8wkxiychzdzfgs',
      type: 'nuban',
      is_deleted: false,
      details: {
        account_number: '0000000000',
        account_name: 'victory rashidat',
        bank_code: '011',
        bank_name: 'First Bank of Nigeria'
      },
      created_at: '2020-09-03T12:11:25.000Z',
      updated_at: '2020-09-03T12:11:25.000Z'
    },
    session: { provider: null, id: null },
    created_at: '2020-10-26T12:28:57.000Z',
    updated_at: '2020-10-26T12:28:57.000Z'
  }
});

export const receiveTransferSuccessWebHookOne = (reference) => ({
  event: 'transfer.success',
  data: {
    amount: 30000,
    currency: 'NGN',
    domain: 'test',
    failures: null,
    id: 27032718,
    integration: {
      id: 463433,
      is_live: true,
      business_name: 'Boom Boom Industries NG'
    },
    reason: 'Have fun...',
    reference: reference,
    source: 'balance',
    source_details: null,
    status: 'success',
    titan_code: null,
    transfer_code: 'TRF_wpl1defgfdwui7avzm',
    transferred_at: null,
    recipient: {
      active: true,
      currency: 'NGN',
      description: '',
      domain: 'test',
      email: null,
      id: 8690817,
      integration: 463433,
      metadata: null,
      name: 'Jack Sparrow',
      recipient_code: 'RCP_a8r6tghwkxiychzdzfgs',
      type: 'nuban',
      is_deleted: false,
      details: {
        account_number: '00000004562',
        account_name: 'akinpelumi akintunde',
        bank_code: '011',
        bank_name: 'First Bank of Nigeria'
      },
      created_at: '2020-09-03T12:11:25.000Z',
      updated_at: '2020-09-03T12:11:25.000Z'
    },
    session: { provider: null, id: null },
    created_at: '2020-10-26T12:28:57.000Z',
    updated_at: '2020-10-26T12:28:57.000Z'
  }
});

export const receiveTransferFailedWebHookOne = (reference) => ({
  event: 'transfer.failed',
  data: {
    amount: 30000,
    currency: 'NGN',
    domain: 'test',
    failures: null,
    id: 15632718,
    integration: {
      id: 463433,
      is_live: true,
      business_name: 'Boom Boom Industries NG'
    },
    reason: 'Have fun...',
    reference: reference,
    source: 'balance',
    source_details: null,
    status: 'failed',
    titan_code: null,
    transfer_code: 'TRF_wpl1defgfdm4967avzm',
    transferred_at: null,
    recipient: {
      active: true,
      currency: 'NGN',
      description: '',
      domain: 'test',
      email: null,
      id: 8690817,
      integration: 463433,
      metadata: null,
      name: 'Jack Sparrow',
      recipient_code: 'RCP_a8r6tghwkxiychzdzfgs',
      type: 'nuban',
      is_deleted: false,
      details: {
        account_number: '00000004562',
        account_name: 'akinpelumi akintunde',
        bank_code: '011',
        bank_name: 'First Bank of Nigeria'
      },
      created_at: '2020-09-03T12:11:25.000Z',
      updated_at: '2020-09-03T12:11:25.000Z'
    },
    session: { provider: null, id: null },
    created_at: '2020-10-26T12:28:57.000Z',
    updated_at: '2020-10-26T12:28:57.000Z'
  }
});

export const receiveTransferReversedWebHookOne = (reference) => ({
  event: 'transfer.reversed',
  data: {
    amount: 30000,
    currency: 'NGN',
    domain: 'test',
    failures: null,
    id: 15632718,
    integration: {
      id: 463433,
      is_live: true,
      business_name: 'Boom Boom Industries NG'
    },
    reason: 'Have fun...',
    reference: reference,
    source: 'balance',
    source_details: null,
    status: 'reversed',
    titan_code: null,
    transfer_code: 'TRF_wpl1defgfdm4967avzm',
    transferred_at: null,
    recipient: {
      active: true,
      currency: 'NGN',
      description: '',
      domain: 'test',
      email: null,
      id: 8690817,
      integration: 463433,
      metadata: null,
      name: 'Jack Sparrow',
      recipient_code: 'RCP_a8r6tghwkxiychzdzfgs',
      type: 'nuban',
      is_deleted: false,
      details: {
        account_number: '00000004562',
        account_name: 'akinpelumi akintunde',
        bank_code: '011',
        bank_name: 'First Bank of Nigeria'
      },
      created_at: '2020-09-03T12:11:25.000Z',
      updated_at: '2020-09-03T12:11:25.000Z'
    },
    session: { provider: null, id: null },
    created_at: '2020-10-26T12:28:57.000Z',
    updated_at: '2020-10-26T12:28:57.000Z'
  }
});

