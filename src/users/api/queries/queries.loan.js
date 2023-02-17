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
        loan_decision = $15
    WHERE loan_id = $1`
};
