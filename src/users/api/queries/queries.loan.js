export default {
  fetchUserDefaultBankAccount: `
    SELECT 
      id,
      user_id,
      bank_name,
      bank_code,
      account_number,
      account_name,
      is_default,
      is_disbursement_account,
      created_at
    FROM user_bank_accounts
    WHERE user_id = $1
    AND is_default = true
    LIMIT 1`,

  fetchUserDefaultDebitCard: `
    SELECT 
      id,
      user_id,
      card_attached_bank,
      card_holder_name,
      is_default,
      created_at
    FROM user_debit_cards
    WHERE user_id = $1
    AND is_default = true
    LIMIT 1`,

  initiatePersonalLoanApplication: `
    INSERT INTO personal_loans(
        user_id, amount_requested, loan_reason, loan_tenor_in_months
    ) VALUES ($1, $2, $3, $4)
    RETURNING id, loan_id, status`,

  deleteInitiatedLoanApplication: `
    DELETE FROM personal_loans
    WHERE loan_id = $1
    AND user_id = $2`,

  fetchUserBvn: `
    SELECT bvn
    FROM users
    WHERE user_id = $1`,

  updateUserDeclinedDecisionLoanApplication: `
    UPDATE personal_loans
    SET 
        updated_at = NOW(),
        percentage_orr_score = $2,
        status = $3,
        loan_decision = $4,
        loan_declination_reason = $5
    WHERE loan_id = $1
    RETURNING id, loan_id, user_id, status`,

  updateUserManualOrApprovedDecisionLoanApplication: `
    UPDATE personal_loans
    SET 
        updated_at = NOW(),
        total_repayment_amount = $2,
        total_interest_amount = $3,
        percentage_orr_score = $4,
        percentage_pricing_band = $5,
        percentage_processing_fee = $6,
        percentage_insurance_fee = $7,
        percentage_advisory_fee = $8,
        monthly_interest = $9,
        processing_fee = $10,
        insurance_fee = $11,
        advisory_fee = $12,
        monthly_repayment = $13,
        status = $14,
        loan_decision = $15,
        total_outstanding_amount = $16
    WHERE loan_id = $1
    RETURNING id, loan_id, user_id, status`,

  fetchUserLoanDetailsByLoanId: `
    SELECT 
      id,
      loan_id,
      user_id,
      amount_requested,
      loan_reason,
      loan_tenor_in_months,
      total_repayment_amount,
      total_interest_amount,
      percentage_orr_score,
      percentage_pricing_band,
      monthly_interest,
      processing_fee,
      insurance_fee,
      advisory_fee,
      monthly_repayment,
      total_outstanding_amount,
      extra_interests,
      status,
      loan_decision,
      is_loan_disbursed,
      loan_disbursed_at
    FROM personal_loans
    WHERE loan_id = $1
    AND user_id = $2`,

  updateDisbursedLoanRepaymentSchedule: `
    INSERT INTO personal_loan_payment_schedules(
      loan_id, user_id, repayment_order, principal_payment, interest_payment, fees, 
      total_payment_amount, pre_payment_outstanding_amount, post_payment_outstanding_amount, 
      proposed_payment_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,

  fetchLoanRepaymentSchedule: `
    SELECT 
      id,
      loan_id,
      user_id,
      repayment_order,
      total_payment_amount,
      to_char(DATE(proposed_payment_date)::date, 'Mon DD, YYYY') AS expected_repayment_date,
      to_char(DATE(payment_at)::date, 'Mon DD, YYYY') AS actual_payment_date,
      status
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    AND user_id = $2
    ORDER BY repayment_order ASC`,

  fetchLoanNextRepaymentDetails: `
    SELECT 
      id,
      loan_repayment_id,
      loan_id,
      user_id,
      repayment_order,
      total_payment_amount,
      to_char(DATE(proposed_payment_date)::date, 'Mon DD, YYYY') AS expected_repayment_date,
      to_char(DATE(payment_at)::date, 'Mon DD, YYYY') AS actual_payment_date,
      status
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    AND user_id = $2
    AND status != 'paid'
    AND payment_at IS NULL
    ORDER BY proposed_payment_date ASC
    LIMIT 1`,

  updateNextLoanRepayment: `
    UPDATE personal_loan_payment_schedules
    SET
      updated_at = NOW(),
      payment_at = Now(),
      status = 'paid'
    WHERE loan_repayment_id = $1`,

  updateAllLoanRepaymentOnFullPayment: `
    UPDATE personal_loan_payment_schedules
    SET
      updated_at = NOW(),
      payment_at = Now(),
      status = 'paid'
    WHERE loan_id = $1
    AND user_id = $2
    AND status != 'paid'
    AND payment_at IS NULL`,

  existingUnpaidRepayments: `
    SELECT 
      COUNT(id)
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    AND user_id = $2
    AND status != 'paid'
    AND payment_at IS NULL`,

  updateLoanWithRepayment: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      status = $3,
      total_outstanding_amount = total_outstanding_amount - $4::FLOAT
    WHERE loan_id = $1
    AND user_id = $2`,

  checkUserOnClusterLoan: `
    SELECT 
      id,
      user_id,
      cluster_id,
      loan_status
    FROM cluster_members
    WHERE user_id = $1
    AND is_left = FALSE
    AND loan_status != 'inactive'
    LIMIT 1`,

  updateProcessingLoanDetails: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      status = 'processing'
    WHERE loan_id = $1
    RETURNING id, user_id, loan_id, status, loan_decision`,

  updateActivatedLoanDetails: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      status = 'ongoing',
      is_loan_disbursed = true,
      loan_disbursed_at = NOW()
    WHERE loan_id = $1
    RETURNING id, user_id, loan_id, status, loan_decision`,

  fetchUserDisbursementAccount: `
    SELECT 
      id,
      user_id,
      bank_name,
      bank_code,
      account_number,
      account_name,
      is_default,
      is_disbursement_account
    FROM user_bank_accounts
    WHERE user_id = $1
    AND (is_disbursement_account = TRUE OR is_default = TRUE)
    ORDER BY created_at DESC
    LIMIT 1`,

  initializeBankTransferPayment: `
    INSERT INTO paystack_payment_histories (
        user_id, 
        amount, 
        payment_platform,
        transaction_reference,
        payment_type,
        payment_status,
        refund_status,
        transaction_type,
        payment_reason,
        loan_id
    ) VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', 'debit', $6, $7)`,

  updateUserLoanStatus: `
    UPDATE users
    SET 
      updated_at = NOW(),
      loan_status = $2
    WHERE user_id = $1`,

  cancelUserLoanApplication: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      status = 'cancelled'
    WHERE loan_id = $1
    AND user_id = $2
    RETURNING id, user_id, loan_id, status, loan_decision`,

  fetchUserActivePersonalLoans: `
    SELECT 
      id,
      loan_id,
      user_id,
      amount_requested,
      loan_reason,
      loan_tenor_in_months,
      status,
      loan_decision
    FROM personal_loans
    WHERE user_id = $1
    AND (status = 'ongoing' OR status = 'over due' OR status = 'processing' OR status = 'in review' OR status = 'approved')
    LIMIT 1`,

  fetchAdminSetEnvDetails: `
    SELECT 
      id,
      env_id,
      name,
      value
    FROM admin_env_values_settings
    WHERE name = $1`,

  fetchUserCurrentPersonalLoans: `
    SELECT 
      id,
      loan_id,
      user_id,
      amount_requested,
      loan_reason,
      loan_tenor_in_months,
      status,
      loan_decision,
      to_char(DATE (loan_disbursed_at)::date, 'DDth Mon, YYYY') AS loan_start_date
    FROM personal_loans
    WHERE user_id = $1
    AND (status = 'ongoing' OR status = 'over due' OR status = 'processing' OR status = 'in review' OR status = 'approved')
    ORDER BY created_at DESC`,

  updateLoanDisbursementTable: `
    INSERT INTO personal_loan_disbursements(
      user_id,
      loan_id,
      amount,
      payment_id,
      account_number,
      account_name,
      bank_name,
      bank_code,
      recipient_id,
      transfer_code,
      status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,

  updatePersonalLoanPaymentTable: `
    INSERT INTO personal_loan_payments(
      user_id,
      loan_id,
      amount,
      transaction_type,
      loan_purpose,
      payment_description,
      payment_means
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,

  fetchUserPersonalLoanPayments: `
    SELECT 
      id,
      payment_id,
      loan_id,
      user_id,
      amount,
      transaction_type,
      loan_purpose,
      payment_description,
      payment_means,
      to_char(DATE (created_at)::date, 'Mon DDth, YYYY') AS payment_date
    FROM personal_loan_payments
    WHERE user_id = $1
    ORDER BY created_at DESC`,

  fetchUserPersonalLoanPaymentDetails: `
    SELECT 
      id,
      payment_id,
      loan_id,
      user_id,
      amount,
      transaction_type,
      loan_purpose,
      payment_description,
      to_char(DATE (created_at)::date, 'Mon DDth, YYYY') AS payment_date
    FROM personal_loan_payments
    WHERE payment_id = $1
    AND user_id = $2`
};
