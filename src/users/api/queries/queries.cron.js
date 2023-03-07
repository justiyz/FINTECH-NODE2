export default {
  fetchAllOverdueLoanRepayments: `
    SELECT 
        id,
        loan_repayment_id,
        loan_id,
        user_id,
        repayment_order,
        status,
        proposed_payment_date
    FROM personal_loan_payment_schedules
    WHERE proposed_payment_date::DATE <= NOW()::DATE
    AND status = 'not due'
    AND payment_at IS NULL`,

  fetchLoanNextRepayment: `
    SELECT 
      id,
      loan_repayment_id,
      loan_id,
      user_id,
      repayment_order,
      total_payment_amount,
      to_char(DATE(proposed_payment_date)::date, 'Mon DD, YYYY') AS expected_repayment_date,
      status
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    AND user_id = $2
    AND status = 'not due'
    AND payment_at IS NULL
    ORDER BY proposed_payment_date ASC
    LIMIT 1`,

  updateNextLoanRepaymentOverdue: `
    UPDATE personal_loan_payment_schedules
    SET
      updated_at = NOW(),
      status = 'over due'
    WHERE loan_repayment_id = $1`,

  updateLoanWithOverDueStatus: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      status = 'over due'
    WHERE loan_id = $1
    AND user_id = $2`,

  updateUserLoanStatusOverDue: `
    UPDATE users
    SET
      updated_at = NOW(),
      loan_status = 'over due'
    WHERE user_id = $1`,

  fetchAllQualifiedRepayments: `
    SELECT 
        id,
        loan_repayment_id,
        loan_id,
        user_id,
        repayment_order,
        status,
        total_payment_amount,
        proposed_payment_date
    FROM personal_loan_payment_schedules
    WHERE proposed_payment_date BETWEEN (NOW() - interval '$1 day')::DATE AND NOW()::DATE
    AND status != 'paid'
    AND payment_at IS NULL`,

  fetchUserSavedDebitCardsToken: `
    SELECT 
        id,
        user_id,
        is_default,
        last_4_digits,
        card_type,
        created_at,
        auth_token
    FROM user_debit_cards
    WHERE user_id = $1
    ORDER BY is_default DESC
    LIMIT 1`
};
  
  
