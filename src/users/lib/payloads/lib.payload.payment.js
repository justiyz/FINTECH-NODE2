import * as Hash from '../../lib/utils/lib.util.hash';

export default {
  checkCardSavedPayload: (paymentRecord, body) => [ 
    paymentRecord.user_id, 
    body.data.authorization.brand,
    body.data.authorization.exp_month,
    body.data.authorization.exp_year,
    body.data.authorization.bank,
    'paystack'
  ],
  saveDebitCardPayload: async(paymentRecord, body, isDefaultCardChoice) => [ 
    paymentRecord.user_id, 
    'paystack',
    encodeURIComponent(await Hash.encrypt(body.data.authorization.bin.trim())),
    encodeURIComponent(await Hash.encrypt(body.data.authorization.last4.trim())),
    body.data.authorization.brand,
    body.data.authorization.exp_month,
    body.data.authorization.exp_year,
    encodeURIComponent(await Hash.encrypt(body.data.authorization.authorization_code.trim())),
    body.data.authorization.bank,
    body.data.authorization.account_name,
    isDefaultCardChoice
  ]
};
