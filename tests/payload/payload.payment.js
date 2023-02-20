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
      authorization_code: 'AUTH_1xhn077tgs',
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
      authorization_code: 'AUTH_1xhn077tgs8u',
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
      authorization_code: 'AUTH_1xhn077tgs8u',
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

