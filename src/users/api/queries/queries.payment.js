export default {
  initializeCardPayment: `
    INSERT INTO paystack_payment_histories (
        user_id,
        amount,
        payment_platform,
        transaction_reference,
        payment_type,
        payment_status,
        refund_status,
        transaction_type,
        payment_reason
    ) VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', 'credit', $6)`,

  fetchTransactionByReference: `
    SELECT
        id,
        user_id,
        amount,
        payment_platform,
        transaction_reference,
        transaction_id,
        payment_type,
        payment_status,
        is_initiated_refund,
        is_refunded,
        refund_status,
        refund_reference,
        transaction_type,
        payment_reason,
        loan_id
    FROM paystack_payment_histories
    WHERE transaction_reference = $1`,

  fetchUserSavedCard: `
    SELECT
        id,
        user_id,
        is_default
    FROM user_debit_cards
    WHERE user_id = $1
    AND is_deleted = false
    LIMIT 1`,

  checkIfCardPreviouslySaved: `
    SELECT
        id,
        user_id,
        is_default
    FROM user_debit_cards
    WHERE user_id = $1
    AND is_deleted = false
    AND card_type = $2
    AND expiry_month = $3
    AND expiry_year = $4
    AND card_attached_bank = $5
    AND tokenising_platform = $6`,

  updateUserCardAuthToken: `
    UPDATE user_debit_cards
    SET
        updated_at = NOW(),
        auth_token = $7
    WHERE user_id = $1
    AND card_type = $2
    AND expiry_month = $3
    AND expiry_year = $4
    AND card_attached_bank = $5
    AND tokenising_platform = $6`,

  updateTransactionPaymentStatus: `
    UPDATE paystack_payment_histories
    SET
        updated_at = NOW(),
        transaction_id = $2,
        payment_status = $3
    WHERE transaction_reference = $1`,

  saveCardDetails: `
    INSERT INTO user_debit_cards(
        user_id,
        tokenising_platform,
        first_6_digits,
        last_4_digits,
        card_type,
        expiry_month,
        expiry_year,
        auth_token,
        card_attached_bank,
        card_holder_name,
        is_default
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,

  updateTransactionIsInitiatedRefund: `
    UPDATE paystack_payment_histories
    SET
        updated_at = NOW(),
        is_initiated_refund = TRUE
    WHERE transaction_reference = $1`,

  updateTransactionRefundStatus: `
    UPDATE paystack_payment_histories
    SET
        updated_at = NOW(),
        refund_status = $2,
        refund_reference = $3,
        is_refunded = $4
    WHERE transaction_reference = $1`
};
