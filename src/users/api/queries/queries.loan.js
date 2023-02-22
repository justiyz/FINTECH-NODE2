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
    WHERE user_id =$1
    AND is_default = true`,

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
        loan_application_declined_reason = $5
    WHERE loan_id = $1`,

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
    WHERE loan_id = $1`,

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
      status
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    AND user_id = $2
    ORDER BY repayment_order ASC`,

  updateActivatedLoanDetails: `
    UPDATE personal_loans
    SET
      updated_at = NOW(),
      status = 'ongoing',
      is_loan_disbursed = true,
      loan_disbursed_at = NOW()
    WHERE loan_id = $1
    RETURNING id, user_id, loan_id, status, loan_decision`,

  updateUserLoanStatus: `
    UPDATE users
    SET 
      updated_at = NOW(),
      loan_status = 'active'
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
    AND (status = 'ongoing' OR status = 'over due' OR status = 'approved' OR status = 'pending')
    LIMIT 1`,

  fetchAdminSetEnvDetails: `
    SELECT 
      id,
      env_id,
      name,
      value
    FROM admin_env_values_settings
    WHERE name = $1`
};
