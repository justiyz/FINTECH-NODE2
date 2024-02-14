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
  updateBankAccount: `
    UPDATE merchant_bank_accounts SET
      bank_name = $2,
      bank_code = $3,
      account_number = $4,
      account_name = $5,
      transfer_recipient_code = $6
    WHERE merchant_id = $1;
  `,
  findMerchantBankAccount: `
    SELECT
      merchant_id,
      bank_name,
      bank_code,
      account_number,
      account_name,
      transfer_recipient_code
    FROM merchant_bank_accounts
    WHERE merchant_id = $1;
  `
};
