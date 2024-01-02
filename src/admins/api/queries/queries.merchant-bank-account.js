export default {
  addBankAccount: `
    INSERT INTO merchant_bank_accounts(
      merchant_id,
      bank_name,
      bank_code,
      account_number,
      account_name,
      transfer_recipient_code
    ) VALUES (
      $1, $2, $3, $4, $5, $6
    );
  `,
  findByMerchantIdAndBankCodeAndAccountNumber: `
    SELECT
      merchant_id,
      bank_name,
      bank_code,
      account_number,
      account_name
    FROM merchant_bank_accounts
    WHERE merchant_id = $1 and bank_code = $2 and account_number = $3;
  `
};
