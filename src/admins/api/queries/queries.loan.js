export default {
  fetchLoanDetailsById: `
    SELECT 
        id,
        loan_id,
        user_id,
        round(CAST(amount_requested AS NUMERIC), 2) AS amount_requested,
        loan_reason,
        loan_tenor_in_months,
        round(CAST(total_repayment_amount AS NUMERIC), 2) AS total_repayment_amount,
        round(CAST(total_interest_amount AS NUMERIC), 2) AS total_interest_amount,
        percentage_orr_score,
        percentage_pricing_band,
        round(CAST(monthly_interest AS NUMERIC), 2) AS monthly_interest,
        round(CAST(monthly_repayment AS NUMERIC), 2) AS monthly_repayment,
        round(CAST(total_outstanding_amount AS NUMERIC), 2) AS total_outstanding_amount,
        round(CAST(extra_interests AS NUMERIC), 2) AS extra_interests,
        status,
        loan_decision,
        is_loan_disbursed,
        to_char(DATE(loan_disbursed_at)::date, 'Mon DD, YYYY') AS loan_disbursed_at,
        rejection_reason
    FROM personal_loans
    WHERE loan_id = $1`,

  updateLoanStatus: `
    UPDATE personal_loans
    SET
        updated_at = NOW(),
        status = $2,
        rejection_reason = $3
    WHERE loan_id = $1
    RETURNING id, loan_id, status`,

  updateAdminLoanApprovalTrail: `
    INSERT INTO manual_personal_loan_approval_trail(
        loan_id,
        loan_applicant,
        decision,
        decided_by
    ) VALUES ($1, $2, $3, $4)`,

  fetchLoanRepaymentBreakdown: `
    SELECT 
      id,
      loan_id,
      user_id,
      repayment_order,
      round(CAST(total_payment_amount AS NUMERIC), 2) AS total_payment_amount,
      to_char(DATE(proposed_payment_date)::date, 'Mon DD, YYYY') AS expected_repayment_date,
      to_char(DATE(payment_at)::date, 'Mon DD, YYYY') AS payment_at,
      status
    FROM personal_loan_payment_schedules
    WHERE loan_id = $1
    ORDER BY repayment_order ASC
    `
};
  
